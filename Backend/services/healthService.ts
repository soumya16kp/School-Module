import prisma from "../prismaClient";

export class HealthService {
  static async addRecord(childId: number, data: any) {
    return prisma.healthRecord.create({
      data: {
        childId,
        academicYear: data.academicYear,
        checkupDate: data.checkupDate ? new Date(data.checkupDate) : null,
        height: parseFloat(data.height),
        weight: data.weight,
        bmi: data.bmi,
        dentalCheckup: data.dentalCheckup,
        dentalCavities: data.dentalCavities ? parseInt(data.dentalCavities) : null,
        dentalOverallHealth: data.dentalOverallHealth,
        eyeCheckup: data.eyeCheckup,
        eyeVisionLeft: data.eyeVisionLeft,
        eyeVisionRight: data.eyeVisionRight,
        immunization: data.immunization === 'true' || data.immunization === true || data.immunization === 'Attended',
        mentalWellness: data.mentalWellness === 'true' || data.mentalWellness === true || data.mentalWellness === 'Attended',
        nutrition: data.nutrition === 'true' || data.nutrition === true || data.nutrition === 'Attended',
        menstrualHygiene: data.menstrualHygiene === 'true' || data.menstrualHygiene === true || data.menstrualHygiene === 'Attended',
        reportFile: data.reportFile
      },
    });
  }

  static async getRecordsForChild(childId: number) {
    return prisma.healthRecord.findMany({
      where: { childId },
      orderBy: { createdAt: 'asc' }, // Ascending for charts over time
    });
  }
}
