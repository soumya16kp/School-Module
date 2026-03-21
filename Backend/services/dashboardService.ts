import prisma from "../prismaClient";

const DRILL_TYPES = ["FIRE_DRILL", "BLACKOUT_DRILL", "BUNKER_DRILL", "CPR_TRAINING", "FIRST_AID_TRAINING"];
const MIN_SCREENED = 30; // OQ-05: minimum cohort for prevalence metrics

export class DashboardService {
  static async getOverview(schoolId: number, academicYear: string, filters?: { classNum?: number; section?: string }) {
    const childWhere: any = { schoolId };
    if (filters?.classNum) childWhere.class = filters.classNum;
    if (filters?.section) childWhere.section = filters.section;

    const [children, healthRecords, events, certifications] = await Promise.all([
      prisma.child.findMany({ 
        where: childWhere, 
        select: { id: true, status: true, class: true } 
      }),
      prisma.healthRecord.findMany({
        where: { 
          child: childWhere, 
          ...(academicYear && { academicYear })
        }
      }),
      prisma.event.findMany({
        where: { 
          schoolId,
          ...(academicYear && { academicYear })
        },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.certification.findMany({
        where: { 
          schoolId,
          ...(academicYear && { academicYear })
        },
      }),
    ]);

    const totalStudents = children.length;
    const studentIds = new Set(children.map((c: any) => c.id));
    const validRecords = healthRecords.filter((r: any) => studentIds.has(r.childId));
    
    const studentsDone = children.filter((c: any) => c.status === "Done").length;
    const studentsPending = children.filter((c: any) => c.status === "Pending").length;
    const studentsAbsent = children.filter((c: any) => c.status === "Absent").length;

    const coveragePercent = totalStudents > 0 ? Math.round((studentsDone / totalStudents) * 100) : 0;
    const pendingPercent = totalStudents > 0 ? Math.round((studentsPending / totalStudents) * 100) : 0;
    const absentPercent = totalStudents > 0 ? Math.round((studentsAbsent / totalStudents) * 100) : 0;


    // Drill completion: completed drills of required types
    const completedDrills = events.filter(
      (e: any) => e.completedAt != null && DRILL_TYPES.includes(e.type)
    );
    const completedTypes = new Set(completedDrills.map((e: any) => e.type));
    const drillCompleted = completedTypes.size;
    const drillRequired = DRILL_TYPES.length;
    const drillPercent = Math.round((drillCompleted / drillRequired) * 100);

    // Prevalence (for high-risk): need screened count and flagged count per domain
    // Prevalence (for high-risk): need screened count and flagged count per domain
    const screenedRecords = validRecords.filter((r: any) => r.checkupDate != null);
    const screened = screenedRecords.length;

    // Precise screening counts (records where specific exam data exists)
    const dentalScreened = screenedRecords.filter((r: any) => r.dentalOverallHealth || r.dentalReferralNeeded !== null).length;
    const visionScreened = screenedRecords.filter((r: any) => r.visionOverall || r.visionReferralNeeded !== null).length;
    const bmiScreened = screenedRecords.filter((r: any) => r.bmiCategory).length;

    // Flagged (Issues detected)
    const dentalFlagged = screenedRecords.filter(
      (r: any) =>
        (r.dentalOverallHealth && ["MODERATE_ISSUES", "SEVERE_ISSUES", "FAIR", "POOR", "ISSUES"].includes(r.dentalOverallHealth.toUpperCase())) ||
        r.dentalReferralNeeded === true
    ).length;
    
    const visionFlagged = screenedRecords.filter(
      (r: any) =>
        (r.visionOverall && ["REQUIRES_FURTHER_EVAL", "UNDER_TREATMENT", "MYOPIA", "LOW_VISION", "ISSUES"].includes(r.visionOverall.toUpperCase())) ||
        r.visionReferralNeeded === true
    ).length;
    
    const bmiRiskCount = screenedRecords.filter(
      (r: any) => r.bmiCategory && ["OVERWEIGHT", "OBESE", "AT RISK"].includes(r.bmiCategory.toUpperCase())
    ).length;

    const bmiNormal = screenedRecords.filter(
      (r: any) => r.bmiCategory && r.bmiCategory.toUpperCase() === "NORMAL"
    ).length;

    const bmiUnderweight = screenedRecords.filter(
      (r: any) => r.bmiCategory && r.bmiCategory.toUpperCase() === "UNDERWEIGHT"
    ).length;

    const dentalHealthy = screenedRecords.filter(
      (r: any) => {
        const h = r.dentalOverallHealth?.toUpperCase();
        const okStatus = h === "HEALTHY" || h === "GOOD" || h === "EXCELLENT";
        return okStatus && r.dentalReferralNeeded === false;
      }
    ).length;

    const visionNormal = screenedRecords.filter(
      (r: any) => {
        const v = r.visionOverall?.toUpperCase();
        const okStatus = v === "NORMAL" || v === "GOOD";
        return okStatus && r.visionReferralNeeded === false;
      }
    ).length;

    // Prevalence calculations (Percent of those actually screened)
    const dentalHealthyPercent = dentalScreened > 0 ? Math.round((dentalHealthy / dentalScreened) * 100) : 0;
    const visionNormalPercent = visionScreened > 0 ? Math.round((visionNormal / visionScreened) * 100) : 0;
    const bmiNormalPercent = bmiScreened > 0 ? Math.round((bmiNormal / bmiScreened) * 100) : 0;

    // Flagged prevalence for High-Risk markers (OQ-05)
    // We still use total screened as baseline for global institutional risk
    const dentalPrevalenceRaw = screened >= MIN_SCREENED ? Math.round((dentalFlagged / screened) * 100) : null;
    const visionPrevalenceRaw = screened >= MIN_SCREENED ? Math.round((visionFlagged / screened) * 100) : null;
    const bmiPrevalenceRaw = screened >= MIN_SCREENED ? Math.round((bmiRiskCount / screened) * 100) : null;

    // High-risk flags (OQ-05)
    const highRiskFlags: string[] = [];
    if (coveragePercent < 70) highRiskFlags.push("Low annual checkup coverage");
    if (dentalPrevalenceRaw != null && dentalPrevalenceRaw >= 30)
      highRiskFlags.push("High dental issue prevalence");
    if (visionPrevalenceRaw != null && visionPrevalenceRaw >= 25)
      highRiskFlags.push("High vision issue prevalence");
    if (bmiPrevalenceRaw != null && bmiPrevalenceRaw >= 20)
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

    // Event stats - Based on a target of 9 required programs
    const eventsTarget = 9;
    const eventsCompleted = events.filter((e: any) => e.completedAt != null).length;
    const eventsFinalized = events.filter((e: any) => e.loggingCompletedAt != null).length;
    const eventsReady = events.filter((e: any) => e.completedAt != null && e.loggingCompletedAt == null).length;
    const eventsScheduled = events.filter((e: any) => e.scheduledAt != null && e.completedAt == null).length;
    // Pending is the target minus those already completed
    const eventsPending = Math.max(0, eventsTarget - eventsCompleted);

    // Class-wise Attendance (New)
    const classAttendance: any[] = [];
    const classNumbers = [...new Set(children.map((c: any) => c.class))].sort((a: any, b: any) => a - b);

    for (const cNum of classNumbers) {
      const classChildren = children.filter((c: any) => c.class === cNum);
      const classChildrenIds = new Set(classChildren.map((c: any) => c.id));
      const classRecords = validRecords.filter((r: any) => classChildrenIds.has(r.childId));

      const bmiPresent = classRecords.filter((r: any) => ["Present", "Done", "Completed"].includes(r.bmiStatus || "")).length;
      const eyePresent = classRecords.filter((r: any) => ["Present", "Done", "Completed"].includes(r.eyeStatus || "")).length;
      const dentalPresent = classRecords.filter((r: any) => ["Present", "Done", "Completed"].includes(r.dentalStatus || "")).length;

      classAttendance.push({
        class: cNum,
        total: classChildren.length,
        bmiPresent,
        bmiAbsent: classChildren.length - bmiPresent,
        eyePresent,
        eyeAbsent: classChildren.length - eyePresent,
        dentalPresent,
        dentalAbsent: classChildren.length - dentalPresent,
      });
    }

    return {
      schoolId,
      academicYear,
      totalStudents,
      studentsWithCheckup: studentsDone,
      studentsPending,
      studentsAbsent,
      coveragePercent,
      pendingPercent,
      absentPercent,
      drillCompleted,
      drillRequired,
      drillPercent,
      eventsCompleted,
      eventsFinalized,
      eventsReady,
      eventsScheduled,
      eventsPending,
      eventsTarget,
      certificationCount: certifications.length,
      certificationActive: certActive,
      certificationPending: certPending,
      highRiskFlags,
      isHighRisk,
      upcomingEvents,
      classAttendance,
      prevalence: {
        dental: dentalPrevalenceRaw,
        vision: visionPrevalenceRaw,
        bmiHigh: bmiPrevalenceRaw, // Percentage
        screened,
        dentalHealthy,
        dentalIssues: dentalFlagged,
        visionNormal,
        visionIssues: visionFlagged,
        bmiNormal,
        bmiRiskTotal: bmiRiskCount,
        bmiUnderweight,
        dentalScreened,
        visionScreened,
        bmiScreened,
        dentalHealthyPercent,
        visionNormalPercent,
        bmiNormalPercent,
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
        const ay = academicYear || s.academicYear;
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
