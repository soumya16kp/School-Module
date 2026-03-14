import prisma from "../prismaClient";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOtpSms } from "./smsService";

const JWT_SECRET = process.env["JWT_SECRET"] || "default_secret";
const IS_DEV = process.env.NODE_ENV !== "production";

export class ParentService {
  static async sendOtp(phone: string) {
    const children = await prisma.child.findMany({
      where: {
        OR: [{ fatherNumber: phone }, { motherNumber: phone }]
      }
    });
    if (children.length === 0) {
      throw new Error("No student record found with this phone number. Please contact the school.");
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await prisma.otpCode.create({
      data: { phone, code, expiresAt }
    });

    await sendOtpSms(phone, code);

    return { sent: true, ...(IS_DEV && !process.env.SMS_PROVIDER ? { devOtp: code } : {}) };
  }

  static async verifyOtp(phone: string, code: string) {
    const otp = await prisma.otpCode.findFirst({
      where: { phone, code },
      orderBy: { createdAt: "desc" }
    });
    if (!otp) throw new Error("Invalid OTP. Please try again.");
    if (new Date() > otp.expiresAt) {
      await prisma.otpCode.deleteMany({ where: { phone } });
      throw new Error("OTP expired. Please request a new code.");
    }
    await prisma.otpCode.deleteMany({ where: { phone } });
    return ParentService.login(phone);
  }

  static async login(phone: string) {
    const JWT_SECRET = process.env["JWT_SECRET"] || "default_secret";
    const children = await prisma.child.findMany({
      where: {
        OR: [
          { fatherNumber: phone },
          { motherNumber: phone }
        ]
      },
      include: {
        school: true
      }
    });

    if (children.length === 0) {
      throw new Error("No student record found with this phone number. Please contact the school.");
    }

    const token = jwt.sign(
      { phone, role: 'PARENT', childIds: children.map((c: any) => c.id) },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      parent: { phone },
      children: children.map((c: any) => ({
        id: c.id,
        name: c.name,
        registrationNo: c.registrationNo,
        class: c.class,
        section: c.section,
        schoolName: c.school.schoolName
      }))
    };
  }

  static async getChildDashboard(childId: number, phone: string) {
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        OR: [
          { fatherNumber: phone },
          { motherNumber: phone }
        ]
      },
      include: {
        school: true,
        healthRecords: {
          orderBy: { academicYear: 'desc' }
        }
      }
    });

    if (!child) {
      throw new Error("Unauthorized access or child not found");
    }

    // Get relevant events (upcoming checkups or drills)
    const upcomingEvents = await prisma.event.findMany({
      where: {
        schoolId: child.schoolId,
        scheduledAt: { gte: new Date() }
      },
      take: 5,
      orderBy: { scheduledAt: 'asc' }
    });

    const notifications: Array<{ type: string; title: string; message: string; date?: string; priority: 'high' | 'medium' | 'low' }> = [];
    for (const evt of upcomingEvents) {
      notifications.push({
        type: 'upcoming',
        title: evt.title,
        message: `Scheduled for ${evt.scheduledAt ? new Date(evt.scheduledAt).toLocaleDateString() : 'TBD'}`,
        date: evt.scheduledAt ? new Date(evt.scheduledAt).toISOString() : undefined,
        priority: 'medium'
      });
    }
    const latest = child.healthRecords[0];
    if (latest) {
      if (latest.dentalReferralNeeded) {
        notifications.push({
          type: 'referral',
          title: 'Dental referral recommended',
          message: (latest as any).dentalReferralReason || 'Follow-up dental care recommended',
          date: latest.checkupDate ? new Date(latest.checkupDate).toISOString() : undefined,
          priority: 'high'
        });
      }
      if (latest.visionReferralNeeded) {
        notifications.push({
          type: 'referral',
          title: 'Vision referral recommended',
          message: (latest as any).visionNotes || 'Follow-up eye care recommended',
          date: latest.checkupDate ? new Date(latest.checkupDate).toISOString() : undefined,
          priority: 'high'
        });
      }
      const bmiCat = latest.bmiCategory;
      if (bmiCat && ['OVERWEIGHT', 'OBESE', 'UNDERWEIGHT'].includes(bmiCat)) {
        notifications.push({
          type: 'finding',
          title: `BMI: ${bmiCat}`,
          message: 'Consider consulting a healthcare provider for dietary or growth guidance.',
          date: latest.checkupDate ? new Date(latest.checkupDate).toISOString() : undefined,
          priority: 'high'
        });
      }
    }

    return {
      child: {
        id: child.id,
        name: child.name,
        registrationNo: child.registrationNo,
        class: child.class,
        section: child.section,
        school: {
          name: child.school.schoolName,
          address: child.school.address,
          city: child.school.city
        }
      },
      healthRecords: child.healthRecords,
      upcomingEvents,
      notifications: notifications.slice(0, 10)
    };
  }
}
