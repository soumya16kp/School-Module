import prisma from "../prismaClient";

export class SchoolService {
  static async registerSchool(data: any, userId: number) {
    console.log("Attempting school registration for user:", userId);
    console.log("Registration data received:", JSON.stringify(data, null, 2));

    // Registration number format: SCH-{STATE_CODE}-{YYYYMMDD}-{6-digit random}
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0]?.replace(/-/g, "") || "";
    const state = data.stateCode || "XX";
    const sixDigit = Math.floor(100000 + Math.random() * 900000).toString();
    const registrationNo = `SCH-${state}-${dateStr}-${sixDigit}`;

    // Prevent P2002 Unique constraint fail on schoolEmail
    const existingEmail = await prisma.school.findUnique({
      where: { schoolEmail: data.schoolEmail }
    });
    if (existingEmail) {
      throw new Error(`A school with the email ${data.schoolEmail} is already registered.`);
    }

    const studentStrength = parseInt(data.studentStrength);
    try {
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
          studentStrength: isNaN(studentStrength) ? 0 : studentStrength,
          address: data.address,
          state: data.state,
          city: data.city,
          pincode: data.pincode,
          pocName: data.pocName,
          pocDesignation: data.pocDesignation,
          pocMobile: data.pocMobile,
          pocEmail: data.pocEmail,
          ptaName: data.ptaName,
          ptaDesignation: data.ptaDesignation,
          ptaMobile: data.ptaMobile,
          academicYear: data.academicYear || "2024-2025",
          channel: data.channel || "DIRECT",
          annualCreditGoal: 50000, // Matching the schema default or higher
          users: {
            connect: { id: Number(userId) }
          }
        },
      });
      return school;
    } catch (createError: any) {
      console.error("Prisma create error for school:", createError);
      throw createError;
    }
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
        
        // Emergency
        fireDeptName: data.fireDeptName,
        fireDeptContact: data.fireDeptContact,
        fireDeptImage: data.fireDeptImage,
        policeName: data.policeName,
        policeContact: data.policeContact,
        policeImage: data.policeImage,
        ndrfName: data.ndrfName,
        ndrfContact: data.ndrfContact,
        ndrfImage: data.ndrfImage,

        // Health
        nurseName: data.nurseName,
        nurseContact: data.nurseContact,
        nurseImage: data.nurseImage,
        gynecologistName: data.gynecologistName,
        gynecologistContact: data.gynecologistContact,
        gynecologistImage: data.gynecologistImage,
        pediatricianName: data.pediatricianName,
        pediatricianContact: data.pediatricianContact,
        pediatricianImage: data.pediatricianImage,

        ptaName: data.ptaName,
        ptaMobile: data.ptaMobile,
        ptaDesignation: data.ptaDesignation,

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
