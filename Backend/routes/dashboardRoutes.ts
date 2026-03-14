import { Router } from "express";
import {
  authenticateJWT,
  AuthRequest,
  canViewHealth,
} from "../utils/authMiddleware";
import { DashboardService } from "../services/dashboardService";
import { SchoolService } from "../services/schoolService";
import { ExportService } from "../services/exportService";

const router = Router();

router.use(authenticateJWT);

// GET /api/dashboard/overview – single-school view for school-level roles
router.get("/overview", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canViewHealth(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const academicYear =
      (req.query.academicYear as string) || school.academicYear || "2024-2025";
    const overview = await DashboardService.getOverview(school.id, academicYear);
    res.json(overview);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET /api/dashboard/district-overview – aggregate across schools
router.get("/district-overview", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canViewHealth(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const academicYear = (req.query.academicYear as string) || "2024-2025";
    const data = await DashboardService.getDistrictOverview(academicYear);
    res.json({ academicYear, schools: data });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET /api/dashboard/export – export health reports as CSV or PDF
router.get("/export", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canViewHealth(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) return res.status(404).json({ message: "School not found" });

    const format = (req.query.format as string) || "csv";
    const academicYear = req.query.academicYear as string | undefined;
    const classNum = req.query.class != null ? parseInt(String(req.query.class)) : undefined;
    const section = req.query.section as string | undefined;
    const domain = (req.query.domain as string) || "all";

    const { rows, schoolName } = await ExportService.getExportData(req.user.id, {
      schoolId: school.id,
      academicYear,
      class: classNum,
      section,
      domain: domain as "all" | "bmi" | "dental" | "vision" | "immunization",
    });

    if (format === "pdf") {
      const pdf = await ExportService.generatePDF(rows, schoolName, academicYear);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="health-report-${academicYear || "all"}.pdf"`
      );
      res.send(pdf);
    } else {
      const csv = ExportService.generateCSV(rows);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="health-report-${academicYear || "all"}.csv"`
      );
      res.send(csv);
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
