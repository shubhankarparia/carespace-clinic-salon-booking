
import { Router } from "express";

import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  validateCreateBooking,
  validateUpdateBookingStatus,
  validateBookingId,
} from "../validators/bookingValidator.js";

const router = Router();

// ==========================================
// AUTHENTICATION
// All booking routes require login
// ==========================================
router.use(authMiddleware);

// ==========================================
// CUSTOMER ROUTES
// ==========================================

// Create a new appointment
router.post(
  "/",
  validateCreateBooking,
  createBooking
);

// Get logged-in customer's bookings
router.get(
  "/my",
  getMyBookings
);

// Get a single booking by ID
router.get(
  "/:id",
  validateBookingId,
  getBookingById
);

// Cancel a booking
router.patch(
  "/:id/cancel",
  validateBookingId,
  cancelBooking
);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all bookings
router.get(
  "/",
  adminMiddleware,
  getAllBookings
);

// Update booking status
router.patch(
  "/:id/status",
  adminMiddleware,
  validateBookingId,
  validateUpdateBookingStatus,
  updateBookingStatus
);

export default router;
