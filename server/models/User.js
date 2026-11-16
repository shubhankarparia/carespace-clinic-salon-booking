
import mongoose from "mongoose";

// ==========================================
// USER SCHEMA
// ==========================================

const userSchema = new mongoose.Schema(
  {
    // ========================================
    // PERSONAL INFORMATION
    // ========================================

    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
      default: "",
    },

    // ========================================
    // CONTACT INFORMATION
    // ========================================

    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
      match: [
        /^\S+@\S+\.\S+$/,
        "Enter a valid email address",
      ],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^[+]?[0-9\s()-]{7,20}$/,
        "Enter a valid phone number",
      ],
    },

    // ========================================
    // AUTHENTICATION
    // ========================================

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    // ========================================
    // USER ROLE
    // ========================================

    role: {
      type: String,
      enum: {
        values: ["customer", "staff", "admin"],
        message: "Invalid user role",
      },
      default: "customer",
      required: true,
    },

    // ========================================
    // PROFILE INFORMATION
    // ========================================

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    gender: {
      type: String,
      enum: [
        "male",
        "female",
        "other",
        "prefer_not_to_say",
      ],
      default: "prefer_not_to_say",
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    // ========================================
    // ADDRESS INFORMATION
    // ========================================

    address: {
      street: {
        type: String,
        trim: true,
        default: "",
        maxlength: 150,
      },

      city: {
        type: String,
        trim: true,
        default: "",
        maxlength: 100,
      },

      state: {
        type: String,
        trim: true,
        default: "",
        maxlength: 100,
      },

      postalCode: {
        type: String,
        trim: true,
        default: "",
        maxlength: 15,
      },

      country: {
        type: String,
        trim: true,
        default: "India",
      },
    },

    // ========================================
    // VERIFICATION STATUS
    // ========================================

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // ========================================
    // ACCOUNT STATUS
    // ========================================

    isActive: {
      type: Boolean,
      default: true,
    },

    // ========================================
    // LOGIN INFORMATION
    // ========================================

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

// ==========================================
// DATABASE INDEXES
// ==========================================

// Email is already indexed by unique: true.
// This compound index supports admin role/status queries.
userSchema.index({
  role: 1,
  isActive: 1,
});

// Useful for customer listing and filtering.
userSchema.index({
  createdAt: -1,
});

// ==========================================
// MODEL
// ==========================================

const User = mongoose.model("User", userSchema);

export default User;
