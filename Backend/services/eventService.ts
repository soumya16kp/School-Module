import prisma from "../prismaClient";
import { InvoiceService } from "./invoiceService";
import { NotificationService } from "./notificationService";

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
    images?: any;
  }) {
    const evt = await prisma.event.create({
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
        images: data.images,
      },
      include: {
        ambassador: true,
        school: { select: { id: true, schoolName: true } },
        donations: true,
      },
    });

    if (data.scheduledAt) {
      NotificationService.notifyScheduledEvent(evt.id);
    }
    return evt;
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
      loggingCompletedAt?: string | Date;
      images?: any;
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
        ...(data.loggingCompletedAt !== undefined && { loggingCompletedAt: data.loggingCompletedAt }),
        ...(data.images !== undefined && { images: data.images }),
      },
    });

    // If attendanceJson contains student-level data, sync with Child.status and HealthRecords
    if (data.attendanceJson && (data.attendanceJson as any).studentStatuses) {
      const statuses = (data.attendanceJson as any).studentStatuses;
      const evt = await prisma.event.findFirst({ where: { id, schoolId }, select: { type: true, academicYear: true } });
      
      if (evt) {
        await Promise.all(
          Object.entries(statuses).map(async ([childId, status]) => {
            const cid = parseInt(childId);
            const attendanceStatus = status as string;
            
            // 1. Update overall student status
            await prisma.child.update({
              where: { id: cid, schoolId },
              data: { status: attendanceStatus === 'Present' ? 'Done' : 'Absent' }
            }).catch(() => {});

            // 2. Sync with HealthRecord if it's a medical event
            let updateData: any = {};
            if (evt.type === 'BMI_ASSESSMENT' || evt.type === 'GENERAL_CHECKUP') updateData.bmiStatus = attendanceStatus;
            if (evt.type === 'DENTAL_SCREENING' || evt.type === 'GENERAL_CHECKUP') updateData.dentalStatus = attendanceStatus;
            if (evt.type === 'VISION_SCREENING' || evt.type === 'GENERAL_CHECKUP') updateData.eyeStatus = attendanceStatus;

            if (Object.keys(updateData).length > 0) {
              const record = await prisma.healthRecord.findFirst({
                where: { childId: cid, academicYear: evt.academicYear }
              });

              if (record) {
                await prisma.healthRecord.update({
                  where: { id: record.id },
                  data: updateData
                });
              } else {
                await prisma.healthRecord.create({
                  data: {
                    childId: cid,
                    academicYear: evt.academicYear,
                    ...updateData
                  }
                });
              }
            }
          })
        );
      }
    }

    // If loggingCompletedAt is being set, trigger invoice generation
    if (data.loggingCompletedAt) {
      // Fetch full event details to send to InvoiceService
      const fullEvent = await prisma.event.findFirst({
        where: { id, schoolId },
        include: { 
          school: true, 
          ambassador: true,
          donations: {
            include: { user: true }
          }
        }
      });

      if (fullEvent) {
        // 1. Generate the shared invoice PDF
        const ambassadorToInclude = fullEvent.ambassador || { name: 'Institutional Expert', organization: 'WombTo18' };
        InvoiceService.generateEventConfirmation(fullEvent, fullEvent.school, ambassadorToInclude)
          .then(fileName => {
            // 2. Send to Ambassador (if exists)
            if (fullEvent.ambassador) {
              InvoiceService.sendToAmbassador(fullEvent, fileName);
            }

            // 3. Send to all Partners who donated to this event
            if (fullEvent.donations && fullEvent.donations.length > 0) {
              const uniquePartners = new Map();
              fullEvent.donations.forEach((d: any) => {
                if (d.user && d.user.role === 'PARTNER') {
                  uniquePartners.set(d.user.id, d.user);
                }
              });

              uniquePartners.forEach(partner => {
                InvoiceService.sendToPartner(fullEvent, partner, fileName);
              });
            }
          })
          .catch(err => console.error("Failed to generate/send event invoice:", err));
      }
    }

    // If scheduledAt is being set or updated, trigger notification
    if (data.scheduledAt) {
      NotificationService.notifyScheduledEvent(id);
    }

    return result;
  }

  static async delete(id: number, schoolId: number) {
    return prisma.event.deleteMany({
      where: { id, schoolId },
    });
  }
}
