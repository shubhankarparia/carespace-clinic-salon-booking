
import { Router } from "express";

// User controllers
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUserStatus,
} from "../controllers/userController.js";

// Authentication and authorization middleware
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
| All user routes require a valid login token.
*/
router.use(authMiddleware);

/*
|--------------------------------------------------------------------------
| CUSTOMER PROFILE ROUTES
|--------------------------------------------------------------------------
*/

// GET /api/users/me
// Get currently logged-in user's profile
router.get(
  "/me",
  getUserProfile
);

// PATCH /api/users/me
// Update currently logged-in user's profile
router.patch(
  "/me",
  updateUserProfile
);

/*
|--------------------------------------------------------------------------
| ADMIN USER MANAGEMENT ROUTES
|--------------------------------------------------------------------------
*/

// GET /api/users
// Get all users with pagination, search and filters
router.get(
  "/",
  adminMiddleware,
  getAllUsers
);

// GET /api/users/:id
// Get individual user details
router.get(
  "/:id",
  adminMiddleware,
  getUserById
);

// PATCH /api/users/:id/status
// Activate or deactivate a user account
router.patch(
  "/:id/status",
  adminMiddleware,
  updateUserStatus
);

export default router;
