
import { Router } from "express";

import {
  getAllStaff,
  getAllStaffAdmin,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";

import {
  validateCreateStaff,
  validateUpdateStaff,
  validateStaffId,
} from "../validators/staffValidator.js";

const router = Router();

/* ==========================================
   PUBLIC: GET ACTIVE AND AVAILABLE STAFF
   GET /api/staff
========================================== */
router.get("/", getAllStaff);

/* ==========================================
   ADMIN: GET ALL STAFF INCLUDING INACTIVE
   GET /api/staff/admin/all
========================================== */
router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllStaffAdmin
);

/* ==========================================
   PUBLIC: GET STAFF BY ID
   GET /api/staff/:id
========================================== */
router.get(
  "/:id",
  validateMiddleware(validateStaffId),
  getStaffById
);

/* ==========================================
   ADMIN: CREATE STAFF
   POST /api/staff
========================================== */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(validateCreateStaff),
  createStaff
);

/* ==========================================
   ADMIN: UPDATE STAFF
   PATCH /api/staff/:id
========================================== */
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(validateStaffId),
  validateMiddleware(validateUpdateStaff),
  updateStaff
);

/* ==========================================
   ADMIN: SOFT DELETE STAFF
   DELETE /api/staff/:id
========================================== */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(validateStaffId),
  deleteStaff
);

export default router;
