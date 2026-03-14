import { Router } from "express";
import prisma from "../prismaClient";
import { ChildService } from "../services/childService";
import { SchoolService } from "../services/schoolService";
import { authenticateJWT, AuthRequest } from "../utils/authMiddleware";

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

    const teacherClass = req.user.role === 'CLASS_TEACHER' ? req.user.assignedClass : undefined;
    const teacherSection = req.user.role === 'CLASS_TEACHER' ? req.user.assignedSection : undefined;

    const children = await ChildService.getChildrenBySchool(school.id, search as string, teacherClass, teacherSection);
    res.json(children);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authenticateJWT, async (req: AuthRequest, res: any) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const child = await prisma.child.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: {
        healthRecords: true
      }
    });

    if (!child) return res.status(404).json({ error: "Child not found" });

    // Restriction for CLASS_TEACHER
    if (req.user.role === 'CLASS_TEACHER') {
        if (child.class !== req.user.assignedClass || child.section !== req.user.assignedSection) {
            return res.status(403).json({ error: "You can only view students from your own class" });
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
    
    const childId = parseInt(req.params.id as string);
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) return res.status(404).json({ error: "Child not found" });

    // Restriction for CLASS_TEACHER
    if (req.user.role === 'CLASS_TEACHER') {
        if (child.class !== req.user.assignedClass || child.section !== req.user.assignedSection) {
            return res.status(403).json({ error: "You can only update status for students in your own class" });
        }
    }

    const updated = await ChildService.updateChildStatus(childId, req.body.status);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
