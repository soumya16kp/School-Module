import prisma from "../prismaClient";

export class EventRequestService {
  static async create(data: {
    eventId: number;
    schoolId: number;
    requesterId: number;
    personName?: string;
    personContact?: string;
    personDetails?: string;
  }) {
    return prisma.eventRequest.create({
      data: {
        eventId: data.eventId,
        schoolId: data.schoolId,
        requesterId: data.requesterId,
        personName: data.personName,
        personContact: data.personContact,
        personDetails: data.personDetails,
        status: "PENDING",
      },
    });
  }

  static async listAll() {
    return prisma.eventRequest.findMany({
      include: {
        event: true,
        school: true,
        requester: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateStatus(id: number, status: "APPROVED" | "REJECTED", officialNotes?: string) {
    return prisma.eventRequest.update({
      where: { id },
      data: {
        status,
        officialNotes,
      },
    });
  }
}
