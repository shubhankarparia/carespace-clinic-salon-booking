
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      maxlength: 120,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },

    category: {
      type: String,
      enum: ["clinic", "salon"],
      required: [true, "Service category is required"],
    },

    subcategory: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
      maxlength: 3000,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },

    icon: {
      type: String,
      default: "bi-stars",
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Service price is required"],
      min: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    duration: {
      type: Number,
      required: [true, "Service duration is required"],
      min: 5,
    },

    preparationTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    cleanupTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    features: {
      type: [String],
      default: [],
    },

    requirements: {
      type: [String],
      default: [],
    },

    assignedStaff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ isFeatured: 1, isActive: 1 });

const Service = mongoose.model("Service", serviceSchema);

export default Service;
