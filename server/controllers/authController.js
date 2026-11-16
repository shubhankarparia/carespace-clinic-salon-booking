
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { sendEmail } from "../config/mail.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

// ==========================================
// HELPER: SAFE USER RESPONSE
// ==========================================

const getSafeUser = (user) => ({
  id: user._id,

  // Personal information
  firstName: user.firstName || "",
  lastName: user.lastName || "",
  name: [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" "),

  // Contact information
  email: user.email,
  phone: user.phone || "",

  // Address information
  // Convert nested MongoDB address into frontend fields
  address: user.address?.street || "",
  city: user.address?.city || "",
  state: user.address?.state || "",
  pincode: user.address?.postalCode || "",
  country: user.address?.country || "India",

  // Account information
  role: user.role,
  profileImage: user.profileImage || "",
  isActive: user.isActive,
});

// ==========================================
// HELPER: VALIDATE JWT CONFIGURATION
// ==========================================

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be configured with at least 32 characters."
    );
  }

  return secret;
};

// ==========================================
// HELPER: NORMALIZE EMAIL
// ==========================================

const normalizeEmail = (email) => {
  return String(email).trim().toLowerCase();
};

// ==========================================
// REGISTER CUSTOMER
// POST /api/auth/register
// ==========================================

export const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
  } = req.body;

  // Required fields
  if (!firstName || !email || !phone || !password) {
    throw ApiError.badRequest(
      "First name, email, phone and password are required."
    );
  }

  const normalizedEmail = normalizeEmail(email);

  // Check existing account
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw ApiError.conflict(
      "An account with this email already exists."
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create customer
  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName?.trim() || "",
    email: normalizedEmail,
    phone: String(phone).trim(),
    password: hashedPassword,
    role: "customer",
  });

  // Generate JWT
  const token = generateToken({
    id: user._id.toString(),
    role: user.role,
  });

  return res.status(201).json({
    success: true,
    message: "Registration successful.",
    token,
    user: getSafeUser(user),
  });
});

// ==========================================
// LOGIN USER
// POST /api/auth/login
// ==========================================

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest(
      "Email and password are required."
    );
  }

  const normalizedEmail = normalizeEmail(email);

  // Find user and include password
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw ApiError.unauthorized(
      "Invalid email or password."
    );
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw ApiError.unauthorized(
      "Invalid email or password."
    );
  }

  // Check account status
  if (user.isActive === false) {
    throw ApiError.forbidden(
      "Your account has been deactivated."
    );
  }

  // Update last login
  user.lastLogin = new Date();

  await user.save();

  // Generate JWT
  const token = generateToken({
    id: user._id.toString(),
    role: user.role,
  });

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    token,
    user: getSafeUser(user),
  });
});

// ==========================================
// GET LOGGED-IN USER
// GET /api/auth/me
// ==========================================

export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized(
      "Authentication required."
    );
  }

  return res.status(200).json({
    success: true,
    user: getSafeUser(req.user),
  });
});

// ==========================================
// UPDATE LOGGED-IN USER PROFILE
// PUT /api/auth/profile
// ==========================================

export const updateMyProfile = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw ApiError.unauthorized(
      "Authentication required."
    );
  }

  const {
    name,
    phone,
    address,
    city,
    state,
    pincode,
  } = req.body;

  // Find authenticated user
  const user = await User.findById(req.user._id);

  if (!user || user.isActive === false) {
    throw ApiError.notFound(
      "User account not found."
    );
  }

  // ========================================
  // UPDATE NAME
  // ========================================

  if (name !== undefined) {
    const fullName = String(name).trim();

    if (fullName.length < 2) {
      throw ApiError.badRequest(
        "Name must contain at least 2 characters."
      );
    }

    if (fullName.length > 100) {
      throw ApiError.badRequest(
        "Name cannot exceed 100 characters."
      );
    }

    const nameParts = fullName.split(/\s+/);

    user.firstName = nameParts[0];
    user.lastName = nameParts.slice(1).join(" ");
  }

  // ========================================
  // UPDATE PHONE
  // ========================================

  if (phone !== undefined) {
    const normalizedPhone = String(phone).trim();

    if (normalizedPhone) {
      if (!/^[+]?[0-9\s()-]{7,20}$/.test(normalizedPhone)) {
        throw ApiError.badRequest(
          "Please enter a valid phone number."
        );
      }

      user.phone = normalizedPhone;
    }
  }

  // ========================================
  // UPDATE ADDRESS
  // ========================================

  // Preserve existing address values when a field
  // is not included in the request.

  const currentAddress = user.address?.toObject
    ? user.address.toObject()
    : { ...(user.address || {}) };

  if (address !== undefined) {
    currentAddress.street = String(address).trim();
  }

  if (city !== undefined) {
    currentAddress.city = String(city).trim();
  }

  if (state !== undefined) {
    currentAddress.state = String(state).trim();
  }

  if (pincode !== undefined) {
    const postalCode = String(pincode).trim();

    if (
      postalCode &&
      !/^[A-Za-z0-9\s-]{3,15}$/.test(postalCode)
    ) {
      throw ApiError.badRequest(
        "Please enter a valid PIN code."
      );
    }

    currentAddress.postalCode = postalCode;
  }

  currentAddress.country =
    currentAddress.country || "India";

  user.address = currentAddress;

  // ========================================
  // SAVE PROFILE
  // ========================================

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user: getSafeUser(user),
  });
});

// ==========================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ==========================================

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw ApiError.badRequest("Email is required.");
  }

  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({
    email: normalizedEmail,
  });

  // Do not reveal whether an account exists.
  const message =
    "If an account exists for this email, password reset instructions will be sent.";

  if (!user || user.isActive === false) {
    return res.status(200).json({
      success: true,
      message,
    });
  }

  // Generate password reset token
  const resetToken = jwt.sign(
    {
      id: user._id.toString(),
      purpose: "password-reset",
    },
    getJwtSecret(),
    {
      expiresIn: "15m",
      issuer: "carespace-api",
      algorithm: "HS256",
    }
  );

  // Frontend URL
  const clientUrl = (
    process.env.CLIENT_URL || "http://localhost:5173"
  ).replace(/\/+$/, "");

  const resetUrl =
    `${clientUrl}/reset-password/${resetToken}`;

  // Send reset email
  try {
    await sendEmail({
      to: user.email,
      subject: "CareSpace Password Reset",

      text: [
        "We received a request to reset your CareSpace password.",
        "",
        `Reset your password using this link: ${resetUrl}`,
        "",
        "This link expires in 15 minutes.",
        "If you did not request this, ignore this email.",
      ].join("\n"),

      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:25px;color:#263238">

          <h2 style="color:#159b91">
            CareSpace Password Reset
          </h2>

          <p>
            We received a request to reset your password.
          </p>

          <p>
            Click the button below to create a new password.
          </p>

          <p style="margin:30px 0">
            <a
              href="${resetUrl}"
              style="background:#159b91;color:#ffffff;padding:13px 24px;text-decoration:none;border-radius:8px;display:inline-block"
            >
              Reset Password
            </a>
          </p>

          <p>
            This link expires in 15 minutes.
          </p>

          <p>
            If you did not request this, please ignore this email.
          </p>

          <p>
            Regards,<br />
            <strong>CareSpace Team</strong>
          </p>

        </div>
      `,
    });

  } catch (error) {
    console.error(
      "Password reset email failed:",
      error.message
    );

    throw ApiError.internal(
      "Unable to send password reset email. Please try again later."
    );
  }

  return res.status(200).json({
    success: true,
    message,
  });
});

// ==========================================
// RESET PASSWORD
// POST /api/auth/reset-password
// ==========================================

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw ApiError.badRequest(
      "Reset token and new password are required."
    );
  }

  let decoded;

  // Verify reset token
  try {
    decoded = jwt.verify(token, getJwtSecret(), {
      issuer: "carespace-api",
      algorithms: ["HS256"],
    });

  } catch (error) {
    throw ApiError.badRequest(
      "Password reset link is invalid or expired."
    );
  }

  // Validate token purpose
  if (
    decoded.purpose !== "password-reset" ||
    !decoded.id
  ) {
    throw ApiError.badRequest(
      "Invalid password reset token."
    );
  }

  // Find user
  const user = await User.findById(decoded.id).select("+password");

  if (!user || user.isActive === false) {
    throw ApiError.badRequest(
      "Unable to reset password for this account."
    );
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 12);

  user.password = hashedPassword;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password reset successfully. Please log in.",
  });
});

// ==========================================
// LOGOUT USER
// POST /api/auth/logout
// ==========================================

export const logoutUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      "Logout successful. Please clear your saved authentication token.",
  });
});
