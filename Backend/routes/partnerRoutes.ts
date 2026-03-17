import express, { Request, Response } from "express";
import { PartnerService } from "../services/partnerService";
import { authenticateJWT, AuthRequest } from "../utils/authMiddleware";
import Razorpay from "razorpay";
import prisma from "../prismaClient";
import path from "path";
import fs from "fs";

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

// GET /partner/invoices — list completed events for schools this partner donated to
router.get("/invoices", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // Step 1: Get ONLY school IDs this partner has donated to
    const donations = await prisma.donation.findMany({
      where: { partnerId: req.user.id },
      select: { schoolId: true }
    });

    const donatedSchoolIds = [...new Set(donations.map((d: any) => d.schoolId))];

    if (donatedSchoolIds.length === 0) {
      return res.json([]); // Partner has not donated to any school yet
    }

    // Step 2: Get completed events ONLY from those schools
    const completedEvents = await prisma.event.findMany({
      where: { completedAt: { not: null }, schoolId: { in: donatedSchoolIds } },
      include: { school: { select: { schoolName: true, city: true } }, ambassador: true },
      orderBy: { completedAt: 'desc' }
    });

    // Match events to invoice files
    const invoiceDir = path.join(process.cwd(), 'uploads', 'invoices');
    let invoiceFiles: string[] = [];
    if (fs.existsSync(invoiceDir)) {
      invoiceFiles = fs.readdirSync(invoiceDir);
    }

    const invoices = completedEvents.map((ev: any) => {
      const matchingFile = invoiceFiles.find(f => f.includes(`Event_${ev.id}_`));
      return {
        eventId: ev.id,
        title: ev.title,
        type: ev.type,
        completedAt: ev.completedAt,
        scheduledAt: ev.scheduledAt,
        school: ev.school,
        ambassador: ev.ambassador,
        attendanceJson: ev.attendanceJson,
        invoiceFile: matchingFile || null,
        hasInvoice: !!matchingFile
      };
    });

    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /partner/invoices/:filename — download a specific invoice PDF
router.get("/invoices/:filename", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
    // Sanitize to prevent path traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ message: "Invalid filename" });
    }
    const filePath = path.join(process.cwd(), 'uploads', 'invoices', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
