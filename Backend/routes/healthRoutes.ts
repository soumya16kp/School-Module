import { Router } from "express";
import multer from "multer";
import path from "path";
import { HealthService } from "../services/healthService";
import prisma from "../prismaClient";
import {
  authenticateJWT,
  AuthRequest,
  canViewHealth,
  canEditHealth,
} from "../utils/authMiddleware";

const router = Router();

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const assertSameSchoolForChild = async (userId: number, childId: number) => {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { schoolId: true },
  });
  if (!child) {
    return { ok: false, code: 404 as const, message: "Child not found" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { schoolId: true },
  });

  if (!user || user.schoolId == null || user.schoolId !== child.schoolId) {
    return {
      ok: false,
      code: 403 as const,
      message: "You are not allowed to access this student's records",
    };
  }

  return { ok: true as const };
};

// GET /api/health/:childId – health records for a child
router.get("/:childId", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canViewHealth(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const childId = parseInt(req.params.childId as string);
    if (Number.isNaN(childId)) {
      res.status(400).json({ error: "Invalid child id" });
      return;
    }

    const auth = await assertSameSchoolForChild(req.user.id, childId);
    if (!auth.ok) {
      res.status(auth.code).json({ error: auth.message });
      return;
    }

    const records = await HealthService.getRecordsForChild(childId);
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// POST /api/health/:childId – add health record for a child
router.post(
  "/:childId",
  authenticateJWT,
  upload.single("reportFile"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user || !canEditHealth(req.user.role)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const childId = parseInt(req.params.childId as string);
      if (Number.isNaN(childId)) {
        res.status(400).json({ error: "Invalid child id" });
        return;
      }

      const auth = await assertSameSchoolForChild(req.user.id, childId);
      if (!auth.ok) {
        res.status(auth.code).json({ error: auth.message });
        return;
      }

      const payload = {
        ...req.body,
        reportFile: req.file ? req.file.filename : null,
      };
      const record = await HealthService.addRecord(childId, payload);
      res.status(201).json(record);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Bad request" });
    }
  }
);

export default router;
