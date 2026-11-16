
const DEFAULT_TIMEZONE =
  process.env.BUSINESS_TIMEZONE || "Asia/Kolkata";

const isValidDateString = (value) => {
  if (typeof value !== "string") return false;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

export const parseDateOnly = (value) => {
  if (!isValidDateString(value)) {
    throw new Error("Invalid date. Expected YYYY-MM-DD.");
  }

  return new Date(`${value}T00:00:00.000Z`);
};

export const formatDate = (
  date,
  options = {},
  timezone = DEFAULT_TIMEZONE
) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date value.");
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: timezone,
    ...options,
  }).format(parsedDate);
};

export const formatDateShort = (
  date,
  timezone = DEFAULT_TIMEZONE
) => {
  return formatDate(
    date,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
    timezone
  );
};

export const getDateString = (
  date = new Date(),
  timezone = DEFAULT_TIMEZONE
) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date value.");
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsedDate);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
};

export const getTodayDate = (
  timezone = DEFAULT_TIMEZONE
) => {
  return getDateString(new Date(), timezone);
};

export const getDateRange = (from, to) => {
  const start = parseDateOnly(from);
  const end = parseDateOnly(to);

  if (start > end) {
    throw new Error("Start date cannot be after end date.");
  }

  end.setUTCDate(end.getUTCDate() + 1);

  return {
    start,
    end,
  };
};

export const addDays = (date, days) => {
  const result = parseDateOnly(date);

  if (!Number.isInteger(days)) {
    throw new Error("Days must be an integer.");
  }

  result.setUTCDate(result.getUTCDate() + days);

  return result.toISOString().slice(0, 10);
};

export const isPastDate = (
  date,
  timezone = DEFAULT_TIMEZONE
) => {
  return date < getTodayDate(timezone);
};

export const isFutureDate = (
  date,
  timezone = DEFAULT_TIMEZONE
) => {
  return date > getTodayDate(timezone);
};

export const getDayOfWeek = (date) => {
  return parseDateOnly(date).getUTCDay();
};

export const getMonthRange = (
  year,
  month
) => {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new Error("Invalid year or month.");
  }

  const start = new Date(
    Date.UTC(year, month - 1, 1)
  );

  const end = new Date(
    Date.UTC(year, month, 1)
  );

  return { start, end };
};

export const getCurrentYearMonth = (
  timezone = DEFAULT_TIMEZONE
) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
  };
};

export default {
  parseDateOnly,
  formatDate,
  formatDateShort,
  getDateString,
  getTodayDate,
  getDateRange,
  addDays,
  isPastDate,
  isFutureDate,
  getDayOfWeek,
  getMonthRange,
  getCurrentYearMonth,
};
