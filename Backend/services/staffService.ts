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

  static async updateStaff(userId: number, data: any) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        assignedClass: data.assignedClass ? parseInt(data.assignedClass) : null,
        assignedSection: data.assignedSection || null,
      }
    });
  }

  static async removeStaff(userId: number) {
    return prisma.user.delete({
      where: { id: userId }
    });
  }
}
