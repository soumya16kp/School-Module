import prisma from "../prismaClient";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "default_secret";

export class ParentService {
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
      upcomingEvents
    };
  }
}
