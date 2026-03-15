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

router.patch("/:id", async (req: AuthRequest, res) => {
  try {
    const school = await SchoolService.getSchoolByUserId(req.user!.id);
    if (!school) return res.status(404).json({ error: "School not found" });
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid staff id" });
    const updated = await StaffService.updateStaff(id, school.id, req.body);
    if (!updated) return res.status(404).json({ error: "Staff member not found or not in your school" });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const school = await SchoolService.getSchoolByUserId(req.user!.id);
    if (!school) return res.status(404).json({ error: "School not found" });
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid staff id" });
    const removed = await StaffService.removeStaff(id, school.id);
    if (!removed) return res.status(404).json({ error: "Staff member not found or not in your school" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
