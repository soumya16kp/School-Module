import prisma from "../prismaClient";
import { InvoiceService } from "./invoiceService";

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
    goalAmount?: number;
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
        goalAmount: data.goalAmount ?? 0,
      },
      include: {
        ambassador: true,
        school: { select: { id: true, schoolName: true } },
        donations: true,
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
        donations: true,
      },
    });
  }

  static async getById(id: number, schoolId: number) {
    return prisma.event.findFirst({
      where: { id, schoolId },
      include: {
        ambassador: true,
        school: true,
        donations: true,
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
      goalAmount: number;
    }>
  ) {
    const result = await prisma.event.updateMany({
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
        ...(data.goalAmount !== undefined && { goalAmount: data.goalAmount }),
      },
    });

    // If attendanceJson contains student-level data, sync with Child.status
    if (data.attendanceJson && (data.attendanceJson as any).studentStatuses) {
      const statuses = (data.attendanceJson as any).studentStatuses;
      // We perform updates sequentially or use Promise.all. 
      // For large schools, batching might be better, but child-by-child is safer for now.
      await Promise.all(
        Object.entries(statuses).map(([childId, status]) => {
          return prisma.child.update({
            where: { id: parseInt(childId), schoolId },
            data: { status: status === 'Present' ? 'Done' : 'Absent' }
          }).catch((err: any) => console.error(`Failed to sync status for child ${childId}`, err));
        })
      );
    }

    // If completedAt is being set, trigger invoice generation
    if (data.completedAt) {
      // Fetch full event details to send to InvoiceService
      const fullEvent = await prisma.event.findFirst({
        where: { id, schoolId },
        include: { school: true, ambassador: true }
      });

      if (fullEvent && fullEvent.ambassador) {
        InvoiceService.generateEventConfirmation(fullEvent, fullEvent.school, fullEvent.ambassador)
          .then(fileName => {
            InvoiceService.sendToAmbassador(fullEvent, fileName);
          })
          .catch(err => console.error("Failed to generate event invoice:", err));
      }
    }

    return result;
  }

  static async delete(id: number, schoolId: number) {
    return prisma.event.deleteMany({
      where: { id, schoolId },
    });
  }
}
