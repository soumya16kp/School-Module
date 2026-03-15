import { Router } from "express";
import { StaffService } from "../services/staffService";
import { SchoolService } from "../services/schoolService";
import { authenticateJWT, AuthRequest, requireRoles } from "../utils/authMiddleware";

const router = Router();

// Only School Admin or Principal can manage staff
router.use(authenticateJWT);
router.use(requireRoles(["SCHOOL_ADMIN", "PRINCIPAL"]));

router.get("/", async (req: AuthRequest, res) => {
  try {
    const school = await SchoolService.getSchoolByUserId(req.user!.id);
    if (!school) return res.status(404).json({ error: "School not found" });
    
    const staff = await StaffService.listStaff(school.id);
    res.json(staff);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const school = await SchoolService.getSchoolByUserId(req.user!.id);
    if (!school) return res.status(404).json({ error: "School not found" });

    const member = await StaffService.addStaff(school.id, req.body);
    res.status(201).json(member);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    await StaffService.removeStaff(parseInt(req.params.id as string));
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
