import { Router } from "express";
import { authenticateJWT, AuthRequest, canViewHealth } from "../utils/authMiddleware";
import { DashboardService } from "../services/dashboardService";
import { SchoolService } from "../services/schoolService";

const router = Router();

router.use(authenticateJWT);

// GET /api/dashboard/overview
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
      (req.query.academicYear as string) ||
      school.academicYear ||
      "2024-2025";
    const overview = await DashboardService.getOverview(school.id, academicYear);
    res.json(overview);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
