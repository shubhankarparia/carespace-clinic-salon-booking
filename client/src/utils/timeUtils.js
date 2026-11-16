
const pad = (value) => String(value).padStart(2, "0");

// Convert HH:mm into minutes.
export const timeToMinutes = (time) => {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;

  const [hours, minutes] = time.split(":").map(Number);

  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
};

// Convert minutes into HH:mm.
export const minutesToTime = (minutes) => {
  if (!Number.isFinite(minutes) || minutes < 0 || minutes >= 1440) {
    return "";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${pad(hours)}:${pad(mins)}`;
};

// Convert 24-hour format into 12-hour format.
export const formatTime = (time) => {
  const minutes = timeToMinutes(time);

  if (minutes === null) return "—";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${pad(mins)} ${period}`;
};

// Calculate end time using service duration.
export const calculateEndTime = (startTime, duration) => {
  const start = timeToMinutes(startTime);

  if (start === null || !Number.isFinite(Number(duration))) {
    return "";
  }

  return minutesToTime(start + Number(duration));
};

// Generate slots within business hours.
export const generateTimeSlots = (
  openingTime,
  closingTime,
  interval = 30,
  duration = interval
) => {
  const opening = timeToMinutes(openingTime);
  const closing = timeToMinutes(closingTime);
  const step = Number(interval);
  const serviceDuration = Number(duration);

  if (
    opening === null ||
    closing === null ||
    closing <= opening ||
    !Number.isInteger(step) ||
    step <= 0 ||
    !Number.isFinite(serviceDuration) ||
    serviceDuration <= 0
  ) {
    return [];
  }

  const slots = [];

  for (
    let current = opening;
    current + serviceDuration <= closing;
    current += step
  ) {
    slots.push({
      value: minutesToTime(current),
      label: formatTime(minutesToTime(current)),
      endTime: minutesToTime(current + serviceDuration)
    });
  }

  return slots;
};

// Check if a time is inside business hours.
export const isWithinBusinessHours = (
  startTime,
  endTime,
  openingTime,
  closingTime
) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const opening = timeToMinutes(openingTime);
  const closing = timeToMinutes(closingTime);

  if ([start, end, opening, closing].some((value) => value === null)) {
    return false;
  }

  return start >= opening && end > start && end <= closing;
};

// Check whether a requested appointment overlaps an existing appointment.
export const hasTimeOverlap = (
  requestedStart,
  requestedEnd,
  existingStart,
  existingEnd
) => {
  const start = timeToMinutes(requestedStart);
  const end = timeToMinutes(requestedEnd);
  const oldStart = timeToMinutes(existingStart);
  const oldEnd = timeToMinutes(existingEnd);

  if ([start, end, oldStart, oldEnd].some((value) => value === null)) {
    return false;
  }

  return start < oldEnd && end > oldStart;
};

// Filter unavailable slots.
export const filterAvailableSlots = (slots, bookings = []) => {
  return slots.filter((slot) => {
    return !bookings.some((booking) => {
      if (["cancelled"].includes(booking.status)) return false;

      return hasTimeOverlap(
        slot.value,
        slot.endTime,
        booking.startTime,
        booking.endTime
      );
    });
  });
};

// Check whether a slot is in the past today.
// Pass today's date in the business timezone.
export const isPastTimeToday = (date, time, today) => {
  if (date !== today) return false;

  const selected = timeToMinutes(time);

  if (selected === null) return true;

  const now = new Date();

  const businessTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(now);

  const current = timeToMinutes(businessTime);

  return current === null || selected <= current;
};
