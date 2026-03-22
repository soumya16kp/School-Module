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
    select: { schoolId: true, class: true, section: true },
  });
  if (!child) {
    return { ok: false, code: 404 as const, message: "Child not found" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { schoolId: true, role: true, assignedClass: true, assignedSection: true },
  });

  if (!user || user.schoolId == null || user.schoolId !== child.schoolId) {
    return {
      ok: false,
      code: 403 as const,
      message: "You do not have access to this record",
    };
  }

  if (user.role === "CLASS_TEACHER") {
    const ac = user.assignedClass;
    const as = user.assignedSection;
    if (ac == null) {
      return {
        ok: false,
        code: 403 as const,
        message: "Your account is not assigned to a class. Contact school admin.",
      };
    }
    if (child.class !== ac || (as != null && as !== "" && child.section !== as)) {
      return {
        ok: false,
        code: 403 as const,
        message: "You can only view students from your assigned class",
      };
    }
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

// PUT /api/health/:childId/:recordId - update health record
router.put(
  "/:childId/:recordId",
  authenticateJWT,
  upload.single("reportFile"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user || !canEditHealth(req.user.role)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const childId = parseInt(req.params.childId as string);
      const recordId = parseInt(req.params.recordId as string);
      
      if (Number.isNaN(childId) || Number.isNaN(recordId)) {
        res.status(400).json({ error: "Invalid child id or record id" });
        return;
      }

      const auth = await assertSameSchoolForChild(req.user.id, childId);
      if (!auth.ok) {
        res.status(auth.code).json({ error: auth.message });
        return;
      }

      const payload = {
        ...req.body,
      };
      if (req.file) {
        payload.reportFile = req.file.filename;
      }

      // Block updates on finalized records
      const existing = await prisma.healthRecord.findUnique({ where: { id: recordId }, select: { isFinalized: true } });
      if (existing?.isFinalized) {
        res.status(403).json({ error: "This record has been finalized and cannot be edited." });
        return;
      }

      const record = await HealthService.updateRecord(recordId, payload, req.user.id);
      res.status(200).json(record);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Bad request" });
    }
  }
);

// POST /api/health/:childId/:recordId/finalize – lock record and email annual report to parents
router.post("/:childId/:recordId/finalize", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canEditHealth(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const childId = parseInt(req.params.childId as string);
    const recordId = parseInt(req.params.recordId as string);
    if (Number.isNaN(childId) || Number.isNaN(recordId)) {
      res.status(400).json({ error: "Invalid child id or record id" });
      return;
    }

    const auth = await assertSameSchoolForChild(req.user.id, childId);
    if (!auth.ok) {
      res.status(auth.code).json({ error: auth.message });
      return;
    }

    const record = await prisma.healthRecord.findUnique({
      where: { id: recordId },
      include: {
        child: {
          include: { school: true }
        }
      }
    });

    if (!record) {
      res.status(404).json({ error: "Record not found" });
      return;
    }
    if (record.isFinalized) {
      res.status(400).json({ error: "Record is already finalized" });
      return;
    }

    // Finalize the record
    const finalized = await prisma.healthRecord.update({
      where: { id: recordId },
      data: { isFinalized: true, finalizedAt: new Date() }
    });

    // Send annual report email to parent(s)
    const child = record.child as any;
    const school = child.school;
    const parentEmails = [child.emailId].filter(Boolean);

    if (parentEmails.length > 0) {
      const { sendEmail } = await import("../services/emailService");
      const subject = `Annual Health Report – ${child.name} (${record.academicYear})`;
      const text = `
Dear Parent,

The annual health record for ${child.name} (Class ${child.class}${child.section ? `-${child.section}` : ''}) for the academic year ${record.academicYear} has been finalized by ${school?.schoolName || 'the school'}.

Summary:
- Height: ${record.height ?? 'N/A'} cm | Weight: ${record.weight ?? 'N/A'} kg | BMI: ${record.bmi ?? 'N/A'}
- Dental: ${(record as any).dentalOverallHealth ?? 'N/A'} | Cavities: ${(record as any).dentalCariesIndex ?? 0}
- Vision (L/R): ${(record as any).eyeVisionLeft ?? 'N/A'} / ${(record as any).eyeVisionRight ?? 'N/A'}
- Blood Pressure: ${(record as any).bloodPressure ?? 'N/A'}

This record is now locked and cannot be modified. Please log in to the parent portal to view the full report.

Regards,
${school?.schoolName || 'School'} via WombTo18
      `.trim();

      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#7c3aed">Annual Health Report – ${child.name}</h2>
          <p>Dear Parent,</p>
          <p>The annual health record for <strong>${child.name}</strong> (Class ${child.class}${child.section ? `-${child.section}` : ''}) for academic year <strong>${record.academicYear}</strong> has been finalized by <strong>${school?.schoolName || 'the school'}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr style="background:#f5f3ff"><td style="padding:8px 12px;font-weight:600">Height</td><td style="padding:8px 12px">${record.height ?? 'N/A'} cm</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600">Weight</td><td style="padding:8px 12px">${record.weight ?? 'N/A'} kg</td></tr>
            <tr style="background:#f5f3ff"><td style="padding:8px 12px;font-weight:600">BMI</td><td style="padding:8px 12px">${record.bmi ?? 'N/A'}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600">Dental Health</td><td style="padding:8px 12px">${(record as any).dentalOverallHealth ?? 'N/A'} | Cavities: ${(record as any).dentalCariesIndex ?? 0}</td></tr>
            <tr style="background:#f5f3ff"><td style="padding:8px 12px;font-weight:600">Vision (L / R)</td><td style="padding:8px 12px">${(record as any).eyeVisionLeft ?? 'N/A'} / ${(record as any).eyeVisionRight ?? 'N/A'}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600">Blood Pressure</td><td style="padding:8px 12px">${(record as any).bloodPressure ?? 'N/A'}</td></tr>
          </table>
          <p style="color:#6b7280;font-size:0.85rem">This record is now locked and cannot be modified. Please log in to the parent portal to view the full report.</p>
          <p>Regards,<br/><strong>${school?.schoolName || 'School'}</strong> via WombTo18</p>
        </div>
      `;

      for (const email of parentEmails) {
        try { await sendEmail(email, subject, text, html); } catch (_) {}
      }
    }

    res.json({ ...finalized, emailSent: parentEmails.length > 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
