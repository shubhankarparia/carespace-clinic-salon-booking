
import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Staff from "../models/Staff.js";
import BusinessSettings from "../models/BusinessSettings.js";
import { getAvailableSlots } from "./availabilityService.js";
import {
  notifyBookingCreated,
  notifyBookingStatusChanged,
  notifyBookingCancelled,
} from "./notificationService.js";

const allowedStatuses = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
  "no_show",
];

const notifySafely = async (callback) => {
  try {
    await callback();
  } catch (error) {
    // A notification failure must not undo a successfully saved booking.
    console.error("Booking notification error:", error.message);
  }
};

export const createBooking = async ({
  customerId,
  serviceId,
  staffId,
  appointmentDate,
  startTime,
  notes = "",
  paymentMethod = "cash",
}) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new Error("Invalid customer ID.");
  }

  const [service, staff, settings] = await Promise.all([
    Service.findOne({ _id: serviceId, isActive: true }),
    Staff.findOne({
      _id: staffId,
      isActive: true,
      isAvailable: true,
    }),
    BusinessSettings.findOne(),
  ]);

  if (!service) throw new Error("Service is unavailable.");
  if (!staff) throw new Error("Staff member is unavailable.");

  const slotResult = await getAvailableSlots({
    serviceId,
    staffId,
    date: appointmentDate,
  });

  const selectedSlot = slotResult.slots.find(
    (slot) => slot.startTime === startTime
  );

  if (!selectedSlot) {
    throw new Error("This appointment slot is no longer available.");
  }

  // Recheck overlapping bookings immediately before creation.
  // For high-concurrency production systems, also use a database
  // transaction or a dedicated atomic slot-locking strategy.
  const overlappingBooking = await Booking.findOne({
    staff: staffId,
    appointmentDate: {
      $gte: new Date(`${appointmentDate}T00:00:00.000Z`),
      $lt: new Date(`${appointmentDate}T00:00:00.000Z`).getTime() + 86400000,
    },
    status: { $nin: ["cancelled", "rejected"] },
    startTime: { $lt: selectedSlot.endTime },
    endTime: { $gt: selectedSlot.startTime },
  });

  if (overlappingBooking) {
    throw new Error("This appointment slot has just been booked.");
  }

  const duration =
    Number(service.duration || 0) +
    Number(service.preparationTime || 0) +
    Number(service.cleanupTime || 0);

  const price = Number(service.price || 0);
  const discount = 0;
  const totalAmount = Math.max(0, price - discount);

  const confirmationRequired =
    settings?.bookingSettings?.requireConfirmation !== false;

  const booking = await Booking.create({
    customer: customerId,
    service: serviceId,
    staff: staffId,
    category: service.category,
    appointmentDate: new Date(
      `${appointmentDate}T00:00:00.000Z`
    ),
    startTime: selectedSlot.startTime,
    endTime: selectedSlot.endTime,
    duration,
    notes,
    price,
    discount,
    totalAmount,
    paymentMethod,
    paymentStatus: "pending",
    status: confirmationRequired ? "pending" : "confirmed",
    timezone: settings?.timezone || "Asia/Kolkata",
  });

  const populatedBooking = await Booking.findById(booking._id)
    .populate("customer", "firstName lastName email phone")
    .populate("service", "name category price duration")
    .populate("staff", "name role");

  await notifySafely(() =>
    notifyBookingCreated(populatedBooking)
  );

  return populatedBooking;
};

export const cancelBooking = async ({
  bookingId,
  userId,
  isAdmin = false,
  reason = "",
}) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (
    !isAdmin &&
    booking.customer.toString() !== userId.toString()
  ) {
    throw new Error("You are not allowed to cancel this booking.");
  }

  if (["cancelled", "rejected", "completed"].includes(booking.status)) {
    throw new Error(`A ${booking.status} booking cannot be cancelled.`);
  }

  const settings = await BusinessSettings.findOne();
  const noticeHours =
    Number(settings?.bookingSettings?.cancellationNoticeHours) || 0;

  const appointmentDate = new Date(
    `${booking.appointmentDate.toISOString().slice(0, 10)}T${booking.startTime}:00+05:30`
  );

  const hoursUntilAppointment =
    (appointmentDate.getTime() - Date.now()) / (60 * 60 * 1000);

  if (!isAdmin && hoursUntilAppointment < noticeHours) {
    throw new Error(
      `Bookings must be cancelled at least ${noticeHours} hours before the appointment.`
    );
  }

  booking.status = "cancelled";
  booking.cancellationReason = reason;
  booking.cancelledAt = new Date();
  booking.cancelledBy = userId;

  await booking.save();

  const populatedBooking = await Booking.findById(booking._id)
    .populate("customer", "firstName lastName email phone")
    .populate("service", "name")
    .populate("staff", "name");

  await notifySafely(() =>
    notifyBookingCancelled(populatedBooking)
  );

  return populatedBooking;
};

export const updateBookingStatus = async ({
  bookingId,
  status,
  paymentStatus,
  adminId,
}) => {
  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid booking status.");
  }

  const allowedPaymentStatuses = [
    "pending",
    "paid",
    "failed",
    "refunded",
  ];

  if (
    paymentStatus &&
    !allowedPaymentStatuses.includes(paymentStatus)
  ) {
    throw new Error("Invalid payment status.");
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  const previousStatus = booking.status;

  booking.status = status;

  if (paymentStatus) {
    booking.paymentStatus = paymentStatus;
  }

  booking.updatedBy = adminId;

  if (status === "cancelled") {
    booking.cancelledAt = new Date();
    booking.cancelledBy = adminId;
  }

  await booking.save();

  const populatedBooking = await Booking.findById(booking._id)
    .populate("customer", "firstName lastName email phone")
    .populate("service", "name")
    .populate("staff", "name");

  if (previousStatus !== status) {
    await notifySafely(() =>
      notifyBookingStatusChanged(populatedBooking, previousStatus)
    );
  }

  return populatedBooking;
};

export const getBookingDetails = async ({
  bookingId,
  userId,
  isAdmin = false,
}) => {
  const booking = await Booking.findById(bookingId)
    .populate("customer", "firstName lastName email phone")
    .populate("service", "name category price duration")
    .populate("staff", "name role");

  if (!booking) {
    throw new Error("Booking not found.");
  }

  const customerId =
    booking.customer?._id?.toString() ||
    booking.customer?.toString();

  if (!isAdmin && customerId !== userId.toString()) {
    throw new Error("You are not allowed to view this booking.");
  }

  return booking;
};
