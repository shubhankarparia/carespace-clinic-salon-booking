
import { Router } from "express";

import {
  getAvailableSlots,
} from "../controllers/availabilityController.js";

const router = Router();

// GET /api/availability/slots
// Query: serviceId, staffId, date
router.get("/slots", getAvailableSlots);

export default router;
