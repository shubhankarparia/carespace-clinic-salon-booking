
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone) => {
  return /^[+]?[0-9\s()-]{7,20}$/.test(phone);
};

// Validate registration
const validateRegister = (req) => {
  const errors = [];

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
  } = req.body || {};

  // First name
  if (
    !firstName ||
    typeof firstName !== "string" ||
    !firstName.trim()
  ) {
    errors.push("First name is required.");
  } else if (firstName.trim().length < 2) {
    errors.push("First name must contain at least 2 characters.");
  } else if (firstName.trim().length > 50) {
    errors.push("First name cannot exceed 50 characters.");
  }

  // Last name (optional)
  if (
    lastName !== undefined &&
    lastName !== null &&
    (
      typeof lastName !== "string" ||
      lastName.trim().length > 50
    )
  ) {
    errors.push("Last name must be a valid string and cannot exceed 50 characters.");
  }

  // Email
  if (
    !email ||
    typeof email !== "string" ||
    !isValidEmail(email.trim())
  ) {
    errors.push("A valid email address is required.");
  } else if (email.trim().length > 100) {
    errors.push("Email cannot exceed 100 characters.");
  }

  // Phone
  if (
    !phone ||
    typeof phone !== "string" ||
    !isValidPhone(phone.trim())
  ) {
    errors.push("A valid phone number is required.");
  }

  // Password
  if (!password || typeof password !== "string") {
    errors.push("Password is required.");
  } else {
    if (password.length < 8) {
      errors.push("Password must contain at least 8 characters.");
    }

    if (password.length > 128) {
      errors.push("Password cannot exceed 128 characters.");
    }
  }

  // Confirm password
  if (
    confirmPassword !== undefined &&
    password !== confirmPassword
  ) {
    errors.push("Password and confirm password do not match.");
  }

  return errors;
};

// Validate login
const validateLogin = (req) => {
  const errors = [];

  const { email, password } = req.body || {};

  if (
    !email ||
    typeof email !== "string" ||
    !isValidEmail(email.trim())
  ) {
    errors.push("A valid email address is required.");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required.");
  } else if (password.length > 128) {
    errors.push("Password cannot exceed 128 characters.");
  }

  return errors;
};

// Validate forgot password
const validateForgotPassword = (req) => {
  const errors = [];

  const { email } = req.body || {};

  if (
    !email ||
    typeof email !== "string" ||
    !isValidEmail(email.trim())
  ) {
    errors.push("A valid email address is required.");
  }

  return errors;
};

// Validate reset password
const validateResetPassword = (req) => {
  const errors = [];

  const {
    token,
    password,
    confirmPassword,
  } = req.body || {};

  // Reset token
  if (
    !token ||
    typeof token !== "string" ||
    !token.trim()
  ) {
    errors.push("Password reset token is required.");
  }

  // New password
  if (!password || typeof password !== "string") {
    errors.push("New password is required.");
  } else {
    if (password.length < 8 || password.length > 128) {
      errors.push("Password must contain between 8 and 128 characters.");
    }
  }

  // Confirm password
  if (
    typeof password === "string" &&
    password !== confirmPassword
  ) {
    errors.push("Password and confirm password do not match.");
  }

  return errors;
};

export {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
};
