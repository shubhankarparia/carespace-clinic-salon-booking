
import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format"],
    },

    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format"],
    },
  },
  { _id: false }
);

const workingHoursSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },

    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },

    isOpen: {
      type: Boolean,
      default: true,
    },

    timeSlots: {
      type: [timeSlotSchema],
      default: [],
    },

    breakStart: {
      type: String,
      default: "",
    },

    breakEnd: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

workingHoursSchema.index({ staff: 1, dayOfWeek: 1 });

const WorkingHours = mongoose.model(
  "WorkingHours",
  workingHoursSchema
);

export default WorkingHours;
