
import express from "express";

import {
  getDashboardStats,
  getBusinessSettings,
  updateBusinessSettings,
  updateUserRole,
  getAllBookings,
  getAllCustomers,
  getReports,
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// ==========================================
// ADMIN AUTHENTICATION
// All routes require an authenticated admin
// ==========================================

router.use(authMiddleware);
router.use(adminMiddleware);

// ==========================================
// DASHBOARD
// ==========================================

// GET /api/admin/dashboard
router.get("/dashboard", getDashboardStats);

// ==========================================
// BOOKING MANAGEMENT
// ==========================================

// GET /api/admin/bookings
router.get("/bookings", getAllBookings);

// ==========================================
// CUSTOMER MANAGEMENT
// ==========================================

// GET /api/admin/customers
router.get("/customers", getAllCustomers);


// reports ==========
router.get("/reports", getReports);

// ==========================================
// BUSINESS SETTINGS
// ==========================================

// GET /api/admin/settings
router.get("/settings", getBusinessSettings);

// PUT /api/admin/settings
router.put("/settings", updateBusinessSettings);

// ==========================================
// USER MANAGEMENT
// ==========================================

// PATCH /api/admin/users/:id/role
router.patch("/users/:id/role", updateUserRole);




export default router;
