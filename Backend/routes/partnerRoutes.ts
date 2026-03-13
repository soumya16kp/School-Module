import express from "express";
import { PartnerService } from "../services/partnerService";
import { authenticateJWT, AuthRequest } from "../utils/authMiddleware";

const router = express.Router();

router.post("/sponsor", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const donation = await PartnerService.sponsor(req.user.id, req.body);
    res.status(201).json(donation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/donations", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const donations = await PartnerService.getDonations(req.user.id);
    res.json(donations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/schools", authenticateJWT, async (req, res) => {
  try {
    const schools = await PartnerService.getAllSchools();
    res.json(schools);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
