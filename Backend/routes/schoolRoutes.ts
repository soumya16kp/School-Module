import express from "express";
import { SchoolService } from "../services/schoolService";
import { authenticateJWT, AuthRequest } from "../utils/authMiddleware";
import Razorpay from "razorpay";
import multer from "multer";
import path from "path";
import prisma from "../prismaClient";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

const razorpay = new Razorpay({
  key_id: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_S6aIrNBO1w6KyP",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "Bw19Gdf0VOrZk021W3yBpxgQ"
});

router.post("/upload-avatar", authenticateJWT, upload.single("avatar"), (req: AuthRequest, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url });
});

router.post("/upload-image", authenticateJWT, upload.single("image"), (req: AuthRequest, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url });
});

router.post("/register", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { paymentId, ...schoolData } = req.body;
    const school = await SchoolService.registerSchool(schoolData, req.user.id);
    res.status(201).json(school);
  } catch (error: any) {
    console.error("School Registration Error:", error);
    res.status(400).json({ message: error.message });
  }
});

router.post("/create-order", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { amount } = req.body;
    
    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: "reg_receipt_" + Math.random().toString(36).substring(7),
    };
    
    const order = await razorpay.orders.create(options);
    res.json({ 
      ...order,
      razorpay_key_id: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_S6aIrNBO1w6KyP"
    });
  } catch (error: any) {
    console.error("Razorpay registration order error:", error);
    res.status(500).json({ 
      message: error?.error?.description || error?.message || "Failed to generate Razorpay order",
      details: error
    });
  }
});

// POST /api/schools/record-unlock-payment – school self-funds their credit goal
router.post("/record-unlock-payment", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { amount, paymentId, orderId } = req.body;
    if (!amount || !paymentId) return res.status(400).json({ message: "amount and paymentId are required" });

    const school = await prisma.school.findFirst({
      where: { users: { some: { id: req.user.id } } },
      select: { id: true }
    });
    if (!school) return res.status(404).json({ message: "School not found" });

    const donation = await prisma.donation.create({
      data: {
        partnerId: req.user.id,
        schoolId: school.id,
        amount: parseFloat(amount),
        type: "SELF_UNLOCK",
        status: "COMPLETED",
        description: `Self-funded program unlock. Payment ID: ${paymentId}. Order ID: ${orderId || "N/A"}`,
      }
    });
    res.status(201).json(donation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my-donations", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const school = await prisma.school.findFirst({
      where: { users: { some: { id: req.user.id } } },
      select: {
        id: true,
        annualCreditGoal: true,
        donations: {
          where: {
            user: { role: 'PARTNER' }
          },
          orderBy: { date: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        }
      }
    });
    if (!school) return res.status(404).json({ message: "School not found" });
    res.json(school);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my-school", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    res.json(school);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/all", authenticateJWT, async (req, res) => {
  try {
    const schools = await SchoolService.getAllSchools();
    res.json(schools);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!['SCHOOL_ADMIN', 'PRINCIPAL'].includes(req.user.role)) {
      return res.status(403).json({ message: "Only Admin or Principal can update school details" });
    }
    const schoolId = parseInt(req.params.id as string);
    const school = await SchoolService.updateSchool(schoolId, req.body);
    res.json(school);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
