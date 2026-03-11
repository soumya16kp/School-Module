import { Router } from "express";
import multer from "multer";
import path from "path";
import { HealthService } from "../services/healthService";
import { authenticateJWT } from "../utils/authMiddleware";

const router = Router();

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get health records for a child
router.get("/:childId", authenticateJWT, async (req: any, res: any) => {
  try {
    const childId = parseInt(req.params.childId);
    const records = await HealthService.getRecordsForChild(childId);
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add health record for a child
router.post("/:childId", authenticateJWT, upload.single('reportFile'), async (req: any, res: any) => {
  try {
    const childId = parseInt(req.params.childId);
    const data = {
      ...req.body,
      reportFile: req.file ? req.file.filename : null
    };
    const record = await HealthService.addRecord(childId, data);
    res.status(201).json(record);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
