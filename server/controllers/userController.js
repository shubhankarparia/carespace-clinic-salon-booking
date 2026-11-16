
import mongoose from "mongoose";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Fields safe to return in API responses
const getSafeUser = (user) => {
  if (!user) return null;

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profileImage: user.profileImage,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    address: user.address,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate phone number
const isValidPhone = (phone) => {
  return /^[+]?[0-9\s()-]{7,20}$/.test(phone);
};

// Validate name
const isValidName = (name) => {
  return (
    typeof name === "string" &&
    name.trim().length >= 2 &&
    name.trim().length <= 50
  );
};

/*
|--------------------------------------------------------------------------
| CUSTOMER: GET OWN PROFILE
|--------------------------------------------------------------------------
| GET /api/users/profile
*/
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw ApiError.notFound("User profile not found.");
  }

  return res.status(200).json({
    success: true,
    message: "Profile retrieved successfully.",
    user: getSafeUser(user),
  });
});

/*
|--------------------------------------------------------------------------
| CUSTOMER: UPDATE OWN PROFILE
|--------------------------------------------------------------------------
| PUT /api/users/profile
*/
export const updateUserProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "phone",
    "gender",
    "dateOfBirth",
    "address",
    "profileImage",
  ];

  const updates = {};

  // Only accept allowed fields
  for (const field of allowedFields) {
    if (req.body?.[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest("Please provide at least one field to update.");
  }

  // Validate first name
  if (updates.firstName !== undefined) {
    if (!isValidName(updates.firstName)) {
      throw ApiError.badRequest(
        "First name must contain between 2 and 50 characters."
      );
    }

    updates.firstName = updates.firstName.trim();
  }

  // Validate last name
  if (updates.lastName !== undefined) {
    if (
      typeof updates.lastName !== "string" ||
      updates.lastName.trim().length > 50
    ) {
      throw ApiError.badRequest("Enter a valid last name.");
    }

    updates.lastName = updates.lastName.trim();
  }

  // Validate phone
  if (updates.phone !== undefined) {
    if (
      typeof updates.phone !== "string" ||
      !isValidPhone(updates.phone.trim())
    ) {
      throw ApiError.badRequest("Enter a valid phone number.");
    }

    updates.phone = updates.phone.trim();
  }

  // Validate gender
  if (updates.gender !== undefined) {
    const allowedGenders = [
      "male",
      "female",
      "other",
      "prefer_not_to_say",
    ];

    if (!allowedGenders.includes(updates.gender)) {
      throw ApiError.badRequest("Invalid gender selection.");
    }
  }

  // Validate date of birth
  if (updates.dateOfBirth !== undefined) {
    if (updates.dateOfBirth === null || updates.dateOfBirth === "") {
      updates.dateOfBirth = null;
    } else {
      const date = new Date(updates.dateOfBirth);

      if (Number.isNaN(date.getTime())) {
        throw ApiError.badRequest("Enter a valid date of birth.");
      }

      if (date > new Date()) {
        throw ApiError.badRequest("Date of birth cannot be in the future.");
      }

      updates.dateOfBirth = date;
    }
  }

  // Validate address
  if (updates.address !== undefined) {
    if (
      !updates.address ||
      typeof updates.address !== "object" ||
      Array.isArray(updates.address)
    ) {
      throw ApiError.badRequest("Address must be a valid object.");
    }

    const allowedAddressFields = [
      "street",
      "city",
      "state",
      "postalCode",
      "country",
    ];

    const cleanAddress = {};

    for (const field of allowedAddressFields) {
      if (updates.address[field] !== undefined) {
        if (typeof updates.address[field] !== "string") {
          throw ApiError.badRequest(`Address ${field} must be a string.`);
        }

        if (updates.address[field].trim().length > 150) {
          throw ApiError.badRequest(`Address ${field} is too long.`);
        }

        cleanAddress[field] = updates.address[field].trim();
      }
    }

    updates.address = cleanAddress;
  }

  // Validate profile image URL
  if (updates.profileImage !== undefined) {
    if (
      typeof updates.profileImage !== "string" ||
      updates.profileImage.length > 2048
    ) {
      throw ApiError.badRequest("Enter a valid profile image URL.");
    }

    updates.profileImage = updates.profileImage.trim();

    if (updates.profileImage) {
      let imageUrl;

      try {
        imageUrl = new URL(updates.profileImage);
      } catch {
        throw ApiError.badRequest("Profile image must be a valid URL.");
      }

      if (!["http:", "https:"].includes(imageUrl.protocol)) {
        throw ApiError.badRequest("Profile image URL must use HTTP or HTTPS.");
      }
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  ).select("-password");

  if (!user) {
    throw ApiError.notFound("User profile not found.");
  }

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user: getSafeUser(user),
  });
});

/*
|--------------------------------------------------------------------------
| ADMIN: GET ALL USERS
|--------------------------------------------------------------------------
| GET /api/users?page=1&limit=10&search=bikram&role=customer
*/
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit, 10) || 10)
  );

  const skip = (page - 1) * limit;

  const filter = {};

  // Filter by role
  if (req.query.role) {
    const allowedRoles = ["customer", "staff", "admin"];

    if (!allowedRoles.includes(req.query.role)) {
      throw ApiError.badRequest("Invalid user role filter.");
    }

    filter.role = req.query.role;
  }

  // Filter by active status
  if (req.query.isActive !== undefined) {
    if (!["true", "false"].includes(req.query.isActive)) {
      throw ApiError.badRequest("isActive must be true or false.");
    }

    filter.isActive = req.query.isActive === "true";
  }

  // Search users
  if (req.query.search) {
    const search = String(req.query.search).trim();

    if (search.length > 100) {
      throw ApiError.badRequest("Search text is too long.");
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { firstName: { $regex: escapedSearch, $options: "i" } },
        { lastName: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
        { phone: { $regex: escapedSearch, $options: "i" } },
      ];
    }
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: "Users retrieved successfully.",
    users: users.map(getSafeUser),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  });
});

/*
|--------------------------------------------------------------------------
| ADMIN: GET USER BY ID
|--------------------------------------------------------------------------
| GET /api/users/:id
*/
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw ApiError.badRequest("Invalid user ID.");
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    throw ApiError.notFound("User not found.");
  }

  return res.status(200).json({
    success: true,
    message: "User details retrieved successfully.",
    user: getSafeUser(user),
  });
});

/*
|--------------------------------------------------------------------------
| ADMIN: ACTIVATE / DEACTIVATE USER
|--------------------------------------------------------------------------
| PATCH /api/users/:id/status
*/
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body || {};

  if (!isValidObjectId(id)) {
    throw ApiError.badRequest("Invalid user ID.");
  }

  if (typeof isActive !== "boolean") {
    throw ApiError.badRequest("isActive must be true or false.");
  }

  const user = await User.findById(id);

  if (!user) {
    throw ApiError.notFound("User not found.");
  }

  // Prevent admin from deactivating their own account
  if (user._id.equals(req.user._id) && isActive === false) {
    throw ApiError.badRequest("You cannot deactivate your own account.");
  }

  user.isActive = isActive;
  await user.save();

  return res.status(200).json({
    success: true,
    message: `User ${isActive ? "activated" : "deactivated"} successfully.`,
    user: getSafeUser(user),
  });
});
