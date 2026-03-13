import { Router } from "express";
import { CardService } from "../services/cardService";
import { SchoolService } from "../services/schoolService";
import { authenticateJWT, AuthRequest } from "../utils/authMiddleware";
import prisma from "../prismaClient";

const router = Router();

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
