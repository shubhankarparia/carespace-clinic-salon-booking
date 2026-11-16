
import { Router } from "express";

// Service controllers
import {
  getAllServices,
  getServiceById,
  getAllServicesAdmin,
  createService,
  updateService,
  deleteService,
  updateServiceStatus,
} from "../controllers/serviceController.js";

// Authentication and authorization
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

// Validation middleware
import validateMiddleware from "../middleware/validateMiddleware.js";

// Service validators
import {
  validateCreateService,
  validateUpdateService,
  validateServiceId,
} from "../validators/serviceValidator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| PUBLIC SERVICE ROUTES
|--------------------------------------------------------------------------
*/

// GET /api/services
// Get all active clinic and salon services
// Optional: ?category=clinic
// Optional: ?category=salon
// Optional: ?featured=true
// Optional: ?search=hair
// Optional: ?page=1&limit=20
router.get(
  "/",
  getAllServices
);

// GET /api/services/:id
// Get individual active service details
router.get(
  "/:id",
  validateMiddleware(validateServiceId),
  getServiceById
);

/*
|--------------------------------------------------------------------------
| ADMIN SERVICE ROUTES
|--------------------------------------------------------------------------
| All routes below require authentication and admin access.
*/

// Apply authentication and admin authorization
router.use(
  "/admin",
  authMiddleware,
  adminMiddleware
);

// GET /api/services/admin/all
// Get all services, including inactive services
router.get(
  "/admin/all",
  getAllServicesAdmin
);

// POST /api/services
// Create a new clinic or salon service
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(validateCreateService),
  createService
);

// PATCH /api/services/:id
// Update an existing service
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(validateServiceId),
  validateMiddleware(validateUpdateService),
  updateService
);

// DELETE /api/services/:id
// Soft-delete (deactivate) a service
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(validateServiceId),
  deleteService
);

// PATCH /api/services/:id/status
// Activate or deactivate a service
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(validateServiceId),
  updateServiceStatus
);

export default router;
