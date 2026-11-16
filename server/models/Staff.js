
import mongoose from "mongoose";

// ==========================================
// STAFF SCHEMA
// ==========================================
const staffSchema = new mongoose.Schema(
  {
    // Optional linked user account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Staff full name
    name: {
      type: String,
      required: [true, "Staff name is required"],
      trim: true,
      maxlength: [120, "Staff name cannot exceed 120 characters"],
    },

    // Staff email
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
      maxlength: 150,
    },

    // Staff phone
    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 20,
    },

    // Department
    category: {
      type: String,
      enum: {
        values: ["clinic", "salon"],
        message: "Category must be clinic or salon",
      },
      required: [true, "Staff category is required"],
      index: true,
    },

    // Staff role
    role: {
      type: String,
      required: [true, "Staff role is required"],
      trim: true,
      enum: {
        values: [
          "Doctor",
          "Dentist",
          "Nurse",
          "Physiotherapist",
          "Lab Technician",
          "Receptionist",
          "Hair Stylist",
          "Beautician",
          "Makeup Artist",
          "Hair Therapist",
          "Nail Technician",
        ],
        message: "Please select a valid staff role",
      },
    },

    // Specialization
    specialization: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    // Educational qualification
    qualification: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    // Experience in years
    experience: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      default: 0,
    },

    // Staff description
    bio: {
      type: String,
      trim: true,
      maxlength: [2000, "Bio cannot exceed 2000 characters"],
      default: "",
    },

    // Profile image
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },

    // Services provided by staff
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    // Consultation fee
    consultationFee: {
      type: Number,
      min: [0, "Consultation fee cannot be negative"],
      default: 0,
    },

    // Average rating
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    // Total reviews
    totalReviews: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Booking availability
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Active status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ==========================================
// INDEXES
// ==========================================

// Filter active staff by department
staffSchema.index({
  category: 1,
  isActive: 1,
  isAvailable: 1,
});

// Search staff services
staffSchema.index({
  services: 1,
});

// Sort staff by rating
staffSchema.index({
  rating: -1,
});

// ==========================================
// MODEL
// ==========================================
const Staff =
  mongoose.models.Staff || mongoose.model("Staff", staffSchema);

export default Staff;
