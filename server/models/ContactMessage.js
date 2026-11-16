
import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    // Visitor name
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters."],
      maxlength: [100, "Name cannot exceed 100 characters."],
    },

    // Visitor email
    email: {
      type: String,
      required: [true, "Email address is required."],
      trim: true,
      lowercase: true,
      maxlength: [150, "Email cannot exceed 150 characters."],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    // Message subject
    subject: {
      type: String,
      required: [true, "Subject is required."],
      trim: true,
      minlength: [3, "Subject must contain at least 3 characters."],
      maxlength: [200, "Subject cannot exceed 200 characters."],
    },

    // Visitor message
    message: {
      type: String,
      required: [true, "Message is required."],
      trim: true,
      minlength: [10, "Message must contain at least 10 characters."],
      maxlength: [5000, "Message cannot exceed 5000 characters."],
    },

    // Message status for admin management
    status: {
      type: String,
      enum: {
        values: ["new", "read", "resolved"],
        message: "Invalid contact message status.",
      },
      default: "new",
      index: true,
    },

    // Optional admin note
    adminNote: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin note cannot exceed 1000 characters."],
      default: "",
    },

    // Date when admin first reads the message
    readAt: {
      type: Date,
      default: null,
    },

    // Date when admin resolves the message
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for admin message filtering and sorting
contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1 });

// Prevent model recompilation errors during development
const ContactMessage =
  mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessage;
