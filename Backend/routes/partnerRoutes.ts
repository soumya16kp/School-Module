import express, { Request, Response } from "express";
import { PartnerService } from "../services/partnerService";
import { authenticateJWT, AuthRequest } from "../utils/authMiddleware";
import Razorpay from "razorpay";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_S6aIrNBO1w6KyP",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "Bw19Gdf0VOrZk021W3yBpxgQ" // using a dummy default for demo if not set
});

router.post("/create-order", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { amount } = req.body;
    
    // amount is in INR, Razorpay requires amount in smallest currency sub-unit (paise)
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_order_" + Math.random().toString(36).substring(7),
    };
    
    const order = await razorpay.orders.create(options);
    res.json({ 
      ...order,
      razorpay_key_id: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_S6aIrNBO1w6KyP"
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ 
      message: error?.error?.description || error?.message || "Failed to generate Razorpay order",
      details: error
    });
  }
});

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

router.get("/schools", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const schools = await PartnerService.getAllSchools();
    res.json(schools);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/schools/:id/stats", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.id as string);
    if (isNaN(schoolId)) return res.status(400).json({ message: "Invalid school id" });
    const stats = await PartnerService.getSchoolHealthStats(schoolId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
