import prisma from "../prismaClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "default_secret";

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
          role: true
      }
    });
  }

  static async login(data: any) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { school: true }
    });

    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new Error("Invalid password");

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        schoolId: user.school?.id,
        assignedClass: user.assignedClass,
        assignedSection: user.assignedSection
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
        assignedClass: user.assignedClass,
        assignedSection: user.assignedSection,
        school: user.school
      },
    };
  }
}
