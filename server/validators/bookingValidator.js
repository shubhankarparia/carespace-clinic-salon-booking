
import mongoose from "mongoose";

// ==========================================
// VALIDATE CREATE BOOKING
// ==========================================
export const validateCreateBooking = (req, res, next) => {
  const {
    service,
    staff,
    category,
    appointmentDate,
    startTime,
    endTime,
    customerName,
    customerEmail,
    customerPhone,
  } = req.body;

  const errors = [];

  if (!service || !mongoose.Types.ObjectId.isValid(service)) {
    errors.push("A valid service ID is required.");
  }

  if (!staff || !mongoose.Types.ObjectId.isValid(staff)) {
    errors.push("A valid staff ID is required.");
  }

  if (!["clinic", "salon"].includes(category)) {
    errors.push("Category must be clinic or salon.");
  }

  if (!appointmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(String(appointmentDate))) {
    errors.push("A valid appointment date (YYYY-MM-DD) is required.");
  } else {
    const [year, month, day] = appointmentDate.split("-").map(Number);
    const requestedDay = new Date(Date.UTC(year, month - 1, day));
    const today = new Date();
    const todayDay = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (
      requestedDay.getUTCFullYear() !== year ||
      requestedDay.getUTCMonth() !== month - 1 ||
      requestedDay.getUTCDate() !== day
    ) {
      errors.push("Appointment date is invalid.");
    } else if (requestedDay.getTime() < todayDay) {
      errors.push("Appointment date cannot be in the past.");
    }
  }

  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (!startTime || !timeRegex.test(startTime)) {
    errors.push("Start time must use HH:mm format.");
  }

  if (!endTime || !timeRegex.test(endTime)) {
    errors.push("End time must use HH:mm format.");
  }

  if (
    startTime &&
    endTime &&
    timeRegex.test(startTime) &&
    timeRegex.test(endTime) &&
    endTime <= startTime
  ) {
    errors.push("End time must be later than start time.");
  }

  if (customerName && customerName.trim().length > 100) {
    errors.push("Customer name cannot exceed 100 characters.");
  }

  if (
    customerEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
  ) {
    errors.push("Please enter a valid customer email.");
  }

  if (customerPhone && customerPhone.trim().length > 20) {
    errors.push("Customer phone number is too long.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  next();
};

// ==========================================
// VALIDATE BOOKING ID
// ==========================================
export const validateBookingId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking ID.",
    });
  }

  next();
};

// ==========================================
// VALIDATE UPDATE BOOKING STATUS
// ==========================================
export const validateUpdateBookingStatus = (req, res, next) => {
  const allowedStatuses = [
    "pending",
    "confirmed",
    "cancelled",
    "rejected",
    "completed",
  ];

  const { status } = req.body;

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid booking status.",
      allowedStatuses,
    });
  }

  next();
};
