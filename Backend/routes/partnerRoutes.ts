import express, { Request, Response } from "express";
import { PartnerService } from "../services/partnerService";
import { authenticateJWT, AuthRequest } from "../utils/authMiddleware";
import Razorpay from "razorpay";
import prisma from "../prismaClient";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";

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

// GET /api/partner/validate-ref?ref=TOKEN — PUBLIC, validate partner invite token
router.get("/validate-ref", async (req: Request, res: Response) => {
  try {
    const ref = req.query.ref as string;
    const result = await PartnerService.validatePartnerRef(ref || "");
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/partner/invite-link — partner only, get or create invite link
router.get("/invite-link", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "PARTNER") return res.status(403).json({ message: "Only partners can generate invite links." });
    const result = await PartnerService.getOrCreateInviteLink(req.user.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/partner/onboarded-schools — partner only, schools registered via their link
router.get("/onboarded-schools", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "PARTNER") return res.status(403).json({ message: "Only partners can view onboarded schools." });
    const schools = await PartnerService.getOnboardedSchools(req.user.id);
    res.json(schools);
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

// POST /partner/invoices/generate/:eventId — generate PDF invoice for an event
router.post("/invoices/generate/:eventId", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const eventId = parseInt(req.params.eventId);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { school: true, ambassador: true }
    });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const invoiceDir = path.join(process.cwd(), 'uploads', 'invoices');
    if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

    const filename = `Event_${eventId}_${Date.now()}.pdf`;
    const filePath = path.join(invoiceDir, filename);

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(22).font('Helvetica-Bold').text('WombTo18', 50, 50);
      doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('Health & Wellness Platform', 50, 78);
      doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#e2e8f0').stroke();

      // Title
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e293b').text('Event Invoice', 50, 120);
      doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(`Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`, 50, 145);

      // Event details
      doc.moveDown(2);
      const s = event.school as any;
      const rows = [
        ['Event', event.title],
        ['Type', (event.type || '').replace(/_/g, ' ')],
        ['School', s?.schoolName || '—'],
        ['Location', [s?.city, s?.state].filter(Boolean).join(', ') || '—'],
        ['Scheduled', event.scheduledAt ? new Date(event.scheduledAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : '—'],
        ['Completed', event.completedAt ? new Date(event.completedAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : '—'],
        ['Ambassador', (event.ambassador as any)?.name || 'Not assigned'],
      ];

      const att = event.attendanceJson as any;
      if (att?.totalPresent !== undefined) {
        rows.push(['Attendance', `${att.totalPresent} / ${att.totalExpected || '—'} students present`]);
      }

      let y = doc.y + 10;
      rows.forEach(([label, value], i) => {
        const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(50, y, 495, 28).fill(bg);
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#475569').text(label, 60, y + 8);
        doc.fontSize(10).font('Helvetica').fillColor('#1e293b').text(String(value), 200, y + 8);
        y += 28;
      });

      // Footer
      doc.moveTo(50, y + 20).lineTo(545, y + 20).strokeColor('#e2e8f0').stroke();
      doc.fontSize(9).fillColor('#94a3b8').text('This is a system-generated invoice from the WombTo18 School Health Platform.', 50, y + 30, { align: 'center' });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    res.json({ filename });
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
