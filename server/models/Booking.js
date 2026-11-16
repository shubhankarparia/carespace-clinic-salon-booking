
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service is required"],
    },

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: [true, "Staff member is required"],
    },

    category: {
      type: String,
      enum: ["clinic", "salon"],
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },

    startTime: {
      type: String,
      required: [true, "Appointment start time is required"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format"],
    },

    endTime: {
      type: String,
      required: [true, "Appointment end time is required"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format"],
    },

    duration: {
      type: Number,
      required: true,
      min: 5,
    },

    customerName: {
      type: String,
      trim: true,
      default: "",
    },

    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    customerPhone: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    internalNotes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "online", "other"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    transactionId: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "rejected",
        "no_show",
      ],
      default: "pending",
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bookingSchema.index({ customer: 1, appointmentDate: -1 });
bookingSchema.index({ staff: 1, appointmentDate: 1, startTime: 1 });
bookingSchema.index({ status: 1, appointmentDate: 1 });
bookingSchema.index({ service: 1, appointmentDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
