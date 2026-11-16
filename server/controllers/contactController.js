
import mongoose from "mongoose";
import ContactMessage from "../models/ContactMessage.js";

// ==========================================
// VALID MESSAGE STATUSES
// ==========================================

const VALID_STATUSES = ["new", "read", "resolved"];

// ==========================================
// 1. CREATE CONTACT MESSAGE
// POST /api/contact
// Public route
// ==========================================

export const createContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Required field validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const contactMessage = await ContactMessage.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      subject: String(subject).trim(),
      message: String(message).trim(),
      status: "new",
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully.",
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. GET ALL CONTACT MESSAGES
// GET /api/contact
// Admin route
// ==========================================

export const getContactMessages = async (req, res, next) => {
  try {
    // Pagination
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    const { status, search } = req.query;

    // MongoDB filter
    const filter = {};

    // Status filter
    if (status && status !== "all") {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid message status.",
        });
      }

      filter.status = status;
    }

    // Search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
      ];
    }

    // IMPORTANT:
    // Count all messages matching the current filters.
    // Do not count only the messages on the current page.
    const total = await ContactMessage.countDocuments(filter);

    // Fetch paginated messages
    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate total pages
    const totalPages = Math.max(
      1,
      Math.ceil(total / limit)
    );

    return res.status(200).json({
      success: true,
      message: "Contact messages fetched successfully.",

      data: messages,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. GET SINGLE CONTACT MESSAGE
// GET /api/contact/:id
// Admin route
// ==========================================

export const getContactMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact message ID.",
      });
    }

    const contactMessage = await ContactMessage.findById(id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message fetched successfully.",
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. UPDATE CONTACT MESSAGE STATUS
// PATCH /api/contact/:id/status
// Admin route
// ==========================================

export const updateContactMessageStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact message ID.",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be new, read, or resolved.",
      });
    }

    if (
      adminNote !== undefined &&
      (
        typeof adminNote !== "string" ||
        adminNote.length > 1000
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin note must be a string with a maximum of 1000 characters.",
      });
    }

    const contactMessage = await ContactMessage.findById(id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    contactMessage.status = status;

    // Set or reset status timestamps
    if (status === "read") {
      contactMessage.readAt =
        contactMessage.readAt || new Date();

      contactMessage.resolvedAt = null;
    } else if (status === "resolved") {
      contactMessage.readAt =
        contactMessage.readAt || new Date();

      contactMessage.resolvedAt = new Date();
    } else {
      contactMessage.readAt = null;
      contactMessage.resolvedAt = null;
    }

    // Update admin note when provided
    if (adminNote !== undefined) {
      contactMessage.adminNote = adminNote.trim();
    }

    await contactMessage.save();

    return res.status(200).json({
      success: true,
      message: "Contact message updated successfully.",
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. DELETE CONTACT MESSAGE
// DELETE /api/contact/:id
// Admin route
// ==========================================

export const deleteContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact message ID.",
      });
    }

    const contactMessage = await ContactMessage.findByIdAndDelete(id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully.",
      data: {
        id: contactMessage._id,
      },
    });
  } catch (error) {
    next(error);
  }
};
