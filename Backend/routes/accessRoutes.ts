import { Router } from "express";
import prisma from "../prismaClient";
import crypto from "crypto";
import { authenticateParentJWT, ParentRequest } from "../utils/parentAuthMiddleware";

const router = Router();

// POST /api/access/request/:childId - Anyone with the QR can submit a request (no auth needed)
router.post("/request/:childId", async (req, res) => {
  try {
    const childId = parseInt(req.params.childId as string);
    const { requesterName, requesterPhone, requesterRole, reason } = req.body;

    if (!requesterName || !requesterPhone || !reason) {
      return res.status(400).json({ message: "Name, phone, and reason are required." });
    }

    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) return res.status(404).json({ message: "Student not found." });

    const request = await prisma.accessRequest.create({
      data: {
        childId,
        requesterName,
        requesterPhone,
        requesterRole: requesterRole || "Other",
        reason,
        status: "PENDING",
      }
    });

    res.status(201).json({ 
      message: "Request submitted. The parent will be notified. Please wait for approval.",
      requestId: request.id
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/access/requests - Parent sees their children's pending requests
router.get("/requests", authenticateParentJWT, async (req: ParentRequest, res) => {
  try {
    if (!req.parent) return res.status(401).json({ message: "Unauthenticated" });

    const children = await prisma.child.findMany({
      where: {
        OR: [
          { fatherNumber: req.parent.phone },
          { motherNumber: req.parent.phone }
        ]
      },
      select: { id: true }
    });

    const childIds = children.map((c: any) => c.id);

    const requests = await prisma.accessRequest.findMany({
      where: { childId: { in: childIds } },
      include: {
        child: { select: { name: true, class: true, section: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/access/requests/:id/approve - Parent approves a request
router.patch("/requests/:id/approve", authenticateParentJWT, async (req: ParentRequest, res) => {
  try {
    if (!req.parent) return res.status(401).json({ message: "Unauthenticated" });

    const requestId = parseInt(req.params.id as string);
    const accessToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const updated = await prisma.accessRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", accessToken, expiresAt }
    });

    res.json({ 
      message: "Access approved for 24 hours.",
      accessToken: updated.accessToken,
      expiresAt: updated.expiresAt
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/access/requests/:id/deny - Parent denies a request
router.patch("/requests/:id/deny", authenticateParentJWT, async (req: ParentRequest, res) => {
  try {
    if (!req.parent) return res.status(401).json({ message: "Unauthenticated" });

    await prisma.accessRequest.update({
      where: { id: parseInt(req.params.id as string) },
      data: { status: "DENIED" }
    });

    res.json({ message: "Request denied." });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/access/view/:token - Any approved requester can view health data with a valid token
router.get("/view/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const request = await prisma.accessRequest.findUnique({
      where: { accessToken: token as string },
      include: {
        child: {
          include: {
            school: { select: { schoolName: true, city: true } },
            healthRecords: { orderBy: { academicYear: 'desc' }, take: 1 }
          }
        }
      }
    });

    if (!request || request.status !== "APPROVED") {
      return res.status(403).json({ message: "Invalid or unapproved access token." });
    }

    if (request.expiresAt && new Date() > request.expiresAt) {
      return res.status(403).json({ message: "Access token has expired. Please request again." });
    }

    const { child } = request;
    const latestRecord = child.healthRecords[0] || null;

    res.json({
      student: {
        name: child.name,
        class: child.class,
        section: child.section,
        gender: child.gender,
        registrationNo: child.registrationNo,
        school: child.school.schoolName,
        city: child.school.city,
      },
      healthSummary: latestRecord ? {
        academicYear: latestRecord.academicYear,
        height: latestRecord.height,
        weight: latestRecord.weight,
        bmi: latestRecord.bmi,
        bmiCategory: latestRecord.bmiCategory,
        dentalOverallHealth: latestRecord.dentalOverallHealth,
        visionOverall: latestRecord.visionOverall,
        immunization: latestRecord.immunization,
      } : null,
      approvedFor: request.requesterName,
      expiresAt: request.expiresAt,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/access/check/:requestId - Requester polls to check if their request was approved
router.get("/check/:requestId", async (req, res) => {
  try {
    const request = await prisma.accessRequest.findUnique({
      where: { id: parseInt(req.params.requestId as string) }
    });
    if (!request) return res.status(404).json({ message: "Request not found." });

    if (request.status === "APPROVED" && request.accessToken) {
      res.json({ status: "APPROVED", accessToken: request.accessToken });
    } else {
      res.json({ status: request.status });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
