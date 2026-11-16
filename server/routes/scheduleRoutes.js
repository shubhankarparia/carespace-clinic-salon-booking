
import { Router } from "express";

import {
  getWorkingHours,
  saveWorkingHours,
  deleteWorkingHours,
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "../controllers/scheduleController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

// All schedule-management routes require admin access.
router.use(authMiddleware, adminMiddleware);

// GET /api/schedule/working-hours
router.get("/working-hours", getWorkingHours);

// POST /api/schedule/working-hours
router.post("/working-hours", saveWorkingHours);

// DELETE /api/schedule/working-hours/:id
router.delete("/working-hours/:id", deleteWorkingHours);

// GET /api/schedule/holidays
router.get("/holidays", getHolidays);

// POST /api/schedule/holidays
router.post("/holidays", createHoliday);

// PATCH /api/schedule/holidays/:id
router.patch("/holidays/:id", updateHoliday);

// DELETE /api/schedule/holidays/:id
router.delete("/holidays/:id", deleteHoliday);

export default router;
