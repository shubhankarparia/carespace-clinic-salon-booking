
import mongoose from "mongoose";
import Service from "../models/Service.js";
import Staff from "../models/Staff.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Allowed service categories
const ALLOWED_CATEGORIES = ["clinic", "salon"];

// Allowed fields when creating a service
const CREATE_FIELDS = [
  "name",
  "slug",
  "category",
  "description",
  "shortDescription",
  "price",
  "discountPrice",
  "duration",
  "preparationTime",
  "cleanupTime",
  "features",
  "requirements",
  "assignedStaff",
  "icon",
  "image",
  "isFeatured",
  "sortOrder",
];

// Allowed fields when updating a service
const UPDATE_FIELDS = [
  ...CREATE_FIELDS,
  "isActive",
];

// Validate MongoDB ObjectId
const validId = (id) => mongoose.Types.ObjectId.isValid(id);

// Escape regular expression input
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Validate numeric values
const isValidNumber = (value) => {
  return (
    value !== "" &&
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value))
  );
};

// Validate non-negative number
const validateNonNegativeNumber = (value, fieldName) => {
  if (!isValidNumber(value) || Number(value) < 0) {
    throw ApiError.badRequest(
      `${fieldName} must be a valid non-negative number.`
    );
  }
};

// Validate assigned staff IDs
const validateAssignedStaff = async (assignedStaff) => {
  if (assignedStaff === undefined) return;

  if (!Array.isArray(assignedStaff)) {
    throw ApiError.badRequest("Assigned staff must be an array.");
  }

  const uniqueIds = [...new Set(assignedStaff.map(String))];

  for (const id of uniqueIds) {
    if (!validId(id)) {
      throw ApiError.badRequest("One or more assigned staff IDs are invalid.");
    }
  }

  if (uniqueIds.length === 0) return;

  const staffMembers = await Staff.find({
    _id: { $in: uniqueIds },
  }).select("_id");

  if (staffMembers.length !== uniqueIds.length) {
    throw ApiError.badRequest("One or more assigned staff members do not exist.");
  }
};

// Validate service name and slug
const validateNameAndSlug = (data) => {
  if (data.name !== undefined) {
    if (
      typeof data.name !== "string" ||
      data.name.trim().length < 2 ||
      data.name.trim().length > 100
    ) {
      throw ApiError.badRequest(
        "Service name must contain between 2 and 100 characters."
      );
    }

    data.name = data.name.trim();
  }

  if (data.slug !== undefined) {
    if (typeof data.slug !== "string") {
      throw ApiError.badRequest("Service slug must be a string.");
    }

    data.slug = data.slug.trim().toLowerCase();

    if (
      data.slug.length < 2 ||
      data.slug.length > 120 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)
    ) {
      throw ApiError.badRequest(
        "Slug can contain lowercase letters, numbers and hyphens."
      );
    }
  }
};

// Validate category
const validateCategory = (data) => {
  if (data.category !== undefined) {
    if (!ALLOWED_CATEGORIES.includes(data.category)) {
      throw ApiError.badRequest(
        "Category must be either clinic or salon."
      );
    }
  }
};

// Validate description fields
const validateTextFields = (data) => {
  const fields = {
    description: 3000,
    shortDescription: 300,
    icon: 100,
    image: 2048,
  };

  for (const [field, maxLength] of Object.entries(fields)) {
    if (data[field] !== undefined) {
      if (
        typeof data[field] !== "string" ||
        data[field].length > maxLength
      ) {
        throw ApiError.badRequest(
          `${field} must be a string with maximum ${maxLength} characters.`
        );
      }

      data[field] = data[field].trim();
    }
  }

  if (data.image) {
    try {
      const imageUrl = new URL(data.image);

      if (!["http:", "https:"].includes(imageUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      throw ApiError.badRequest("Image must be a valid HTTP or HTTPS URL.");
    }
  }
};

// Validate price and duration fields
const validateServiceNumbers = (data) => {
  const numericFields = [
    "price",
    "duration",
    "preparationTime",
    "cleanupTime",
    "sortOrder",
  ];

  for (const field of numericFields) {
    if (data[field] !== undefined) {
      validateNonNegativeNumber(data[field], field);

      data[field] = Number(data[field]);
    }
  }

  if (data.duration !== undefined && data.duration <= 0) {
    throw ApiError.badRequest("Service duration must be greater than zero.");
  }

  if (data.sortOrder !== undefined && !Number.isInteger(data.sortOrder)) {
    throw ApiError.badRequest("Sort order must be a whole number.");
  }

  if (data.discountPrice !== undefined) {
    if (
      data.discountPrice === "" ||
      data.discountPrice === null
    ) {
      data.discountPrice = null;
    } else {
      validateNonNegativeNumber(data.discountPrice, "Discount price");
      data.discountPrice = Number(data.discountPrice);

      if (
        data.price !== undefined &&
        data.discountPrice >= data.price
      ) {
        throw ApiError.badRequest(
          "Discount price must be lower than the regular price."
        );
      }
    }
  }

  if (
    data.price !== undefined &&
    data.discountPrice !== undefined &&
    data.discountPrice !== null &&
    data.discountPrice >= data.price
  ) {
    throw ApiError.badRequest(
      "Discount price must be lower than the regular price."
    );
  }
};

// Validate arrays
const validateArrayFields = (data) => {
  for (const field of ["features", "requirements"]) {
    if (data[field] !== undefined) {
      if (
        !Array.isArray(data[field]) ||
        !data[field].every((item) => typeof item === "string")
      ) {
        throw ApiError.badRequest(`${field} must be an array of strings.`);
      }

      data[field] = data[field]
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
};

// Validate boolean fields
const validateBooleanFields = (data) => {
  for (const field of ["isFeatured", "isActive"]) {
    if (data[field] !== undefined && typeof data[field] !== "boolean") {
      throw ApiError.badRequest(`${field} must be true or false.`);
    }
  }
};

// Pick only allowed fields from request body
const pickAllowedFields = (body, allowedFields) => {
  const result = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      result[field] = body[field];
    }
  }

  return result;
};

/*
|--------------------------------------------------------------------------
| PUBLIC: GET ALL ACTIVE SERVICES
|--------------------------------------------------------------------------
| GET /api/services
| GET /api/services?category=clinic
| GET /api/services?category=salon
| GET /api/services?featured=true
| GET /api/services?search=hair
| GET /api/services?page=1&limit=10
*/
export const getAllServices = asyncHandler(async (req, res) => {
  const filter = {
    isActive: true,
  };

  // Category filter
  if (req.query.category) {
    if (!ALLOWED_CATEGORIES.includes(req.query.category)) {
      throw ApiError.badRequest("Category must be clinic or salon.");
    }

    filter.category = req.query.category;
  }

  // Featured filter
  if (req.query.featured !== undefined) {
    if (!["true", "false"].includes(req.query.featured)) {
      throw ApiError.badRequest("Featured must be true or false.");
    }

    filter.isFeatured = req.query.featured === "true";
  }

  // Search filter
  if (req.query.search) {
    const search = String(req.query.search).trim();

    if (search.length > 100) {
      throw ApiError.badRequest("Search text cannot exceed 100 characters.");
    }

    if (search) {
      const safeSearch = escapeRegex(search);

      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { shortDescription: { $regex: safeSearch, $options: "i" } },
        { subcategory: { $regex: safeSearch, $options: "i" } },
      ];
    }
  }

  // Pagination
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit, 10) || 20)
  );

  const skip = (page - 1) * limit;

  const [services, total] = await Promise.all([
    Service.find(filter)
      .populate("assignedStaff", "name role specialization profileImage")
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Service.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: "Services retrieved successfully.",
    count: services.length,
    services,
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
| PUBLIC: GET SERVICE DETAILS
|--------------------------------------------------------------------------
| GET /api/services/:id
*/
export const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validId(id)) {
    throw ApiError.badRequest("Invalid service ID.");
  }

  const service = await Service.findOne({
    _id: id,
    isActive: true,
  }).populate(
    "assignedStaff",
    "name role specialization profileImage"
  );

  if (!service) {
    throw ApiError.notFound("Service not found.");
  }

  return res.status(200).json({
    success: true,
    message: "Service details retrieved successfully.",
    service,
  });
});

/*
|--------------------------------------------------------------------------
| ADMIN: GET ALL SERVICES INCLUDING INACTIVE
|--------------------------------------------------------------------------
| GET /api/services/admin/all
*/
export const getAllServicesAdmin = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.category) {
    if (!ALLOWED_CATEGORIES.includes(req.query.category)) {
      throw ApiError.badRequest("Category must be clinic or salon.");
    }

    filter.category = req.query.category;
  }

  if (req.query.isActive !== undefined) {
    if (!["true", "false"].includes(req.query.isActive)) {
      throw ApiError.badRequest("isActive must be true or false.");
    }

    filter.isActive = req.query.isActive === "true";
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit, 10) || 20)
  );

  const skip = (page - 1) * limit;

  const [services, total] = await Promise.all([
    Service.find(filter)
      .populate("assignedStaff", "name role specialization profileImage")
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Service.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: "Admin services retrieved successfully.",
    services,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

/*
|--------------------------------------------------------------------------
| ADMIN: CREATE SERVICE
|--------------------------------------------------------------------------
| POST /api/services
*/
export const createService = asyncHandler(async (req, res) => {
  const data = pickAllowedFields(req.body || {}, CREATE_FIELDS);

  // Required fields
  const requiredFields = [
    "name",
    "slug",
    "category",
    "description",
    "price",
    "duration",
  ];

  for (const field of requiredFields) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ""
    ) {
      throw ApiError.badRequest(`${field} is required.`);
    }
  }

  validateNameAndSlug(data);
  validateCategory(data);
  validateTextFields(data);
  validateServiceNumbers(data);
  validateArrayFields(data);
  validateBooleanFields(data);

  await validateAssignedStaff(data.assignedStaff);

  // Check duplicate slug
  const existing = await Service.findOne({
    slug: data.slug,
  });

  if (existing) {
    throw ApiError.conflict("A service with this slug already exists.");
  }

  // Set defaults
  data.price = Number(data.price);
  data.duration = Number(data.duration);
  data.preparationTime = Number(data.preparationTime ?? 0);
  data.cleanupTime = Number(data.cleanupTime ?? 0);
  data.isFeatured = data.isFeatured ?? false;
  data.sortOrder = data.sortOrder ?? 0;

  const service = await Service.create(data);

  return res.status(201).json({
    success: true,
    message: "Service created successfully.",
    service,
  });
});

/*
|--------------------------------------------------------------------------
| ADMIN: UPDATE SERVICE
|--------------------------------------------------------------------------
| PUT /api/services/:id
*/
export const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validId(id)) {
    throw ApiError.badRequest("Invalid service ID.");
  }

  const updates = pickAllowedFields(req.body || {}, UPDATE_FIELDS);

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest("Please provide fields to update.");
  }

  validateNameAndSlug(updates);
  validateCategory(updates);
  validateTextFields(updates);
  validateServiceNumbers(updates);
  validateArrayFields(updates);
  validateBooleanFields(updates);

  await validateAssignedStaff(updates.assignedStaff);

  const existingService = await Service.findById(id);

  if (!existingService) {
    throw ApiError.notFound("Service not found.");
  }

  // Validate discount against existing price if only discount changes
  const finalPrice =
    updates.price !== undefined
      ? updates.price
      : existingService.price;

  if (
    updates.discountPrice !== undefined &&
    updates.discountPrice !== null &&
    updates.discountPrice >= finalPrice
  ) {
    throw ApiError.badRequest(
      "Discount price must be lower than the regular price."
    );
  }

  // Validate new slug uniqueness
  if (updates.slug !== undefined) {
    const duplicate = await Service.findOne({
      slug: updates.slug,
      _id: { $ne: id },
    });

    if (duplicate) {
      throw ApiError.conflict("Another service already uses this slug.");
    }
  }

  const service = await Service.findByIdAndUpdate(
    id,
    { $set: updates },
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  ).populate(
    "assignedStaff",
    "name role specialization profileImage"
  );

  return res.status(200).json({
    success: true,
    message: "Service updated successfully.",
    service,
  });
});

/*
|--------------------------------------------------------------------------
| ADMIN: DEACTIVATE SERVICE
|--------------------------------------------------------------------------
| DELETE /api/services/:id
| Soft delete: record remains in database.
*/
export const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validId(id)) {
    throw ApiError.badRequest("Invalid service ID.");
  }

  const service = await Service.findByIdAndUpdate(
    id,
    {
      $set: {
        isActive: false,
      },
    },
    {
      new: true,
    }
  );

  if (!service) {
    throw ApiError.notFound("Service not found.");
  }

  return res.status(200).json({
    success: true,
    message: "Service deactivated successfully.",
    service,
  });
});

/*
|--------------------------------------------------------------------------
| ADMIN: REACTIVATE SERVICE
|--------------------------------------------------------------------------
| PATCH /api/services/:id/status
*/
export const updateServiceStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body || {};

  if (!validId(id)) {
    throw ApiError.badRequest("Invalid service ID.");
  }

  if (typeof isActive !== "boolean") {
    throw ApiError.badRequest("isActive must be true or false.");
  }

  const service = await Service.findByIdAndUpdate(
    id,
    {
      $set: { isActive },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!service) {
    throw ApiError.notFound("Service not found.");
  }

  return res.status(200).json({
    success: true,
    message: `Service ${isActive ? "activated" : "deactivated"} successfully.`,
    service,
  });
});
