
export const APP_NAME = "Clinic & Salon Booking";

export const APP_DESCRIPTION =
  "Book your clinic and salon appointments online.";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const USER_ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer"
};

export const CATEGORIES = {
  CLINIC: "clinic",
  SALON: "salon"
};

export const CATEGORY_OPTIONS = [
  { value: "clinic", label: "Clinic" },
  { value: "salon", label: "Salon" }
];

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed"
};

export const BOOKING_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

export const STATUS_COLORS = {
  pending: "warning",
  confirmed: "primary",
  completed: "success",
  cancelled: "danger"
};

export const WORKING_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export const SLOT_INTERVALS = [15, 20, 30, 45, 60];

export const TIMEZONE = "Asia/Kolkata";

export const CURRENCY = "INR";

export const CURRENCY_SYMBOL = "₹";

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

export const BOOKING_ROUTES = {
  BOOKING: "/booking",
  MY_BOOKINGS: "/my-bookings",
  CONFIRMATION: "/booking-confirmation"
};

export const ADMIN_ROUTES = {
  DASHBOARD: "/admin/dashboard",
  BOOKINGS: "/admin/bookings",
  SERVICES: "/admin/services",
  STAFF: "/admin/staff",
  CUSTOMERS: "/admin/customers",
  HOLIDAYS: "/admin/holidays",
  SCHEDULE: "/admin/schedule",
  REPORTS: "/admin/reports",
  SETTINGS: "/admin/settings"
};

export const VALIDATION = {
  PHONE_LENGTH: 10,
  NAME_MIN_LENGTH: 2,
  PASSWORD_MIN_LENGTH: 8,
  MAX_FILE_SIZE: 5 * 1024 * 1024
};

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf"
];

export const DEFAULT_PROFILE_IMAGE =
  "/images/default-profile.png";
