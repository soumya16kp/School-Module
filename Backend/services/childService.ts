import prisma from "../prismaClient";

export class ChildService {
  static async createChild(data: any, schoolId: number) {
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0]?.replace(/-/g, "") || "";
    const state = data.stateCode || "KA";
    
    // Sequence Logic - Per School
    const count = await prisma.child.count({ where: { schoolId } });
    const sequence = (count + 1).toString().padStart(4, "0");
    // Format: CHD-STATE-DATE-SCHOOLID-SEQ (More unique)
    const registrationNo = `CHD-${state}-${dateStr}-${schoolId}-${sequence}`;

    return prisma.child.create({
      data: {
        registrationNo,
        name: data.name,
        class: parseInt(data.class),
        section: data.section,
        fatherNumber: data.fatherNumber,
        motherNumber: data.motherNumber,
        emailId: data.emailId,
        mobile: data.mobile,
        gender: data.gender,
        status: data.status || "Pending",
        notes: data.notes,
        schoolId: schoolId,
      },
    });
  }

  static async getChildrenBySchool(schoolId: number, search?: string, teacherClass?: number, teacherSection?: string) {
    const isNumericSearch = !isNaN(parseInt(search || ""));
    return prisma.child.findMany({
      where: {
        schoolId: schoolId,
        class: teacherClass !== undefined ? teacherClass : undefined,
        section: teacherSection !== undefined ? teacherSection : undefined,
        OR: search ? [
          { name: { contains: search } },
          { section: { contains: search } },
          { mobile: { contains: search } },
          ...(isNumericSearch ? [{ class: { equals: parseInt(search || "0") } }] : [])
        ] : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async updateChildStatus(childId: number, status: string) {
    return prisma.child.update({
      where: { id: childId },
      data: { status },
    });
  }

  static async updateChild(childId: number, data: any) {
    return prisma.child.update({
      where: { id: childId },
      data: {
        name: data.name,
        class: typeof data.class !== 'undefined' ? parseInt(data.class) : undefined,
        section: data.section,
        fatherNumber: data.fatherNumber,
        motherNumber: data.motherNumber,
        emailId: data.emailId,
        mobile: data.mobile,
        gender: data.gender,
        notes: data.notes,
      },
    });
  }

  static async getChildWithAttendance(childId: number, schoolId: number) {
    const child = await prisma.child.findFirst({
      where: { id: childId, schoolId },
      include: {
        healthRecords: {
          orderBy: { academicYear: 'desc' }
        }
      }
    });

    if (!child) return null;

    // Fetch all events for the school to find attendance
    const events = await prisma.event.findMany({
      where: { schoolId },
      orderBy: { scheduledAt: 'desc' }
    });

    const attendanceHistory = events.map((ev: any) => {
      const attJson = ev.attendanceJson as any;
      const status = attJson?.studentStatuses?.[childId] || (ev.completedAt ? 'Present' : 'Scheduled'); 
      return {
        eventId: ev.id,
        title: ev.title,
        type: ev.type,
        scheduledAt: ev.scheduledAt,
        completedAt: ev.completedAt,
        status: status
      };
    }).filter((e: any) => e.status !== 'Scheduled' || e.scheduledAt); // Keep future scheduled events or completed ones

    return { ...child, attendanceHistory };
  }
}
