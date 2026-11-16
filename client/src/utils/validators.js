
import {
  VALIDATION,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES
} from "./constants";

export const validateName = (name) => {
  if (!name || !name.trim()) {
    return "Name is required.";
  }

  if (name.trim().length < VALIDATION.NAME_MIN_LENGTH) {
    return `Name must contain at least ${VALIDATION.NAME_MIN_LENGTH} characters.`;
  }

  return "";
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return "Email address is required.";
  }

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!pattern.test(email.trim())) {
    return "Please enter a valid email address.";
  }

  return "";
};

export const validatePhone = (phone) => {
  if (!phone) return "Phone number is required.";

  const cleaned = String(phone).replace(/[\s-]/g, "");

  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return "Enter a valid 10-digit Indian mobile number.";
  }

  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required.";

  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return `Password must contain at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters.`;
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }

  if (!/\d/.test(password)) {
    return "Password must contain at least one number.";
  }

  return "";
};

export const validateConfirmPassword = (
  password,
  confirmPassword
) => {
  if (!confirmPassword) return "Please confirm your password.";

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
};

export const validateRequired = (value, label = "This field") => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return `${label} is required.`;
  }

  return "";
};

export const validateBooking = (booking) => {
  const errors = {};

  if (!booking.serviceId) {
    errors.serviceId = "Please select a service.";
  }

  if (!booking.staffId) {
    errors.staffId = "Please select a doctor or stylist.";
  }

  if (!booking.appointmentDate) {
    errors.appointmentDate = "Please select an appointment date.";
  }

  if (!booking.startTime) {
    errors.startTime = "Please select an appointment time.";
  }

  const nameError = validateName(booking.customerName);
  const emailError = validateEmail(booking.email);
  const phoneError = validatePhone(booking.phone);

  if (nameError) errors.customerName = nameError;
  if (emailError) errors.email = emailError;
  if (phoneError) errors.phone = phoneError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFile = (
  file,
  allowedTypes = ALLOWED_IMAGE_TYPES,
  maxSize = VALIDATION.MAX_FILE_SIZE
) => {
  if (!file) return "";

  if (!allowedTypes.includes(file.type)) {
    return "This file format is not supported.";
  }

  if (file.size > maxSize) {
    return `File size must not exceed ${Math.round(maxSize / (1024 * 1024))} MB.`;
  }

  return "";
};

export const validateImage = (file) => {
  return validateFile(file, ALLOWED_IMAGE_TYPES);
};

export const validateDocument = (file) => {
  return validateFile(file, [
    ...ALLOWED_DOCUMENT_TYPES,
    ...ALLOWED_IMAGE_TYPES
  ]);
};

export const validatePrice = (price) => {
  if (price === "" || price === null || price === undefined) {
    return "Price is required.";
  }

  if (!Number.isFinite(Number(price)) || Number(price) < 0) {
    return "Enter a valid non-negative price.";
  }

  return "";
};

export const validateDuration = (duration) => {
  const value = Number(duration);

  if (!Number.isInteger(value) || value <= 0 || value > 1440) {
    return "Duration must be between 1 and 1440 minutes.";
  }

  return "";
};
