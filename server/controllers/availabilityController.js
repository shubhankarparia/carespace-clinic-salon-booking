
import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Staff from "../models/Staff.js";
import WorkingHours from "../models/WorkingHours.js";
import Holiday from "../models/Holiday.js";
import BusinessSettings from "../models/BusinessSettings.js";

const dateRange = (value) => {
  const key = String(value || "").slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;

  const start = new Date(`${key}T00:00:00.000Z`);

  if (
    Number.isNaN(start.getTime()) ||
    start.toISOString().slice(0, 10) !== key
  ) return null;

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { key, start, end };
};

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toTime = (minutes) => {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
};

export const getAvailableSlots = async (req, res) => {
  const { serviceId, staffId, date } = req.query;

  if (!mongoose.Types.ObjectId.isValid(serviceId || "")) {
    return res.status(400).json({
      success: false,
      message: "A valid serviceId is required.",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(staffId || "")) {
    return res.status(400).json({
      success: false,
      message: "A valid staffId is required.",
    });
  }

  const range = dateRange(date);

  if (!range) {
    return res.status(400).json({
      success: false,
      message: "Provide a valid date in YYYY-MM-DD format.",
    });
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

  if (!service || !staff) {
    return res.status(404).json({
      success: false,
      message: "Service or staff member not found.",
    });
  }

  if (service.category !== staff.category) {
    return res.status(400).json({
      success: false,
      message: "Service and staff categories do not match.",
    });
  }

  const assigned =
    staff.services.some((id) => id.toString() === serviceId) ||
    service.assignedStaff.some((id) => id.toString() === staffId);

  if (!assigned) {
    return res.status(400).json({
      success: false,
      message: "This staff member does not provide the selected service.",
    });
  }

  const dayOfWeek = new Date(range.start).getUTCDay();

  // Prefer staff-specific working hours; otherwise use business hours.
  let schedule = await WorkingHours.findOne({
    staff: staffId,
    dayOfWeek,
  });

  if (!schedule) {
    schedule = await WorkingHours.findOne({
      staff: null,
      dayOfWeek,
    });
  }

  if (!schedule || !schedule.isOpen || !schedule.timeSlots.length) {
    return res.status(200).json({
      success: true,
      date: range.key,
      slots: [],
      message: "No working hours configured for this day.",
    });
  }

  // Check business-wide and staff-specific holidays.
  const holidays = await Holiday.find({
    isActive: true,
    $or: [
      { staff: null },
      { staff: staffId },
    ],
    date: { $lt: range.end },
    $or: [
      { endDate: null },
      { endDate: { $gte: range.start } },
    ],
  });

  if (holidays.length) {
    return res.status(200).json({
      success: true,
      date: range.key,
      slots: [],
      message: "The business or selected staff member is unavailable on this date.",
    });
  }

  const bookings = await Booking.find({
    staff: staffId,
    appointmentDate: {
      $gte: range.start,
      $lt: range.end,
    },
    status: { $nin: ["cancelled", "rejected"] },
  }).select("startTime endTime");

  const interval = settings?.bookingSettings?.slotIntervalMinutes || 15;
  const duration =
    service.duration +
    (service.preparationTime || 0) +
    (service.cleanupTime || 0);

  const minimumNotice =
    settings?.bookingSettings?.minimumBookingNoticeHours || 0;

  const advanceDays =
    settings?.bookingSettings?.advanceBookingDays || 30;

  const now = new Date();
  const selectedDate = range.start;

  const earliestBooking = new Date(
    now.getTime() + minimumNotice * 60 * 60 * 1000
  );

  const lastBookingDate = new Date(now);
  lastBookingDate.setUTCDate(lastBookingDate.getUTCDate() + advanceDays);

  if (selectedDate < new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ))) {
    return res.status(200).json({
      success: true,
      date: range.key,
      slots: [],
      message: "Past dates are unavailable.",
    });
  }

  if (selectedDate > lastBookingDate) {
    return res.status(200).json({
      success: true,
      date: range.key,
      slots: [],
      message: "The selected date is outside the advance booking period.",
    });
  }

  const slots = [];

  for (const period of schedule.timeSlots) {
    const periodStart = toMinutes(period.startTime);
    const periodEnd = toMinutes(period.endTime);

    for (
      let start = periodStart;
      start + duration <= periodEnd;
      start += interval
    ) {
      const end = start + duration;
      const startTime = toTime(start);
      const endTime = toTime(end);

      const overlapsBreak =
        schedule.breakStart &&
        schedule.breakEnd &&
        start < toMinutes(schedule.breakEnd) &&
        end > toMinutes(schedule.breakStart);

      if (overlapsBreak) continue;

      const overlapsBooking = bookings.some((booking) => {
        return (
          startTime < booking.endTime &&
          endTime > booking.startTime
        );
      });

      if (overlapsBooking) continue;

      const slotDateTime = new Date(
        `${range.key}T${startTime}:00+05:30`
      );

      if (slotDateTime < earliestBooking) continue;

      slots.push({
        startTime,
        endTime,
        available: true,
      });
    }
  }

  return res.status(200).json({
    success: true,
    date: range.key,
    service: {
      id: service._id,
      name: service.name,
      duration: service.duration,
    },
    staff: {
      id: staff._id,
      name: staff.name,
    },
    slots,
  });
};
