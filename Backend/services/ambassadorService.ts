import prisma from "../prismaClient";

export class AmbassadorService {
  static async create(data: {
    schoolId: number | null;
    type: string;
    name: string;
    organization?: string;
    phone?: string;
    email?: string;
    serviceArea?: string;
    active?: boolean;
    notes?: string;
    image?: string;
  }) {
    return prisma.ambassadorDirectory.create({
      data: {
        schoolId: data.schoolId,
        type: data.type as any,
        name: data.name,
        organization: data.organization,
        phone: data.phone,
        email: data.email,
        serviceArea: data.serviceArea,
        active: data.active ?? true,
        notes: data.notes,
        image: data.image,
      },
    });
  }

  static async listBySchool(schoolId: number, type?: string) {
    const where: { schoolId: number | null; type?: string } = { schoolId };
    if (type) where.type = type as any;

    return prisma.ambassadorDirectory.findMany({
      where,
      orderBy: { name: "asc" },
    });
  }

  static async listGlobal(type?: string) {
    const where: { schoolId: null; type?: string } = { schoolId: null };
    if (type) where.type = type as any;

    return prisma.ambassadorDirectory.findMany({
      where,
      orderBy: { name: "asc" },
    });
  }

  static async listForSchool(schoolId: number, type?: string) {
    // Fetch the querying school's general donations first
    const currentSchool = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        donations: {
          where: { eventId: null },
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    const where: { OR: { schoolId: number | null }[]; type?: string } = {
      OR: [{ schoolId }, { schoolId: null }],
    };
    if (type) where.type = type as any;

    const ambassadors = await prisma.ambassadorDirectory.findMany({
      where,
      include: {
        school: {
          include: {
            donations: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            }
          }
        },
        events: {
          include: {
            donations: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { name: "asc" },
    });

    console.log(`AmbassadorService - Fetched ${ambassadors.length} records. Current school context ID: ${schoolId}`);

    // If an ambassador is global (no schoolId), we "virtualize" the current school context 
    // so they show the sponsors of the school the user is currently viewing.
    return ambassadors.map((a: any) => {
      // If it's a global ambassador, or they don't have school donations attached yet, give them the current context
      if ((!a.schoolId || !a.school) && currentSchool) {
        return { ...a, school: currentSchool };
      }
      return a;
    });
  }

  static async getById(id: number, schoolId: number | null) {
    const where =
      schoolId != null
        ? { id, OR: [{ schoolId }, { schoolId: null }] }
        : { id };
    return prisma.ambassadorDirectory.findFirst({
      where: where as any,
      include: { events: { select: { id: true, title: true, type: true } } },
    });
  }

  static async update(
    id: number,
    schoolId: number | null,
    data: Partial<{
      type: string;
      name: string;
      organization: string;
      phone: string;
      email: string;
      serviceArea: string;
      active: boolean;
      notes: string;
      image: string;
    }>
  ) {
    const where =
      schoolId != null
        ? { id, OR: [{ schoolId }, { schoolId: null }] }
        : { id };
    return prisma.ambassadorDirectory.updateMany({
      where: where as any,
      data: {
        ...(data.type && { type: data.type as any }),
        ...(data.name && { name: data.name }),
        ...(data.organization !== undefined && { organization: data.organization }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.serviceArea !== undefined && { serviceArea: data.serviceArea }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.image !== undefined && { image: data.image }),
      },
    });
  }

  static async delete(id: number, schoolId: number | null) {
    const where =
      schoolId != null
        ? { id, OR: [{ schoolId }, { schoolId: null }] }
        : { id };
    return prisma.ambassadorDirectory.deleteMany({
      where: where as any,
    });
  }
}
