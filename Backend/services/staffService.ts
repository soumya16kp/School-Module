import prisma from "../prismaClient";
import bcrypt from "bcrypt";

export class StaffService {
  static async addStaff(schoolId: number, data: any) {
    const hashedPassword = await bcrypt.hash(data.password || "staff123", 10);
    
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role, // CLASS_TEACHER or STAFF
        schoolId: schoolId,
        assignedClass: data.assignedClass ? parseInt(data.assignedClass) : null,
        assignedSection: data.assignedSection || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        assignedClass: true,
        assignedSection: true,
      }
    });
  }

  static async listStaff(schoolId: number) {
    return prisma.user.findMany({
      where: { 
        schoolId,
        role: { in: ['CLASS_TEACHER', 'STAFF'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        assignedClass: true,
        assignedSection: true,
        createdAt: true
      }
    });
  }

  static async updateStaff(userId: number, schoolId: number, data: any) {
    const existing = await prisma.user.findFirst({ where: { id: userId, schoolId } });
    if (!existing) return null;
    const payload: any = {};
    if (data.name != null) payload.name = data.name;
    if (data.phone != null) payload.phone = data.phone;
    if (data.role != null && ['CLASS_TEACHER', 'STAFF'].includes(data.role)) payload.role = data.role;
    if (data.assignedClass !== undefined) payload.assignedClass = data.assignedClass ? parseInt(String(data.assignedClass)) : null;
    if (data.assignedSection !== undefined) payload.assignedSection = data.assignedSection || null;
    return prisma.user.update({
      where: { id: userId },
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        assignedClass: true,
        assignedSection: true,
        createdAt: true
      }
    });
  }

  static async removeStaff(userId: number, schoolId: number) {
    const existing = await prisma.user.findFirst({ where: { id: userId, schoolId } });
    if (!existing) return null;
    return prisma.user.delete({
      where: { id: userId }
    });
  }
}
