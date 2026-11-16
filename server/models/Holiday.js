
import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Holiday name is required"],
      trim: true,
      maxlength: 150,
    },

    date: {
      type: Date,
      required: [true, "Holiday date is required"],
    },

    endDate: {
      type: Date,
      default: null,
    },

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "public_holiday",
        "business_closed",
        "staff_leave",
        "special_closure",
      ],
      default: "public_holiday",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    isRecurring: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

holidaySchema.index({ date: 1, isActive: 1 });
holidaySchema.index({ staff: 1, date: 1 });

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;
