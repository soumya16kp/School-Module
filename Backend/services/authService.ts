import prisma from "../prismaClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { dispatchNotification } from "./notificationService";

const JWT_SECRET = process.env["JWT_SECRET"] || "default_secret";
const SHOW_DEV_OTP = process.env.DEBUG_OTP === "true";
const EMAIL_DISABLED = process.env.DISABLE_EMAIL === "true";

export class AuthService {
  static async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || "SCHOOL_ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  /**
   * Step 1: Verify email + password, then send OTP to email.
   * Returns { sent: true }. When DISABLE_EMAIL=true (or in dev with no SMTP),
   * also returns devOtp so you can use it directly.
   */
  static async sendLoginOtp(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new Error("Invalid email or password.");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid email or password.");

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Remove any old OTPs for this email
    await prisma.otpCode.deleteMany({ where: { email } });

    await prisma.otpCode.create({
      data: { email, code, expiresAt },
    });

    // Dispatch OTP via configured channels (email + optional SMS/WhatsApp if phone exists).
    await dispatchNotification({
      eventType: "SCHOOL_LOGIN_OTP",
      recipients: [
        {
          email: user.email,
          phone: user.phone ?? undefined,
          label: "school_login_user",
        },
      ],
      channels: ["email", "sms", "whatsapp"],
      data: { code },
      metadata: { userId: user.id, email },
    });

    const showDevOtp = process.env.DEBUG_OTP === "true";
    const devOtp = showDevOtp ? { devOtp: code } : {};
    return { sent: true, ...devOtp };
  }

  /**
   * Step 2: Verify OTP and issue JWT.
   */
  static async verifyLoginOtp(email: string, code: string) {
    const otp = await prisma.otpCode.findFirst({
      where: { email, code },
      orderBy: { createdAt: "desc" },
    });
    if (!otp) throw new Error("Incorrect code. Please try again.");
    if (new Date() > otp.expiresAt) {
      await prisma.otpCode.deleteMany({ where: { email } });
      throw new Error("This code has expired. Please request a new one.");
    }

    await prisma.otpCode.deleteMany({ where: { email } });

    return AuthService.issueToken(email);
  }

  private static async issueToken(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { school: true },
    });
    if (!user) throw new Error("User not found.");

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.school?.id,
        assignedClass: user.assignedClass ?? undefined,
        assignedSection: user.assignedSection ?? undefined,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        school: user.school,
        assignedClass: user.assignedClass ?? undefined,
        assignedSection: user.assignedSection ?? undefined,
      },
    };
  }

  /** Legacy direct login – kept for internal/ops use only */
  static async login(data: any) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { school: true },
    });
    if (!user) throw new Error("User not found");
    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new Error("Invalid password");
    return AuthService.issueToken(data.email);
  }
}
