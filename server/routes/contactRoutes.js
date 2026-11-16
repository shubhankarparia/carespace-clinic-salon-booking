
import { Router } from "express";

import {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
} from "../controllers/contactController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

// Public contact form
router.post("/", createContactMessage);

// Admin-only contact inbox
router.get("/", authMiddleware, adminMiddleware, getContactMessages);

router.get("/:id", authMiddleware, adminMiddleware, getContactMessageById);

router.patch("/:id/status", authMiddleware, adminMiddleware, updateContactMessageStatus);

router.delete("/:id", authMiddleware, adminMiddleware, deleteContactMessage);

export default router;
