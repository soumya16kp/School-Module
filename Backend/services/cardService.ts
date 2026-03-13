import crypto from "crypto";
import prisma from "../prismaClient";

export class CardService {
  static async ensureCardToken(childId: number): Promise<string> {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { cardToken: true },
    });
    if (!child) throw new Error("Child not found");
    if (child.cardToken) return child.cardToken;

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.child.update({
      where: { id: childId },
      data: { cardToken: token },
    });
    return token;
  }

  static async getByCardToken(token: string) {
    const child = await prisma.child.findUnique({
      where: { cardToken: token },
      include: {
        school: { select: { schoolName: true, city: true, state: true, academicYear: true } },
        healthRecords: {
          orderBy: { checkupDate: "desc" },
          take: 1,
          select: {
            bmiCategory: true,
            checkupDate: true,
            immunization: true,
            dentalOverallHealth: true,
            visionOverall: true,
          },
        },
      },
    });
    if (!child) return null;

    const latest = child.healthRecords[0];
    return {
      id: child.id,
      name: child.name,
      registrationNo: child.registrationNo,
      class: child.class,
      section: child.section,
      gender: child.gender,
      bloodGroup: child.bloodGroup,
      allergicTo: child.allergicTo,
      fatherNumber: child.fatherNumber,
      motherNumber: child.motherNumber,
      mobile: child.mobile,
      school: child.school,
      bmiCategory: latest?.bmiCategory ?? null,
      lastCheckupDate: latest?.checkupDate ?? null,
      immunization: latest?.immunization ?? false,
      dentalStatus: latest?.dentalOverallHealth ?? null,
      visionStatus: latest?.visionOverall ?? null,
    };
  }
}
