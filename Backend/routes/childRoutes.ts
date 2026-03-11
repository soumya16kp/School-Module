import { Router } from "express";
import prisma from "../prismaClient";
import { ChildService } from "../services/childService";
import { SchoolService } from "../services/schoolService";
import { authenticateJWT } from "../utils/authMiddleware";

const router = Router();

// Create a child record
router.post("/", authenticateJWT, async (req: any, res: any) => {
  try {
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
router.get("/", authenticateJWT, async (req: any, res: any) => {
  try {
    const school = await SchoolService.getSchoolByUserId(req.user.id);
    if (!school) {
        return res.status(404).json({ error: "School not found" });
    }
    const { search } = req.query;
    const children = await ChildService.getChildrenBySchool(school.id, search as string);
    res.json(children);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authenticateJWT, async (req: any, res: any) => {
  try {
    const child = await prisma.child.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        healthRecords: true
      }
    });
    if (!child) return res.status(404).json({ error: "Child not found" });
    res.json(child);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update child status
router.patch("/:id/status", authenticateJWT, async (req: any, res: any) => {
  try {
    const child = await ChildService.updateChildStatus(parseInt(req.params.id), req.body.status);
    res.json(child);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
