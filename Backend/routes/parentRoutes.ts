import { Router } from "express";
import { ParentService } from "../services/parentService";
import { authenticateParentJWT, ParentRequest } from "../utils/parentAuthMiddleware";

const router = Router();

// POST /api/parent/login
router.post("/login", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }
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

export default router;
