import { Router } from "express";
import { ParentService } from "../services/parentService";
import { CardService } from "../services/cardService";
import prisma from "../prismaClient";
import { authenticateParentJWT, ParentRequest } from "../utils/parentAuthMiddleware";

const router = Router();

// POST /api/parent/send-otp
router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required" });
    const result = await ParentService.sendOtp(phone);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/parent/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ message: "Phone and OTP code are required" });
    const result = await ParentService.verifyOtp(phone, code);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
});

// POST /api/parent/login - legacy, direct login without OTP (kept for backward compatibility)
router.post("/login", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required" });
    const result = await ParentService.login(phone);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
});

// GET /api/parent/children - List all children linked to this phone
router.get("/children", authenticateParentJWT, async (req: ParentRequest, res) => {
  try {
    if (!req.parent) return res.status(401).json({ message: "Unauthenticated" });
    const result = await ParentService.login(req.parent.phone);
    res.json(result.children);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/parent/children/:id/access-history - Who has accessed this child's data (for parent transparency)
router.get("/children/:id/access-history", authenticateParentJWT, async (req: ParentRequest, res) => {
  try {
    if (!req.parent) return res.status(401).json({ message: "Unauthenticated" });
    const childId = parseInt(req.params.id as string);
    if (isNaN(childId)) return res.status(400).json({ message: "Invalid child id" });

    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        OR: [
          { fatherNumber: req.parent.phone },
          { motherNumber: req.parent.phone }
        ]
      }
    });
    if (!child) return res.status(404).json({ message: "Child not found or access denied" });

    const logs = await prisma.childDataAccessLog.findMany({
      where: { childId },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    const entries = logs.map((log: { id: number; action: string; actorType: string; metadata: unknown; createdAt: Date }) => {
      const meta = (log.metadata as Record<string, unknown>) || {};
      let description: string;
      if (log.action === "emergency_access_granted") {
        const name = (meta.requesterName as string) || "Responder";
        description = `Emergency access granted to ${name} on ${new Date(log.createdAt).toLocaleDateString()}`;
      } else if (log.action === "emergency_view") {
        const name = (meta.requesterName as string) || "Responder";
        description = `Emergency data viewed by ${name} on ${new Date(log.createdAt).toLocaleDateString()}`;
      } else {
        description = `${log.action} on ${new Date(log.createdAt).toLocaleDateString()}`;
      }
      return {
        id: log.id,
        action: log.action,
        actorType: log.actorType,
        description,
        createdAt: log.createdAt,
      };
    });

    res.json({ entries });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET /api/parent/children/:id - Detailed child health & stats
router.get("/children/:id", authenticateParentJWT, async (req: ParentRequest, res) => {
  try {
    if (!req.parent) return res.status(401).json({ message: "Unauthenticated" });
    const childId = parseInt(req.params.id as string);
    const result = await ParentService.getChildDashboard(childId, req.parent.phone);
    res.json(result);
  } catch (err: any) {
    res.status(403).json({ message: err.message });
  }
});

// POST /api/parent/card-token/:childId - Get card token for parent's child (for ID card download)
router.post("/card-token/:childId", authenticateParentJWT, async (req: ParentRequest, res) => {
  try {
    if (!req.parent) return res.status(401).json({ message: "Unauthenticated" });
    const childId = parseInt(req.params.childId as string);
    if (isNaN(childId)) return res.status(400).json({ message: "Invalid child id" });

    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        OR: [
          { fatherNumber: req.parent.phone },
          { motherNumber: req.parent.phone }
        ]
      }
    });
    if (!child) return res.status(404).json({ message: "Child not found or access denied" });

    const token = await CardService.ensureCardToken(childId);
    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
