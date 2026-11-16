
import { TIMEZONE, WORKING_DAYS } from "./constants";

// Convert a date to YYYY-MM-DD using the local calendar.
export const formatDateForInput = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Get today's date.
export const getToday = () => {
  return formatDateForInput(new Date());
};

// Get date after a specified number of days.
export const addDays = (date, days) => {
  const result = new Date(`${date}T12:00:00`);
  result.setDate(result.getDate() + days);

  return formatDateForInput(result);
};

// Get date after a specified number of months.
export const addMonths = (date, months) => {
  const result = new Date(`${date}T12:00:00`);
  result.setMonth(result.getMonth() + months);

  return formatDateForInput(result);
};

// Format a date for display.
export const formatDate = (date, options = {}) => {
  if (!date) return "—";

  const parsed = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? `${date}T12:00:00`
      : date
  );

  if (Number.isNaN(parsed.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options
  }).format(parsed);
};

// Get weekday name from YYYY-MM-DD.
export const getDayName = (date) => {
  if (!date) return "";

  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-US", {
    weekday: "long"
  });
};

// Check whether date is in the past.
export const isPastDate = (date) => {
  return Boolean(date && date < getToday());
};

// Check whether date is today.
export const isToday = (date) => {
  return date === getToday();
};

// Check whether date is a working day.
export const isWorkingDay = (
  date,
  workingDays = WORKING_DAYS
) => {
  const day = getDayName(date);

  return workingDays.includes(day);
};

// Check if a date is a weekend.
export const isWeekend = (date) => {
  const day = getDayName(date);

  return day === "Saturday" || day === "Sunday";
};

// Check if date is a holiday.
export const isHoliday = (date, holidays = []) => {
  return holidays.some((holiday) => {
    const holidayDate =
      typeof holiday === "string" ? holiday : holiday.date;

    return holidayDate?.slice(0, 10) === date;
  });
};

// Check whether customer can select a date.
export const isBookableDate = (
  date,
  workingDays = WORKING_DAYS,
  holidays = []
) => {
  if (!date || isPastDate(date)) return false;

  if (!isWorkingDay(date, workingDays)) return false;

  if (isHoliday(date, holidays)) return false;

  return true;
};

// Get minimum booking date.
export const getMinBookingDate = () => getToday();

// Get maximum booking date.
export const getMaxBookingDate = (daysAhead = 90) => {
  return addDays(getToday(), daysAhead);
};

// Get month name.
export const getMonthName = (date = new Date()) => {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric"
  }).format(date);
};

// Get today's date in the business timezone.
export const getBusinessToday = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
};
