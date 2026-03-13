import { Router } from "express";
import { authenticateJWT, AuthRequest, canScheduleEvents, canViewHealth } from "../utils/authMiddleware";
import { CertificationService } from "../services/certificationService";
import { SchoolService } from "../services/schoolService";

const router = Router();

router.use(authenticateJWT);

router.get("/", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canViewHealth(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const academicYear = req.query.academicYear as string | undefined;
    const certs = await CertificationService.listBySchool(school.id, academicYear);
    res.json(certs);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canScheduleEvents(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const { type, status, academicYear, issuedAt, validUntil, metadata } = req.body;
    if (!type || !status || !academicYear) {
      return res.status(400).json({ message: "type, status, and academicYear are required" });
    }
    const cert = await CertificationService.create({
      schoolId: school.id,
      type,
      status,
      academicYear,
      issuedAt: issuedAt ? new Date(issuedAt) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      metadata,
    });
    res.status(201).json(cert);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Bad request" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canViewHealth(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid certification id" });
    }
    const cert = await CertificationService.getById(id, school.id);
    if (!cert) {
      return res.status(404).json({ message: "Certification not found" });
    }
    res.json(cert);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.patch("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canScheduleEvents(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid certification id" });
    }
    const { type, status, academicYear, issuedAt, validUntil, metadata } = req.body;
    await CertificationService.update(id, school.id, {
      type,
      status,
      academicYear,
      issuedAt: issuedAt != null ? new Date(issuedAt) : undefined,
      validUntil: validUntil != null ? new Date(validUntil) : undefined,
      metadata,
    });
    const cert = await CertificationService.getById(id, school.id);
    res.json(cert);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Bad request" });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canScheduleEvents(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid certification id" });
    }
    await CertificationService.delete(id, school.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
