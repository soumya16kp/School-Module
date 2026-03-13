import prisma from "../prismaClient";

export class SchoolService {
  static async registerSchool(data: any, userId: number) {
    // Generate Registration ID: SCH-WB-20250805-000056
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0]?.replace(/-/g, "") || "";
    const state = data.stateCode || "WB";
    
    // Simple sequence logic for demonstration
    const count = await prisma.school.count();
    const sequence = (count + 1).toString().padStart(6, "0");
    const registrationNo = `SCH-${state}-${dateStr}-${sequence}`;

    const school = await prisma.school.create({
      data: {
        registrationNo,
        schoolName: data.schoolName,
        udiseCode: data.udiseCode,
        schoolType: data.schoolType,
        boardAffiliation: data.boardAffiliation,
        principalName: data.principalName,
        principalContact: data.principalContact,
        schoolEmail: data.schoolEmail,
        studentStrength: parseInt(data.studentStrength),
        address: data.address,
        state: data.state,
        city: data.city,
        pincode: data.pincode,
        pocName: data.pocName,
        pocDesignation: data.pocDesignation,
        pocMobile: data.pocMobile,
        pocEmail: data.pocEmail,
        academicYear: data.academicYear,
        channel: data.channel,
        user: {
          connect: { id: userId }
        }
      },
    });

    return school;
  }

  static async getSchoolByUserId(userId: number) {
    return prisma.school.findFirst({
      where: {
        user: {
          id: userId
        }
      }
    });
  }

  static async getAllSchools() {
    return prisma.school.findMany();
  }
}
