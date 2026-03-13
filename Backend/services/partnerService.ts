import prisma from "../prismaClient";

export class PartnerService {
  static async sponsor(partnerId: number, data: any) {
    const donation = await prisma.donation.create({
      data: {
        partnerId,
        schoolId: data.schoolId,
        eventId: data.eventId,
        amount: data.amount,
        type: data.type, // "EVENT", "CHECKUP", "GENERAL"
        status: "COMPLETED", // Simplified for dummy checkout
        description: data.description,
      },
    });
    return donation;
  }

  static async getDonations(partnerId: number) {
    return prisma.donation.findMany({
      where: { partnerId },
      include: {
        school: true,
        event: true,
      },
      orderBy: { date: "desc" },
    });
  }

  static async getAllSchools() {
    return prisma.school.findMany({
      include: {
        events: true,
      }
    });
  }
}
