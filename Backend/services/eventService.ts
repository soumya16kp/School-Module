import prisma from "../prismaClient";

export class EventService {
  static async create(data: {
    schoolId: number;
    type: string;
    title: string;
    description?: string;
    academicYear: string;
    scheduledAt?: Date;
    completedAt?: Date;
    attendanceJson?: object;
    ambassadorId?: number;
  }) {
    return prisma.event.create({
      data: {
        schoolId: data.schoolId,
        type: data.type as any,
        title: data.title,
        description: data.description,
        academicYear: data.academicYear,
        scheduledAt: data.scheduledAt,
        completedAt: data.completedAt,
        attendanceJson: data.attendanceJson ?? undefined,
        ambassadorId: data.ambassadorId,
      },
      include: {
        ambassador: true,
        school: { select: { id: true, schoolName: true } },
      },
    });
  }

  static async listBySchool(schoolId: number, academicYear?: string) {
    const where: { schoolId: number; academicYear?: string } = { schoolId };
    if (academicYear) where.academicYear = academicYear;

    return prisma.event.findMany({
      where,
      orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
      include: {
        ambassador: { select: { id: true, name: true, type: true } },
        school: { select: { id: true, schoolName: true } },
      },
    });
  }

  static async getById(id: number, schoolId: number) {
    return prisma.event.findFirst({
      where: { id, schoolId },
      include: {
        ambassador: true,
        school: true,
      },
    });
  }

  static async update(
    id: number,
    schoolId: number,
    data: Partial<{
      type: string;
      title: string;
      description: string;
      academicYear: string;
      scheduledAt: Date;
      completedAt: Date;
      attendanceJson: object;
      ambassadorId: number | null;
    }>
  ) {
    return prisma.event.updateMany({
      where: { id, schoolId },
      data: {
        ...(data.type && { type: data.type as any }),
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.academicYear && { academicYear: data.academicYear }),
        ...(data.scheduledAt !== undefined && { scheduledAt: data.scheduledAt }),
        ...(data.completedAt !== undefined && { completedAt: data.completedAt }),
        ...(data.attendanceJson !== undefined && { attendanceJson: data.attendanceJson }),
        ...(data.ambassadorId !== undefined && { ambassadorId: data.ambassadorId }),
      },
    });
  }

  static async delete(id: number, schoolId: number) {
    return prisma.event.deleteMany({
      where: { id, schoolId },
    });
  }
}
