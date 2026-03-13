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

  static async getChildrenBySchool(schoolId: number, search?: string) {
    const isNumericSearch = !isNaN(parseInt(search || ""));
    return prisma.child.findMany({
      where: {
        schoolId: schoolId,
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
}
