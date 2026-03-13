import prisma from "../prismaClient";

export class CertificationService {
  static async create(data: {
    schoolId: number;
    type: string;
    status: string;
    academicYear: string;
    issuedAt?: Date;
    validUntil?: Date;
    metadata?: object;
  }) {
    return prisma.certification.create({
      data: {
        schoolId: data.schoolId,
        type: data.type as any,
        status: data.status as any,
        academicYear: data.academicYear,
        issuedAt: data.issuedAt,
        validUntil: data.validUntil,
        metadata: data.metadata ?? undefined,
      },
      include: { school: { select: { id: true, schoolName: true } } },
    });
  }

  static async listBySchool(schoolId: number, academicYear?: string) {
    const where: { schoolId: number; academicYear?: string } = { schoolId };
    if (academicYear) where.academicYear = academicYear;

    return prisma.certification.findMany({
      where,
      orderBy: [{ academicYear: "desc" }, { createdAt: "desc" }],
      include: { school: { select: { id: true, schoolName: true } } },
    });
  }

  static async getById(id: number, schoolId: number) {
    return prisma.certification.findFirst({
      where: { id, schoolId },
      include: { school: true },
    });
  }

  static async update(
    id: number,
    schoolId: number,
    data: Partial<{
      type: string;
      status: string;
      academicYear: string;
      issuedAt: Date | null;
      validUntil: Date | null;
      metadata: object;
    }>
  ) {
    return prisma.certification.updateMany({
      where: { id, schoolId },
      data: {
        ...(data.type && { type: data.type as any }),
        ...(data.status && { status: data.status as any }),
        ...(data.academicYear && { academicYear: data.academicYear }),
        ...(data.issuedAt !== undefined && { issuedAt: data.issuedAt }),
        ...(data.validUntil !== undefined && { validUntil: data.validUntil }),
        ...(data.metadata !== undefined && { metadata: data.metadata }),
      },
    });
  }

  static async delete(id: number, schoolId: number) {
    return prisma.certification.deleteMany({
      where: { id, schoolId },
    });
  }
}
