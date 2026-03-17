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
        annualCreditGoal: 5000, // Initial goal to unlock program assignments
        users: {
          connect: { id: userId }
        }
      },
    });

    return school;
  }

  static async getSchoolByUserId(userId: number) {
    const school = await prisma.school.findFirst({
      where: {
        users: {
          some: { id: userId }
        }
      },
      include: {
        donations: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        events: true,
      }
    });

    if (school) {
        // Fallback for annualCreditGoal if it doesn't exist or is null
        (school as any).annualCreditGoal = (school as any).annualCreditGoal || 50000;
    }
    return school;
  }

  static async getAllSchools() {
    return prisma.school.findMany();
  }

  static async updateSchool(schoolId: number, data: any) {
    return prisma.school.update({
      where: { id: schoolId },
      data: {
        schoolName: data.schoolName,
        udiseCode: data.udiseCode,
        schoolType: data.schoolType,
        boardAffiliation: data.boardAffiliation,
        principalName: data.principalName,
        principalContact: data.principalContact,
        principalImage: data.principalImage,
        vicePrincipalName: data.vicePrincipalName,
        vicePrincipalContact: data.vicePrincipalContact,
        vicePrincipalImage: data.vicePrincipalImage,
        nurseCounsellorName: data.nurseCounsellorName,
        nurseCounsellorContact: data.nurseCounsellorContact,
        nurseCounsellorImage: data.nurseCounsellorImage,
        studentStrength: data.studentStrength ? parseInt(data.studentStrength) : undefined,
        address: data.address,
        state: data.state,
        city: data.city,
        pincode: data.pincode,
        pocName: data.pocName,
        pocDesignation: data.pocDesignation,
        pocMobile: data.pocMobile,
        pocEmail: data.pocEmail,
        academicYear: data.academicYear,
        annualCreditGoal: data.annualCreditGoal ? parseFloat(data.annualCreditGoal) : undefined,
      },
    });
  }
}
