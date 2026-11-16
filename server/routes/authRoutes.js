
import { Router } from "express";

// ==========================================
// CONTROLLERS
// ==========================================

import {
  registerUser,
  loginUser,
  getMe,
  updateMyProfile,
  forgotPassword,
  resetPassword,
  logoutUser,
} from "../controllers/authController.js";

// ==========================================
// MIDDLEWARES
// ==========================================

import authMiddleware from "../middleware/authMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";

import {
  authRateLimiter,
  passwordResetRateLimiter,
} from "../middleware/rateLimitMiddleware.js";

// ==========================================
// VALIDATORS
// ==========================================

import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from "../validators/authValidator.js";

// ==========================================
// ROUTER
// ==========================================

const router = Router();

// ==========================================
// PUBLIC AUTH ROUTES
// ==========================================

// POST /api/auth/register
// Register a new customer account

router.post(
  "/register",
  authRateLimiter,
  validateMiddleware(validateRegister),
  registerUser
);

// POST /api/auth/login
// Login with email and password

router.post(
  "/login",
  authRateLimiter,
  validateMiddleware(validateLogin),
  loginUser
);

// POST /api/auth/forgot-password
// Request a password reset email

router.post(
  "/forgot-password",
  passwordResetRateLimiter,
  validateMiddleware(validateForgotPassword),
  forgotPassword
);

// POST /api/auth/reset-password
// Reset password using a valid reset token

router.post(
  "/reset-password",
  passwordResetRateLimiter,
  validateMiddleware(validateResetPassword),
  resetPassword
);

// ==========================================
// PROTECTED AUTH ROUTES
// ==========================================

// GET /api/auth/me
// Get currently logged-in user details

router.get(
  "/me",
  authMiddleware,
  getMe
);

// PUT /api/auth/profile
// Update currently logged-in user's profile

router.put(
  "/profile",
  authMiddleware,
  updateMyProfile
);

// POST /api/auth/logout
// Logout the authenticated user

router.post(
  "/logout",
  authMiddleware,
  logoutUser
);

// ==========================================
// EXPORT ROUTER
// ==========================================

export default router;
