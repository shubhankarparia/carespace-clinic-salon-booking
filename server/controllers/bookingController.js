
import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Staff from "../models/Staff.js";
import { sendEmail } from "../config/mail.js";

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

const getDateRange = (value) => {
  const dateKey = String(value).slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return null;
  }

  const start = new Date(`${dateKey}T00:00:00.000Z`);

  if (
    Number.isNaN(start.getTime()) ||
    start.toISOString().slice(0, 10) !== dateKey
  ) {
    return null;
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
};

const addMinutes = (time, minutes) => {
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + minutes;

  if (total >= 24 * 60) return null;

  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const sendBookingEmail = async (booking, subject, message) => {
  if (!booking.customerEmail) return;

  try {
    await sendEmail({
      to: booking.customerEmail,
      subject,
      text: message,
      html: `<h2>${subject}</h2><p>${message}</p><p>Booking reference: ${booking.bookingNumber || booking._id}</p>`,
    });
  } catch (error) {
    // An email failure should not undo a saved booking.
    console.error("Booking email could not be sent:", error.message);
  }
};

// Customer: create appointment
export const createBooking = async (req, res) => {
  const {
    service: serviceId,
    staff: staffId,
    category,
    appointmentDate,
    startTime,
    endTime,
    customerName,
    customerEmail,
    customerPhone,
    notes,
  } = req.body;

  if (!validId(serviceId) || !validId(staffId)) {
    return res.status(400).json({
      success: false,
      message: "Valid service and staff IDs are required.",
    });
  }

  const dateRange = getDateRange(appointmentDate);

  if (!dateRange) {
    return res.status(400).json({
      success: false,
      message: "Invalid appointment date.",
    });
  }

  const [service, staff] = await Promise.all([
    Service.findOne({ _id: serviceId, isActive: true }),
    Staff.findOne({
      _id: staffId,
      isActive: true,
      isAvailable: true,
    }),
  ]);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found or inactive.",
    });
  }

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found or unavailable.",
    });
  }

  if (
    service.category !== category ||
    staff.category !== category
  ) {
    return res.status(400).json({
      success: false,
      message: "Service, staff and booking categories must match.",
    });
  }

  const staffOffersService =
    staff.services.some((id) => id.toString() === service._id.toString()) ||
    service.assignedStaff.some((id) => id.toString() === staff._id.toString());

  if (!staffOffersService) {
    return res.status(400).json({
      success: false,
      message: "This staff member is not assigned to the selected service.",
    });
  }

  const expectedEndTime = addMinutes(startTime, service.duration);

  if (!expectedEndTime || endTime !== expectedEndTime) {
    return res.status(400).json({
      success: false,
      message: "Appointment end time does not match the service duration.",
    });
  }

  const today = new Date();
  if (dateRange.start < new Date(Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ))) {
    return res.status(400).json({
      success: false,
      message: "Appointment date cannot be in the past.",
    });
  }

  // Prevent overlap with existing active appointments.
  const existingBookings = await Booking.find({
    staff: staffId,
    appointmentDate: {
      $gte: dateRange.start,
      $lt: dateRange.end,
    },
    status: { $nin: ["cancelled", "rejected"] },
  }).select("startTime endTime");

  const hasConflict = existingBookings.some((booking) => {
    return startTime < booking.endTime && endTime > booking.startTime;
  });

  if (hasConflict) {
    return res.status(409).json({
      success: false,
      message: "This appointment time is no longer available.",
    });
  }

  const finalPrice =
    service.discountPrice !== null &&
    service.discountPrice !== undefined
      ? service.discountPrice
      : service.price;

  const booking = await Booking.create({
    customer: req.user._id,
    service: service._id,
    staff: staff._id,
    category,
    appointmentDate: dateRange.start,
    startTime,
    endTime,
    duration: service.duration,
    customerName:
      customerName?.trim() ||
      `${req.user.firstName} ${req.user.lastName}`.trim(),
    customerEmail:
      customerEmail?.trim().toLowerCase() || req.user.email,
    customerPhone: customerPhone?.trim() || req.user.phone,
    notes: notes || "",
    price: finalPrice,
    discount: service.price - finalPrice,
    totalAmount: finalPrice,
    timezone: process.env.TIMEZONE || "Asia/Kolkata",
  });

  booking.bookingNumber =
    `CS-${booking.createdAt.getTime().toString().slice(-8)}-${booking._id.toString().slice(-4).toUpperCase()}`;

  await booking.save();

  await booking.populate([
    { path: "service", select: "name price duration category" },
    { path: "staff", select: "name role profileImage" },
  ]);

  await sendBookingEmail(
    booking,
    "CareSpace Appointment Received",
    `Your appointment request has been received for ${service.name} on ${dateRange.start.toISOString().slice(0, 10)} at ${startTime}.`
  );

  return res.status(201).json({
    success: true,
    message: "Appointment booked successfully.",
    booking,
  });
};

// Customer: get own bookings
export const getMyBookings = async (req, res) => {
  const filter = { customer: req.user._id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const bookings = await Booking.find(filter)
    .populate("service", "name category image price")
    .populate("staff", "name role profileImage")
    .sort({ appointmentDate: -1, startTime: -1 });

  return res.status(200).json({
    success: true,
    count: bookings.length,
    bookings,
  });
};

// Customer or admin: get booking details
export const getBookingById = async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking ID.",
    });
  }

  const booking = await Booking.findById(req.params.id)
    .populate("customer", "firstName lastName email phone")
    .populate("service", "name category price duration")
    .populate("staff", "name role profileImage");

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found.",
    });
  }

  const isOwner = booking.customer._id.equals(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to view this booking.",
    });
  }

  return res.status(200).json({
    success: true,
    booking,
  });
};

// Customer: cancel own booking
export const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found.",
    });
  }

  if (
    !booking.customer.equals(req.user._id) &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "You cannot cancel this booking.",
    });
  }

  if (["completed", "cancelled", "rejected"].includes(booking.status)) {
    return res.status(400).json({
      success: false,
      message: "This booking cannot be cancelled.",
    });
  }

  booking.status = "cancelled";
  booking.cancellationReason =
    req.body.cancellationReason || "Cancelled by customer";
  booking.cancelledBy = req.user._id;
  booking.cancelledAt = new Date();

  await booking.save();

  await sendBookingEmail(
    booking,
    "CareSpace Appointment Cancelled",
    `Your appointment ${booking.bookingNumber || booking._id} has been cancelled.`
  );

  return res.status(200).json({
    success: true,
    message: "Booking cancelled successfully.",
    booking,
  });
};

// Admin: list all bookings
export const getAllBookings = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;

  if (req.query.staff && validId(req.query.staff)) {
    filter.staff = req.query.staff;
  }

  if (req.query.date) {
    const range = getDateRange(req.query.date);

    if (!range) {
      return res.status(400).json({
        success: false,
        message: "Invalid date filter.",
      });
    }

    filter.appointmentDate = {
      $gte: range.start,
      $lt: range.end,
    };
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("customer", "firstName lastName email phone")
      .populate("service", "name category")
      .populate("staff", "name role")
      .sort({ appointmentDate: -1, startTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit),

    Booking.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    bookings,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

// Admin: update booking status
export const updateBookingStatus = async (req, res) => {
  const { status, cancellationReason } = req.body;

  const allowedStatuses = [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "rejected",
    "no_show",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking status.",
    });
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found.",
    });
  }

  booking.status = status;

  if (status === "confirmed") booking.confirmedAt = new Date();

  if (status === "completed") booking.completedAt = new Date();

  if (status === "cancelled" || status === "rejected") {
    booking.cancelledBy = req.user._id;
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason || "Updated by administrator";
  }

  await booking.save();

  return res.status(200).json({
    success: true,
    message: "Booking status updated successfully.",
    booking,
  });
};
