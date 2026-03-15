import { Router } from "express";
import { CardService } from "../services/cardService";
import { SchoolService } from "../services/schoolService";
import { authenticateJWT, AuthRequest } from "../utils/authMiddleware";
import prisma from "../prismaClient";

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// GET /api/card/bulk – school auth: download all ID cards as PDF (must be before /:token)
router.get("/bulk", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) return res.status(404).json({ message: "School not found" });

    let classNum = req.query.class != null ? parseInt(String(req.query.class)) : undefined;
    let section = (req.query.section as string) || undefined;
    const baseUrl = (req.query.baseUrl as string) || FRONTEND_URL;

    // CLASS_TEACHER: only their assigned class/section
    if (req.user.role === "CLASS_TEACHER" && req.user.assignedClass != null) {
      classNum = req.user.assignedClass;
      section = req.user.assignedSection ?? undefined;
    }

    const pdf = await CardService.generateBulkPdf(school.id, baseUrl, {
      class: classNum,
      section: section || undefined,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="id-cards-bulk.pdf"');
    res.send(pdf);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET /api/card/:token – PUBLIC: health ID card data (no auth, scan opens this)
router.get("/:token", async (req, res) => {
  try {
    const t = req.params.token;
    const token = (typeof t === "string" ? t : Array.isArray(t) ? t[0] ?? "" : "") as string;
    if (!token) return res.status(400).json({ message: "Token required" });
    const data = await CardService.getByCardToken(token);
    if (!data) return res.status(404).json({ message: "Card not found" });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /api/card/ensure/:childId – ensure token exists, return it (school auth)
router.post("/ensure/:childId", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) return res.status(404).json({ message: "School not found" });

    const cid = req.params.childId;
    const childId = parseInt(typeof cid === "string" ? cid : Array.isArray(cid) ? cid[0] ?? "" : "");
    if (isNaN(childId)) return res.status(400).json({ message: "Invalid child id" });

    const child = await prisma.child.findFirst({
      where: { id: childId, schoolId: school.id },
    });
    if (!child) return res.status(404).json({ message: "Child not found" });

    const token = await CardService.ensureCardToken(childId);
    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
