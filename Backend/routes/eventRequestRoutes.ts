import { Router } from "express";
import { authenticateJWT, AuthRequest } from "../utils/authMiddleware";
import { EventRequestService } from "../services/eventRequestService";

const router = Router();

router.use(authenticateJWT);

// GET /api/event-requests – Admin view to see all requests (WOMBTO18_OPS)
router.get("/", async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "WOMBTO18_OPS") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const data = await EventRequestService.listAll();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/event-requests – School creates a request for an event
router.post("/", async (req: AuthRequest, res) => {
  try {
    const { eventId, schoolId, personName, personContact, personDetails } = req.body;
    if (!eventId || !schoolId) return res.status(400).json({ message: "Missing required fields" });
    
    const request = await EventRequestService.create({
      eventId,
      schoolId,
      requesterId: req.user!.id,
      personName,
      personContact,
      personDetails
    });
    res.json(request);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/event-requests/:id/status – WOMBTO18_OPS accepts/rejects a request
router.patch("/:id/status", async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "WOMBTO18_OPS") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { status, officialNotes } = req.body;
    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const request = await EventRequestService.updateStatus(parseInt(req.params.id), status, officialNotes);
    res.json(request);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
