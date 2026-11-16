
import { Router } from "express";

import {
  getBookingReport,
  getRevenueReport,
  getPopularServicesReport,
  getCustomerReport,
} from "../controllers/reportController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

// All reports are restricted to administrators.
router.use(authMiddleware, adminMiddleware);

// GET /api/reports/bookings
router.get("/bookings", getBookingReport);

// GET /api/reports/revenue
router.get("/revenue", getRevenueReport);

// GET /api/reports/popular-services
router.get("/popular-services", getPopularServicesReport);

// GET /api/reports/customers
router.get("/customers", getCustomerReport);

export default router;
