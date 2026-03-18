import { Router } from "express";
import { authenticateJWT, AuthRequest, canScheduleEvents, canViewHealth } from "../utils/authMiddleware";
import { EventService } from "../services/eventService";
import { SchoolService } from "../services/schoolService";
import prisma from "../prismaClient";
import { dispatchNotification } from "../services/notificationService";

const router = Router();

// All routes require auth
router.use(authenticateJWT);

// GET /api/events – list events for user's school
router.get("/", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canViewHealth(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const academicYear = req.query.academicYear as string | undefined;
    const events = await EventService.listBySchool(school.id, academicYear);
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /api/events – create event (requires canScheduleEvents)
router.post("/", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canScheduleEvents(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const { type, title, description, academicYear, scheduledAt, completedAt, attendanceJson, ambassadorId, goalAmount } = req.body;
    if (!type || !title || !academicYear) {
      return res.status(400).json({ message: "type, title, and academicYear are required" });
    }
    const event = await EventService.create({
      schoolId: school.id,
      type,
      title,
      description,
      academicYear,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      completedAt: completedAt ? new Date(completedAt) : undefined,
      attendanceJson,
      ambassadorId,
      goalAmount: goalAmount ? parseFloat(goalAmount) : 0,
    });

    // Notify parents + the partner(s) linked to this specific event.
    if (event.scheduledAt) {
      const normalizePhoneKey = (p: string) => p.replace(/\D/g, "").slice(-10);
      const parentRecipients: Array<{ phone?: string; email?: string; label?: string }> = [];
      const seenPhone = new Set<string>();
      const seenEmail = new Set<string>();

      const children = await prisma.child.findMany({
        where: { schoolId: school.id },
        select: { fatherNumber: true, motherNumber: true, emailId: true },
      });

      for (const c of children) {
        if (c.fatherNumber) {
          const key = normalizePhoneKey(c.fatherNumber);
          if (!seenPhone.has(key)) {
            parentRecipients.push({ phone: c.fatherNumber, email: c.emailId ?? undefined, label: "father" });
            seenPhone.add(key);
          }
        }
        if (c.motherNumber) {
          const key = normalizePhoneKey(c.motherNumber);
          if (!seenPhone.has(key)) {
            parentRecipients.push({ phone: c.motherNumber, email: c.emailId ?? undefined, label: "mother" });
            seenPhone.add(key);
          }
        }
        if (c.emailId && !seenEmail.has(c.emailId)) {
          // Email-only fallback if phone numbers are missing for a record.
          parentRecipients.push({ email: c.emailId, label: "parent" });
          seenEmail.add(c.emailId);
        }
      }

      const partnerRecipients: Array<{ phone?: string; email?: string; label?: string }> = [];
      const seenPartnerPhone = new Set<string>();
      const seenPartnerEmail = new Set<string>();

      const donations = await prisma.donation.findMany({
        where: { eventId: event.id },
        include: { user: { select: { phone: true, email: true, role: true } } },
      });

      for (const d of donations) {
        const u = d.user;
        if (!u || u.role !== "PARTNER") continue;

        if (u.phone) {
          const key = normalizePhoneKey(u.phone);
          if (!seenPartnerPhone.has(key)) {
            partnerRecipients.push({ phone: u.phone, email: u.email ?? undefined, label: "partner" });
            seenPartnerPhone.add(key);
          }
        }
        if (u.email && !seenPartnerEmail.has(u.email)) {
          partnerRecipients.push({ email: u.email, label: "partner" });
          seenPartnerEmail.add(u.email);
        }
      }

      const scheduledAtText = new Date(event.scheduledAt).toLocaleDateString();

      await dispatchNotification({
        eventType: "EVENT_SCHEDULED",
        recipients: [...parentRecipients, ...partnerRecipients],
        channels: ["sms", "email", "whatsapp"],
        data: {
          eventTitle: event.title,
          scheduledAtText,
          schoolName: school.schoolName,
        },
        metadata: { eventId: event.id, schoolId: school.id },
      });
    }

    res.status(201).json(event);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Bad request" });
  }
});

// GET /api/events/:id
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canViewHealth(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }
    const event = await EventService.getById(id, school.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// PATCH /api/events/:id – update event (requires canScheduleEvents)
router.patch("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canScheduleEvents(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }
    const { type, title, description, academicYear, scheduledAt, completedAt, attendanceJson, ambassadorId, goalAmount } = req.body;
    const updatePayload: Record<string, unknown> = {
      type,
      title,
      description,
      academicYear,
      scheduledAt: scheduledAt != null ? new Date(scheduledAt) : undefined,
      attendanceJson,
      ambassadorId,
      goalAmount: goalAmount != null ? parseFloat(goalAmount) : undefined,
    };
    if (completedAt !== undefined) {
      updatePayload.completedAt = completedAt == null ? null : new Date(completedAt);
    }

    const before = await EventService.getById(id, school.id);
    await EventService.update(id, school.id, updatePayload as any);
    const event = await EventService.getById(id, school.id);

    // Only notify when scheduledAt was set/changed (avoid duplicates).
    const beforeTime = before?.scheduledAt ? new Date(before.scheduledAt).getTime() : null;
    const afterTime = event?.scheduledAt ? new Date(event.scheduledAt).getTime() : null;
    if (event && afterTime && afterTime !== beforeTime) {
      const normalizePhoneKey = (p: string) => p.replace(/\D/g, "").slice(-10);
      const parentRecipients: Array<{ phone?: string; email?: string; label?: string }> = [];
      const seenPhone = new Set<string>();
      const seenEmail = new Set<string>();

      const children = await prisma.child.findMany({
        where: { schoolId: school.id },
        select: { fatherNumber: true, motherNumber: true, emailId: true },
      });

      for (const c of children) {
        if (c.fatherNumber) {
          const key = normalizePhoneKey(c.fatherNumber);
          if (!seenPhone.has(key)) {
            parentRecipients.push({ phone: c.fatherNumber, email: c.emailId ?? undefined, label: "father" });
            seenPhone.add(key);
          }
        }
        if (c.motherNumber) {
          const key = normalizePhoneKey(c.motherNumber);
          if (!seenPhone.has(key)) {
            parentRecipients.push({ phone: c.motherNumber, email: c.emailId ?? undefined, label: "mother" });
            seenPhone.add(key);
          }
        }
        if (c.emailId && !seenEmail.has(c.emailId)) {
          parentRecipients.push({ email: c.emailId, label: "parent" });
          seenEmail.add(c.emailId);
        }
      }

      const partnerRecipients: Array<{ phone?: string; email?: string; label?: string }> = [];
      const seenPartnerPhone = new Set<string>();
      const seenPartnerEmail = new Set<string>();

      const donations = await prisma.donation.findMany({
        where: { eventId: event.id },
        include: { user: { select: { phone: true, email: true, role: true } } },
      });

      for (const d of donations) {
        const u = d.user;
        if (!u || u.role !== "PARTNER") continue;

        if (u.phone) {
          const key = normalizePhoneKey(u.phone);
          if (!seenPartnerPhone.has(key)) {
            partnerRecipients.push({ phone: u.phone, email: u.email ?? undefined, label: "partner" });
            seenPartnerPhone.add(key);
          }
        }
        if (u.email && !seenPartnerEmail.has(u.email)) {
          partnerRecipients.push({ email: u.email, label: "partner" });
          seenPartnerEmail.add(u.email);
        }
      }

      const scheduledAtText = new Date(event.scheduledAt as Date).toLocaleDateString();

      await dispatchNotification({
        eventType: "EVENT_SCHEDULED",
        recipients: [...parentRecipients, ...partnerRecipients],
        channels: ["sms", "email", "whatsapp"],
        data: {
          eventTitle: event.title,
          scheduledAtText,
          schoolName: school.schoolName,
        },
        metadata: { eventId: event.id, schoolId: school.id },
      });
    }

    res.json(event);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Bad request" });
  }
});

// DELETE /api/events/:id (requires canScheduleEvents)
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.user || !canScheduleEvents(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }
    await EventService.delete(id, school.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
