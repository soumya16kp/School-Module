import { Router } from "express";
import { authenticateJWT, AuthRequest, canManageAmbassadors, canViewHealth } from "../utils/authMiddleware";
import { AmbassadorService } from "../services/ambassadorService";
import { SchoolService } from "../services/schoolService";

const router = Router();

router.use(authenticateJWT);

// GET /api/ambassadors – list ambassadors for user's school + global
router.get("/", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canViewHealth(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const type = req.query.type as string | undefined;
    const ambassadors = await AmbassadorService.listForSchool(school.id, type);
    res.json(ambassadors);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /api/ambassadors – create (requires canManageAmbassadors)
router.post("/", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canManageAmbassadors(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const { type, name, organization, phone, email, serviceArea, active, notes } = req.body;
    if (!type || !name) {
      return res.status(400).json({ message: "type and name are required" });
    }
    const ambassador = await AmbassadorService.create({
      schoolId: school.id,
      type,
      name,
      organization,
      phone,
      email,
      serviceArea,
      active: active ?? true,
      notes,
    });
    res.status(201).json(ambassador);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Bad request" });
  }
});

// GET /api/ambassadors/:id
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canViewHealth(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    const schoolId = school?.id ?? null;
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ambassador id" });
    }
    const ambassador = await AmbassadorService.getById(id, schoolId);
    if (!ambassador) {
      return res.status(404).json({ message: "Ambassador not found" });
    }
    res.json(ambassador);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// PATCH /api/ambassadors/:id (requires canManageAmbassadors)
router.patch("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canManageAmbassadors(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    const schoolId = school?.id ?? null;
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ambassador id" });
    }
    const { type, name, organization, phone, email, serviceArea, active, notes } = req.body;
    await AmbassadorService.update(id, schoolId, {
      type,
      name,
      organization,
      phone,
      email,
      serviceArea,
      active,
      notes,
    });
    const ambassador = await AmbassadorService.getById(id, schoolId);
    res.json(ambassador);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Bad request" });
  }
});

// DELETE /api/ambassadors/:id (requires canManageAmbassadors)
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canManageAmbassadors(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    const schoolId = school?.id ?? null;
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ambassador id" });
    }
    await AmbassadorService.delete(id, schoolId);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
