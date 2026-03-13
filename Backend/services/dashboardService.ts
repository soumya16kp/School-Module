import prisma from "../prismaClient";

const DRILL_TYPES = ["FIRE_DRILL", "BLACKOUT_DRILL", "BUNKER_DRILL", "CPR_TRAINING", "FIRST_AID_TRAINING"];
const MIN_SCREENED = 30; // OQ-05: minimum cohort for prevalence metrics

export class DashboardService {
  static async getOverview(schoolId: number, academicYear: string) {
    const [children, healthRecords, events, certifications] = await Promise.all([
      prisma.child.findMany({ 
        where: { schoolId }, 
        select: { id: true } 
      }),
      prisma.healthRecord.findMany({
        where: { 
          child: { schoolId }, 
          academicYear 
        }
      }),
      prisma.event.findMany({
        where: { schoolId, academicYear },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.certification.findMany({
        where: { schoolId, academicYear },
      }),
    ]);

    const totalStudents = children.length;
    const studentIds = new Set(children.map((c: any) => c.id));

    // Filter health records that belong to the current student cohort
    const validRecords = healthRecords.filter((r: any) => studentIds.has(r.childId));

    const studentsWithCheckup = new Set(
      validRecords.filter((r: any) => r.checkupDate != null).map((r: any) => r.childId)
    ).size;

    const coveragePercent = totalStudents > 0 ? Math.round((studentsWithCheckup / totalStudents) * 100) : 0;

    // Drill completion: completed drills of required types
    const completedDrills = events.filter(
      (e: any) => e.completedAt != null && DRILL_TYPES.includes(e.type)
    );
    const completedTypes = new Set(completedDrills.map((e: any) => e.type));
    const drillCompleted = completedTypes.size;
    const drillRequired = DRILL_TYPES.length;
    const drillPercent = Math.round((drillCompleted / drillRequired) * 100);

    // Prevalence (for high-risk): need screened count and flagged count per domain
    const screenedRecords = validRecords.filter((r: any) => r.checkupDate != null);
    const screened = screenedRecords.length;
    
    const dentalFlagged = screenedRecords.filter(
      (r: any) =>
        r.dentalOverallHealth &&
        ["MODERATE_ISSUES", "SEVERE_ISSUES"].includes(r.dentalOverallHealth)
    ).length;
    
    const visionFlagged = screenedRecords.filter(
      (r: any) =>
        r.visionOverall &&
        ["REQUIRES_FURTHER_EVAL", "UNDER_TREATMENT"].includes(r.visionOverall)
    ).length;
    
    const bmiHigh = screenedRecords.filter(
      (r: any) => r.bmiCategory && ["OVERWEIGHT", "OBESE"].includes(r.bmiCategory)
    ).length;

    const dentalPrevalence =
      screened >= MIN_SCREENED ? Math.round((dentalFlagged / screened) * 100) : null;
    const visionPrevalence =
      screened >= MIN_SCREENED ? Math.round((visionFlagged / screened) * 100) : null;
    const bmiPrevalence =
      screened >= MIN_SCREENED ? Math.round((bmiHigh / screened) * 100) : null;

    // High-risk flags (OQ-05)
    const highRiskFlags: string[] = [];
    if (coveragePercent < 70) highRiskFlags.push("Low annual checkup coverage");
    if (dentalPrevalence != null && dentalPrevalence >= 30)
      highRiskFlags.push("High dental issue prevalence");
    if (visionPrevalence != null && visionPrevalence >= 25)
      highRiskFlags.push("High vision issue prevalence");
    if (bmiPrevalence != null && bmiPrevalence >= 20)
      highRiskFlags.push("High overweight/obesity prevalence");
    if (drillPercent < 50) highRiskFlags.push("Low safety drill completion");

    const isHighRisk = highRiskFlags.length > 0;

    // Upcoming events (scheduled in future, limit 5)
    const now = new Date();
    const upcomingEvents = events
      .filter((e: any) => e.scheduledAt && new Date(e.scheduledAt) > now)
      .slice(0, 5)
      .map((e: any) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        scheduledAt: e.scheduledAt,
      }));

    // Certification summary
    const certActive = certifications.filter((c: any) => c.status === "ACTIVE").length;
    const certPending = certifications.filter((c: any) => c.status === "PENDING").length;

    return {
      schoolId,
      academicYear,
      totalStudents,
      studentsWithCheckup,
      coveragePercent,
      drillCompleted,
      drillRequired,
      drillPercent,
      certificationCount: certifications.length,
      certificationActive: certActive,
      certificationPending: certPending,
      highRiskFlags,
      isHighRisk,
      upcomingEvents,
      prevalence: {
        dental: dentalPrevalence,
        vision: visionPrevalence,
        bmiHigh: bmiPrevalence,
        screened,
      },
    };
  }

  // Aggregate view for district/board viewers – returns school-level overviews only
  static async getDistrictOverview(academicYear: string) {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        schoolName: true,
        city: true,
        state: true,
        academicYear: true,
        studentStrength: true,
      },
    });

    const overviews = await Promise.all(
      schools.map(async (s: any) => {
        const ay = academicYear || s.academicYear || "2024-2025";
        const overview = await DashboardService.getOverview(s.id, ay);
        return {
          ...s,
          ...overview,
        };
      })
    );

    // PRD OQ-04: show only school-level aggregates, min cohort N=10
    return overviews.filter((o: any) => (o.totalStudents ?? 0) >= 10);
  }
}
