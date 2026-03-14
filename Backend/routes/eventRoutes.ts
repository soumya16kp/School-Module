import { Router } from "express";
import { authenticateJWT, AuthRequest, canScheduleEvents, canViewHealth } from "../utils/authMiddleware";
import { EventService } from "../services/eventService";
import { SchoolService } from "../services/schoolService";

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
    const { type, title, description, academicYear, scheduledAt, completedAt, attendanceJson, ambassadorId } = req.body;
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
    });
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
    const { type, title, description, academicYear, scheduledAt, completedAt, attendanceJson, ambassadorId } = req.body;
    const updatePayload: Record<string, unknown> = {
      type,
      title,
      description,
      academicYear,
      scheduledAt: scheduledAt != null ? new Date(scheduledAt) : undefined,
      attendanceJson,
      ambassadorId,
    };
    if (completedAt !== undefined) {
      updatePayload.completedAt = completedAt == null ? null : new Date(completedAt);
    }
    await EventService.update(id, school.id, updatePayload as any);
    const event = await EventService.getById(id, school.id);
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
