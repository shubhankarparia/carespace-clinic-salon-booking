
import mongoose from "mongoose";

// ==========================================
// BUSINESS SETTINGS SCHEMA
// ==========================================

const businessSettingsSchema = new mongoose.Schema(
  {
    // Business Information
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      default: "CareSpace Clinic & Salon",
      trim: true,
      maxlength: 150,
    },

    tagline: {
      type: String,
      default: "Your wellness and beauty, our priority.",
      trim: true,
      maxlength: 250,
    },

    logo: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: 150,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 20,
    },

    // Business Address
    address: {
      street: {
        type: String,
        trim: true,
        default: "",
      },

      city: {
        type: String,
        trim: true,
        default: "",
      },

      state: {
        type: String,
        trim: true,
        default: "",
      },

      postalCode: {
        type: String,
        trim: true,
        default: "",
      },

      country: {
        type: String,
        trim: true,
        default: "India",
      },
    },

    // Regional Settings
    currency: {
      type: String,
      enum: ["INR", "USD"],
      default: "INR",
      uppercase: true,
      trim: true,
    },

    currencySymbol: {
      type: String,
      default: "₹",
      trim: true,
      maxlength: 5,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
      trim: true,
    },

    // Booking Settings
    bookingSettings: {
      allowOnlineBooking: {
        type: Boolean,
        default: true,
      },

      requireBookingConfirmation: {
        type: Boolean,
        default: true,
      },

      allowCancellation: {
        type: Boolean,
        default: true,
      },

      cancellationNoticeHours: {
        type: Number,
        default: 24,
        min: 0,
      },

      advanceBookingDays: {
        type: Number,
        default: 30,
        min: 1,
      },

      minimumBookingNoticeHours: {
        type: Number,
        default: 1,
        min: 0,
      },

      slotIntervalMinutes: {
        type: Number,
        default: 15,
        min: 5,
      },
    },

    // Social Media Links
    socialLinks: {
      website: {
        type: String,
        trim: true,
        default: "",
      },

      facebook: {
        type: String,
        trim: true,
        default: "",
      },

      instagram: {
        type: String,
        trim: true,
        default: "",
      },

      youtube: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // Notification Settings
    notificationSettings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },

      bookingConfirmation: {
        type: Boolean,
        default: true,
      },

      bookingCancellation: {
        type: Boolean,
        default: true,
      },

      appointmentReminder: {
        type: Boolean,
        default: true,
      },
    },

    // Last Updated By
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,
  }
);

// ==========================================
// INDEXES
// ==========================================

businessSettingsSchema.index({ businessName: 1 });

// ==========================================
// MODEL
// ==========================================

const BusinessSettings =
  mongoose.models.BusinessSettings ||
  mongoose.model("BusinessSettings", businessSettingsSchema);

export default BusinessSettings;
