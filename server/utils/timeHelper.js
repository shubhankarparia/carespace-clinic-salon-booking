
const DEFAULT_TIMEZONE =
  process.env.BUSINESS_TIMEZONE || "Asia/Kolkata";

export const timeToMinutes = (time) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || "")) {
    throw new Error("Invalid time. Expected HH:mm.");
  }

  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

export const minutesToTime = (minutes) => {
  if (
    !Number.isInteger(minutes) ||
    minutes < 0 ||
    minutes >= 1440
  ) {
    throw new Error("Time must be between 00:00 and 23:59.");
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    remainingMinutes
  ).padStart(2, "0")}`;
};

export const addMinutes = (time, duration) => {
  if (!Number.isInteger(duration) || duration < 0) {
    throw new Error("Duration must be a non-negative integer.");
  }

  const result = timeToMinutes(time) + duration;

  if (result >= 1440) {
    throw new Error("Appointment time exceeds the same day.");
  }

  return minutesToTime(result);
};

export const calculateDuration = (
  startTime,
  endTime
) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (end <= start) {
    throw new Error("End time must be after start time.");
  }

  return end - start;
};

export const isTimeOverlap = (
  startA,
  endA,
  startB,
  endB
) => {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  if (aEnd <= aStart || bEnd <= bStart) {
    throw new Error("Invalid time interval.");
  }

  return aStart < bEnd && aEnd > bStart;
};

export const isWithinWorkingHours = (
  appointmentStart,
  appointmentEnd,
  workingStart,
  workingEnd
) => {
  const start = timeToMinutes(appointmentStart);
  const end = timeToMinutes(appointmentEnd);
  const open = timeToMinutes(workingStart);
  const close = timeToMinutes(workingEnd);

  return start >= open && end <= close && end > start;
};

export const getCurrentTime = (
  timezone = DEFAULT_TIMEZONE
) => {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
};

export const formatTime12Hour = (
  time,
  timezone = DEFAULT_TIMEZONE
) => {
  if (time && /^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date(Date.UTC(2000, 0, 1, hours, minutes));

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }

  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid time value.");
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export const getDateTimeInTimezone = (
  date,
  time,
  timezone = DEFAULT_TIMEZONE
) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
    throw new Error("Date must use YYYY-MM-DD format.");
  }

  const minutes = timeToMinutes(time);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const localDate = new Date(
    `${date}T${String(hours).padStart(2, "0")}:${String(
      remainingMinutes
    ).padStart(2, "0")}:00`
  );

  // Convert an appointment's local clock time to a UTC instant.
  // This implementation is intended for Asia/Kolkata (+05:30).
  if (timezone !== "Asia/Kolkata") {
    throw new Error(
      "This conversion currently supports Asia/Kolkata only."
    );
  }

  return new Date(
    `${date}T${String(hours).padStart(2, "0")}:${String(
      remainingMinutes
    ).padStart(2, "0")}:00+05:30`
  );
};

export default {
  timeToMinutes,
  minutesToTime,
  addMinutes,
  calculateDuration,
  isTimeOverlap,
  isWithinWorkingHours,
  getCurrentTime,
  formatTime12Hour,
  getDateTimeInTimezone,
};
