import express from "express";
import { SchoolService } from "../services/schoolService";
import { authenticateJWT, AuthRequest } from "../utils/authMiddleware";

const router = express.Router();

router.post("/register", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const school = await SchoolService.registerSchool(req.body, req.user.id);
    res.status(201).json(school);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
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

export default router;
