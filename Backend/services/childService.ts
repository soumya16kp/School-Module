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
        fatherName: data.fatherName,
        motherName: data.motherName,
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
      include: {
        healthRecords: {
          orderBy: { academicYear: 'desc' },
          take: 1
        }
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
        fatherName: data.fatherName,
        motherName: data.motherName,
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

    const wellnessHistory = events.map((ev: any) => {
      const attJson = ev.attendanceJson as any;
      let status = 'Scheduled';
      if (ev.completedAt) {
        const studentStatuses = attJson?.studentStatuses || {};
        status = studentStatuses[childId] || studentStatuses[childId.toString()] || 'Absent';
      }
      return {
        eventId: ev.id,
        title: ev.title,
        type: ev.type,
        scheduledAt: ev.scheduledAt,
        completedAt: ev.completedAt,
        status: status
      };
    }).filter((e: any) => e.status !== 'Scheduled' || e.scheduledAt);

    const wellnessTypes = ['MENTAL_WELLNESS', 'IMMUNIZATION_DEWORMING', 'IMMUNIZATION', 'NUTRITION_SESSION', 'HYGIENE_WELLNESS'];
    const activityHistory = wellnessHistory.filter((h: any) => !wellnessTypes.includes(h.type));
    
    // Robust check for student status (handles numeric and string keys)
    const getStudentStatus = (statusObj: any, cid: number) => {
      if (!statusObj) return null;
      return statusObj[cid] || statusObj[cid.toString()];
    };

    const deriveWellness = (types: string[]) => {
      // Find the most recent event of these types (completed or not)
      const latest = wellnessHistory.find((h: any) => types.includes(h.type));
      if (!latest) return { status: 'Not Scheduled', date: null };
      
      if (!latest.completedAt) return { status: 'Scheduled', date: latest.scheduledAt };

      return { 
        status: (latest.status === 'Present' || latest.status === 'Done') ? 'Attended' : 'Not Attended', 
        date: latest.completedAt 
      };
    };

    const wellnessStatus = {
        mental: deriveWellness(['MENTAL_WELLNESS']),
        immunization: deriveWellness(['IMMUNIZATION_DEWORMING', 'IMMUNIZATION']),
        nutrition: deriveWellness(['NUTRITION_SESSION']),
        hygiene: deriveWellness(['HYGIENE_WELLNESS'])
    };

    return { ...child, activityHistory, wellnessStatus };
  }

  static async updateAttendance(childId: number, schoolId: number, eventType: string, status: string) {
    // Find the latest event of this type for the school
    let event = await prisma.event.findFirst({
      where: { schoolId, type: eventType as any },
      orderBy: { createdAt: 'desc' }
    });

    if (!event) {
      // Create a default event if none exists so we can log attendance
      const school = await prisma.school.findUnique({ where: { id: schoolId } });
      event = await prisma.event.create({
        data: {
          schoolId,
          type: eventType as any,
          title: eventType.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' '),
          academicYear: school?.academicYear || "",
          scheduledAt: new Date(),
          completedAt: new Date(),
          attendanceJson: { studentStatuses: {} }
        }
      });
    }

    const attJson = (event.attendanceJson as any) || { studentStatuses: {} };
    if (!attJson.studentStatuses) attJson.studentStatuses = {};
    
    attJson.studentStatuses[childId.toString()] = status;

    return prisma.event.update({
      where: { id: event.id },
      data: { 
        attendanceJson: attJson,
        completedAt: event.completedAt || new Date()
      }
    });
  }
}
