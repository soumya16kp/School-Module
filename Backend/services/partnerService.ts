import prisma from "../prismaClient";
import crypto from "crypto";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export class PartnerService {
  /** Get or create partner invite link. Partner must have role=PARTNER. */
  static async getOrCreateInviteLink(partnerId: number) {
    const user = await prisma.user.findUnique({
      where: { id: partnerId, role: "PARTNER" },
      select: { partnerInviteToken: true },
    });
    if (!user) throw new Error("Partner not found.");

    let token = user.partnerInviteToken;
    if (!token) {
      token = crypto.randomBytes(16).toString("hex");
      await prisma.user.update({
        where: { id: partnerId },
        data: { partnerInviteToken: token },
      });
    }

    const url = `${FRONTEND_URL}/register-school?ref=${token}`;
    return { url, token };
  }

  /** Validate ref token (public). Returns partner name if valid. */
  static async validatePartnerRef(ref: string) {
    if (!ref || typeof ref !== "string") return { valid: false, partnerName: null };
    const user = await prisma.user.findUnique({
      where: { partnerInviteToken: ref.trim(), role: "PARTNER" },
      select: { name: true },
    });
    if (!user) return { valid: false, partnerName: null };
    return { valid: true, partnerName: user.name };
  }

  /** Get schools onboarded by this partner (registered via their invite link). */
  static async getOnboardedSchools(partnerId: number) {
    return prisma.school.findMany({
      where: { registeredViaPartnerId: partnerId },
      select: {
        id: true,
        schoolName: true,
        registrationNo: true,
        city: true,
        state: true,
        schoolType: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async sponsor(partnerId: number, data: any) {
    const donation = await prisma.donation.create({
      data: {
        partnerId,
        schoolId: data.schoolId,
        eventId: data.eventId,
        amount: data.amount,
        type: data.type,
        status: "COMPLETED",
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
    const schools = await prisma.school.findMany({
      include: {
        events: true,
        donations: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        ambassadors: true,
      }
    });

    return schools.map((school: any) => {
      const totalSponsoredAmount = school.donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
      return { ...school, totalSponsoredAmount };
    });
  }

  static async getSchoolHealthStats(schoolId: number) {
    const children = await prisma.child.findMany({
      where: { schoolId },
      include: { healthRecords: true },
    });

    type YearStat = {
      totalStudents: number;
      generalCheckup:    { conducted: boolean; checked: number; referrals: number };
      eyeScreening:      { conducted: boolean; checked: number; referrals: number };
      dentalCheckup:     { conducted: boolean; checked: number; referrals: number };
      bmiAssessment:     { conducted: boolean; checked: number; referrals: number };
      menstrualWellness: { conducted: boolean; checked: number };
      immunization:      { conducted: boolean; checked: number };
      mentalWellness:    { conducted: boolean; checked: number };
      nutrition:         { conducted: boolean; checked: number };
    };

    const yearMap: Record<string, YearStat> = {};

    const ensureYear = (year: string) => {
      if (!yearMap[year]) {
        yearMap[year] = {
          totalStudents: 0,
          generalCheckup:    { conducted: false, checked: 0, referrals: 0 },
          eyeScreening:      { conducted: false, checked: 0, referrals: 0 },
          dentalCheckup:     { conducted: false, checked: 0, referrals: 0 },
          bmiAssessment:     { conducted: false, checked: 0, referrals: 0 },
          menstrualWellness: { conducted: false, checked: 0 },
          immunization:      { conducted: false, checked: 0 },
          mentalWellness:    { conducted: false, checked: 0 },
          nutrition:         { conducted: false, checked: 0 },
        };
      }
    };

    for (const child of children) {
      for (const rec of child.healthRecords) {
        const year = rec.academicYear;
        ensureYear(year);
        const y = yearMap[year];

        // General checkup
        if (rec.height || rec.weight) {
          y.generalCheckup.conducted = true;
          y.generalCheckup.checked++;
        }
        // Eye/Vision
        if (rec.eyeCheckup || rec.eyeVisionLeft || rec.eyeVisionRight || rec.visionOverall) {
          y.eyeScreening.conducted = true;
          y.eyeScreening.checked++;
          if (rec.visionReferralNeeded) y.eyeScreening.referrals++;
        }
        // Dental
        if (rec.dentalOverallHealth || rec.dentalCariesIndex != null) {
          y.dentalCheckup.conducted = true;
          y.dentalCheckup.checked++;
          if (rec.dentalReferralNeeded) y.dentalCheckup.referrals++;
        }
        // BMI
        if (rec.bmi != null) {
          y.bmiAssessment.conducted = true;
          y.bmiAssessment.checked++;
        }
        // Menstrual
        if (rec.menstrualHygiene) {
          y.menstrualWellness.conducted = true;
          y.menstrualWellness.checked++;
        }
        // Immunization
        if (rec.immunization) {
          y.immunization.conducted = true;
          y.immunization.checked++;
        }
        // Mental wellness
        if (rec.mentalWellness) {
          y.mentalWellness.conducted = true;
          y.mentalWellness.checked++;
        }
        // Nutrition
        if (rec.nutrition) {
          y.nutrition.conducted = true;
          y.nutrition.checked++;
        }
      }
    }

    // Compute totalStudents per year
    for (const year of Object.keys(yearMap)) {
      yearMap[year].totalStudents = children.filter((c: { healthRecords: { academicYear: string }[] }) =>
        c.healthRecords.some((r: { academicYear: string }) => r.academicYear === year)
      ).length;
    }

    return Object.entries(yearMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, stats]) => ({ year, ...stats }));
  }
}
