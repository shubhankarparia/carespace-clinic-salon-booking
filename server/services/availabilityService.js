
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Staff from "../models/Staff.js";
import WorkingHours from "../models/WorkingHours.js";
import Holiday from "../models/Holiday.js";
import BusinessSettings from "../models/BusinessSettings.js";

const TIMEZONE_OFFSET = "+05:30";

const parseDate = (value) => {
  const dateString = String(value || "").slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error("Date must use YYYY-MM-DD format.");
  }

  const date = new Date(`${dateString}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateString
  ) {
    throw new Error("Invalid appointment date.");
  }

  return {
    dateString,
    start: date,
    end: new Date(date.getTime() + 86400000),
  };
};

const toMinutes = (time) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || "")) {
    throw new Error(`Invalid time: ${time}`);
  }

  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

const formatTime = (minutes) => {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60
  ).padStart(2, "0")}`;
};

const getIndiaDateTime = (dateString, time) => {
  return new Date(`${dateString}T${time}:00${TIMEZONE_OFFSET}`);
};

const getIndiaDateString = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

export const getAvailableSlots = async ({
  serviceId,
  staffId,
  date,
}) => {
  const range = parseDate(date);

  const [service, staff, settings] = await Promise.all([
    Service.findOne({ _id: serviceId, isActive: true }),
    Staff.findOne({
      _id: staffId,
      isActive: true,
      isAvailable: true,
    }),
    BusinessSettings.findOne(),
  ]);

  if (!service) {
    throw new Error("Service not found or inactive.");
  }

  if (!staff) {
    throw new Error("Staff member not found or unavailable.");
  }

  if (service.category !== staff.category) {
    throw new Error("Service and staff categories do not match.");
  }

  const staffServices = (staff.services || []).map((id) => id.toString());
  const serviceStaff = (service.assignedStaff || []).map((id) =>
    id.toString()
  );

  const isAssigned =
    staffServices.includes(serviceId.toString()) ||
    serviceStaff.includes(staffId.toString());

  if (!isAssigned) {
    throw new Error("This staff member does not provide this service.");
  }

  const dayOfWeek = range.start.getUTCDay();

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

  if (!schedule || !schedule.isOpen || !schedule.timeSlots?.length) {
    return {
      date: range.dateString,
      slots: [],
      message: "No working hours configured for this day.",
    };
  }

  const holidays = await Holiday.find({
    isActive: true,
    date: { $lt: range.end },
    $and: [
      {
        $or: [{ staff: null }, { staff: staffId }],
      },
      {
        $or: [
          { endDate: null },
          { endDate: { $gte: range.start } },
        ],
      },
    ],
  }).select("_id");

  if (holidays.length) {
    return {
      date: range.dateString,
      slots: [],
      message: "Business or staff holiday.",
    };
  }

  const bookings = await Booking.find({
    staff: staffId,
    appointmentDate: {
      $gte: range.start,
      $lt: range.end,
    },
    status: {
      $nin: ["cancelled", "rejected"],
    },
  }).select("startTime endTime");

  const bookingSettings = settings?.bookingSettings || {};

  const interval = Math.max(
    5,
    Number(bookingSettings.slotIntervalMinutes) || 15
  );

  const duration =
    Number(service.duration || 0) +
    Number(service.preparationTime || 0) +
    Number(service.cleanupTime || 0);

  if (duration <= 0) {
    throw new Error("Service duration is not configured.");
  }

  const minimumNotice =
    Number(bookingSettings.minimumBookingNoticeHours) || 0;

  const advanceDays =
    Number(bookingSettings.advanceBookingDays) || 30;

  const today = getIndiaDateString();

  if (range.dateString < today) {
    return {
      date: range.dateString,
      slots: [],
      message: "Past dates are unavailable.",
    };
  }

  const todayStart = getIndiaDateTime(today, "00:00");

  const lastBookingDate = new Date(todayStart);
  lastBookingDate.setUTCDate(
    lastBookingDate.getUTCDate() + advanceDays
  );

  if (range.start > lastBookingDate) {
    return {
      date: range.dateString,
      slots: [],
      message: "Date exceeds the advance booking limit.",
    };
  }

  const earliestBooking = new Date(
    Date.now() + minimumNotice * 60 * 60 * 1000
  );

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
      const startTime = formatTime(start);
      const endTime = formatTime(end);

      const hasBreak =
        schedule.breakStart &&
        schedule.breakEnd &&
        start < toMinutes(schedule.breakEnd) &&
        end > toMinutes(schedule.breakStart);

      if (hasBreak) continue;

      const hasConflict = bookings.some((booking) => {
        return (
          start < toMinutes(booking.endTime) &&
          end > toMinutes(booking.startTime)
        );
      });

      if (hasConflict) continue;

      const slotDateTime = getIndiaDateTime(
        range.dateString,
        startTime
      );

      if (slotDateTime < earliestBooking) continue;

      slots.push({
        startTime,
        endTime,
        available: true,
      });
    }
  }

  return {
    date: range.dateString,
    service: {
      id: service._id,
      name: service.name,
      duration,
      price: service.price,
    },
    staff: {
      id: staff._id,
      name: staff.name,
    },
    slots,
  };
};

export const isSlotAvailable = async ({
  serviceId,
  staffId,
  date,
  startTime,
}) => {
  const result = await getAvailableSlots({
    serviceId,
    staffId,
    date,
  });

  return result.slots.some(
    (slot) => slot.startTime === startTime
  );
};
