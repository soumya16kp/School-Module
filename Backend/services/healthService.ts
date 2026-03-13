import prisma from "../prismaClient";

// Service for student health records (PRD Module A – Preventive Health)
export class HealthService {
  static async addRecord(childId: number, data: any) {
    const toFloatOrNull = (value: any): number | null => {
      if (value === undefined || value === null || value === "") return null;
      const parsed = parseFloat(value);
      return Number.isNaN(parsed) ? null : parsed;
    };

    const toBool = (value: any): boolean => {
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return value !== 0;
      if (typeof value === "string") {
        const v = value.toLowerCase();
        return ["true", "1", "yes", "y", "on", "attended"].includes(v);
      }
      return false;
    };

    const height = toFloatOrNull(data.height);
    const weight = toFloatOrNull(data.weight);

    let bmi = toFloatOrNull(data.bmi);
    if ((bmi === null || bmi === undefined) && height && weight) {
      const hMeters = height / 100; // height is in cm
      if (hMeters > 0) {
        const computed = weight / (hMeters * hMeters);
        bmi = Number.isFinite(computed) ? parseFloat(computed.toFixed(2)) : null;
      }
    }

    const deriveBmiCategory = (value: number | null): string | null => {
      if (value == null || !Number.isFinite(value)) return null;
      if (value < 18.5) return "UNDERWEIGHT";
      if (value < 25) return "NORMAL";
      if (value < 30) return "OVERWEIGHT";
      return "OBESE";
    };

    const bmiCategory = data.bmiCategory || deriveBmiCategory(bmi);

    return prisma.healthRecord.create({
      data: {
        childId,
        academicYear: data.academicYear,
        checkupDate: data.checkupDate ? new Date(data.checkupDate) : null,

        // Anthropometry / BMI
        height,
        weight,
        bmi,
        bmiPercentile: toFloatOrNull(data.bmiPercentile),
        bmiCategory,

        // Dental screening
        dentalCariesIndex: toFloatOrNull(data.dentalCariesIndex),
        dentalHygieneScore: data.dentalHygieneScore || null,
        dentalOverallHealth: data.dentalOverallHealth || null,
        dentalReferralNeeded: data.dentalReferralNeeded != null ? toBool(data.dentalReferralNeeded) : false,
        dentalReferralReason: data.dentalReferralReason || null,
        dentalNotes: data.dentalNotes || null,

        // Vision screening
        eyeCheckup: data.eyeCheckup || null,
        eyeVisionLeft: data.eyeVisionLeft || null,
        eyeVisionRight: data.eyeVisionRight || null,
        visionOverall: data.visionOverall || null,
        visionReferralNeeded: data.visionReferralNeeded != null ? toBool(data.visionReferralNeeded) : false,
        visionNotes: data.visionNotes || null,

        // Program attendance (checkbox-style)
        immunization: toBool(data.immunization),
        mentalWellness: toBool(data.mentalWellness),
        nutrition: toBool(data.nutrition),
        menstrualHygiene: toBool(data.menstrualHygiene),

        reportFile: data.reportFile || null,
      },
    });
  }

  static async getRecordsForChild(childId: number) {
    return prisma.healthRecord.findMany({
      where: { childId },
      orderBy: { createdAt: "asc" }, // Ascending for charts over time
    });
  }
}
