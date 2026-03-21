import { Router } from "express";
import prisma from "../prismaClient";
import { ChildService } from "../services/childService";
import { SchoolService } from "../services/schoolService";
import { authenticateJWT, AuthRequest } from "../utils/authMiddleware";
import { dispatchNotification } from "../services/notificationService";

const router = Router();

// Create a child record
router.post("/", authenticateJWT, async (req: AuthRequest, res: any) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role === 'CLASS_TEACHER') {
        return res.status(403).json({ error: "Teachers cannot register new students. Please contact school admin." });
    }
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
      return res.status(404).json({ error: "School not found for this user" });
    }
    const child = await ChildService.createChild(req.body, school.id);

    await dispatchNotification({
      eventType: "CHILD_CHANGED",
      recipients: [
        child.fatherNumber
          ? { phone: child.fatherNumber, email: child.emailId ?? undefined, label: "father" }
          : undefined,
        child.motherNumber
          ? { phone: child.motherNumber, email: child.emailId ?? undefined, label: "mother" }
          : undefined,
        !child.fatherNumber && !child.motherNumber && child.emailId
          ? { email: child.emailId, label: "parent" }
          : undefined,
      ].filter(Boolean) as any,
      channels: ["sms", "email"],
      data: {
        childName: child.name,
        changeType: "created",
        schoolName: school.schoolName,
      },
      metadata: { childId: child.id, schoolId: school.id },
    });

    res.status(201).json(child);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all children for the authenticated user's school
router.get("/", authenticateJWT, async (req: AuthRequest, res: any) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
        return res.status(404).json({ error: "School not found" });
    }
    const { search } = req.query;

    let teacherClass: number | undefined;
    let teacherSection: string | undefined;
    if (req.user.role === "CLASS_TEACHER") {
      if (req.user.assignedClass == null) {
        return res.json([]);
      }
      teacherClass = req.user.assignedClass;
      teacherSection = req.user.assignedSection ?? undefined;
    }

    const children = await ChildService.getChildrenBySchool(school.id, search as string, teacherClass, teacherSection);
    res.json(children);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authenticateJWT, async (req: AuthRequest, res: any) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
        return res.status(404).json({ error: "School not found" });
    }

    const child = await ChildService.getChildWithAttendance(parseInt(req.params.id as string), school.id);
    if (!child) return res.status(404).json({ error: "Child not found" });

    // Strict school scoping: no cross-school access
    if (child.schoolId !== school.id) {
      return res.status(403).json({ error: "You do not have access to this record" });
    }

    // CLASS_TEACHER: only their assigned class/section
    if (req.user.role === "CLASS_TEACHER") {
      const ac = req.user.assignedClass;
      const as = req.user.assignedSection;
      if (ac == null) {
        return res.status(403).json({ error: "Your account is not assigned to a class. Contact school admin." });
      }
      if (child.class !== ac || (as != null && as !== "" && child.section !== as)) {
        return res.status(403).json({ error: "You can only view students from your assigned class" });
      }
    }

    res.json(child);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update child status
router.patch("/:id/status", authenticateJWT, async (req: AuthRequest, res: any) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) return res.status(404).json({ error: "School not found" });

    const childId = parseInt(req.params.id as string);
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) return res.status(404).json({ error: "Child not found" });

    if (child.schoolId !== school.id) {
      return res.status(403).json({ error: "You do not have access to this record" });
    }

    if (req.user.role === "CLASS_TEACHER") {
      const ac = req.user.assignedClass;
      const as = req.user.assignedSection;
      if (ac == null || child.class !== ac || (as != null && as !== "" && child.section !== as)) {
        return res.status(403).json({ error: "You can only update status for students in your assigned class" });
      }
    }

    const updated = await ChildService.updateChildStatus(childId, req.body.status);

    await dispatchNotification({
      eventType: "CHILD_CHANGED",
      recipients: [
        child?.fatherNumber ? { phone: child.fatherNumber, email: child.emailId ?? undefined, label: "father" } : undefined,
        child?.motherNumber ? { phone: child.motherNumber, email: child.emailId ?? undefined, label: "mother" } : undefined,
        !child?.fatherNumber && !child?.motherNumber && child?.emailId
          ? { email: child.emailId, label: "parent" }
          : undefined,
      ].filter(Boolean) as any,
      channels: ["sms", "email"],
      data: {
        childName: child?.name || "student",
        changeType: `status changed to ${String(req.body.status)}`,
        schoolName: school.schoolName,
      },
      metadata: { childId, schoolId: school.id },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update child details
router.put("/:id", authenticateJWT, async (req: AuthRequest, res: any) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    
    // Only Principal, Admin and Wombto18 Ops can edit
    const allowedRoles = ['SCHOOL_ADMIN', 'PRINCIPAL', 'WOMBTO18_OPS'];
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: "You do not have permission to edit student details." });
    }

    const childId = parseInt(req.params.id as string);
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) return res.status(404).json({ error: "Child not found" });

    const updated = await ChildService.updateChild(childId, req.body);

    const school = await prisma.school.findUnique({ where: { id: child.schoolId } });
    await dispatchNotification({
      eventType: "CHILD_CHANGED",
      recipients: [
        updated.fatherNumber
          ? { phone: updated.fatherNumber, email: updated.emailId ?? undefined, label: "father" }
          : undefined,
        updated.motherNumber
          ? { phone: updated.motherNumber, email: updated.emailId ?? undefined, label: "mother" }
          : undefined,
        !updated.fatherNumber && !updated.motherNumber && updated.emailId
          ? { email: updated.emailId, label: "parent" }
          : undefined,
      ].filter(Boolean) as any,
      channels: ["sms", "email"],
      data: {
        childName: updated.name,
        changeType: "updated",
        schoolName: school?.schoolName || "your school",
      },
      metadata: { childId, schoolId: child.schoolId },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Toggle attendance for a specific event type
router.post("/:id/attendance", authenticateJWT, async (req: AuthRequest, res: any) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) return res.status(404).json({ error: "School not found" });

    const childId = parseInt(req.params.id as string);
    const { eventType, status } = req.body;

    if (!eventType || !status) {
      return res.status(400).json({ error: "eventType and status are required" });
    }

    const updatedEvent = await ChildService.updateAttendance(childId, school.id, eventType, status);
    res.json({ success: true, event: updatedEvent });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
