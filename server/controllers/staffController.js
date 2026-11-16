
import mongoose from "mongoose";

import Staff from "../models/Staff.js";
import Service from "../models/Service.js";

/* =========================================================
   COMMON HELPERS
========================================================= */

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

const staffRoles = {
  clinic: [
    "Doctor",
    "Dentist",
    "Nurse",
    "Physiotherapist",
    "Lab Technician",
    "Receptionist",
  ],

  salon: [
    "Hair Stylist",
    "Beautician",
    "Makeup Artist",
    "Hair Therapist",
    "Nail Technician",
    "Receptionist",
  ],
};

const sendError = (res, status, message, errors = []) => {
  return res.status(status).json({
    success: false,
    message,
    ...(errors.length ? { errors } : {}),
  });
};

/* =========================================================
   VALIDATE STAFF DATA
========================================================= */

const validateStaffData = (data, partial = false) => {
  const errors = [];

  const allowedCategories = ["clinic", "salon"];

  if (!partial || data.name !== undefined) {
    if (!data.name || !String(data.name).trim()) {
      errors.push("Staff name is required.");
    }
  }

  if (!partial || data.category !== undefined) {
    if (!data.category) {
      errors.push("Department is required.");
    } else if (!allowedCategories.includes(data.category)) {
      errors.push("Department must be clinic or salon.");
    }
  }

  if (!partial || data.role !== undefined) {
    if (!data.role || !String(data.role).trim()) {
      errors.push("Staff role is required.");
    }
  }

  if (data.category && data.role) {
    const validRoles = staffRoles[data.category];

    if (!validRoles || !validRoles.includes(data.role)) {
      errors.push(
        `Invalid staff role "${data.role}" for ${data.category}.`
      );
    }
  }

  if (data.email !== undefined && data.email !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(String(data.email).trim())) {
      errors.push("Please provide a valid email address.");
    }
  }

  if (data.experience !== undefined) {
    const experience = Number(data.experience);

    if (!Number.isFinite(experience) || experience < 0) {
      errors.push("Experience must be a valid non-negative number.");
    }
  }

  if (data.consultationFee !== undefined) {
    const fee = Number(data.consultationFee);

    if (!Number.isFinite(fee) || fee < 0) {
      errors.push("Consultation fee must be a valid non-negative number.");
    }
  }

  return errors;
};

/* =========================================================
   VALIDATE ASSIGNED SERVICES
========================================================= */

const validateServices = async (services, category) => {
  if (!Array.isArray(services)) {
    return {
      valid: false,
      message: "Services must be provided as an array.",
    };
  }

  if (services.length === 0) {
    return {
      valid: true,
      message: "",
    };
  }

  const serviceIds = services.map((service) =>
    String(service).trim()
  );

  for (const id of serviceIds) {
    if (!validId(id)) {
      return {
        valid: false,
        message: `Invalid service ID: ${id}`,
      };
    }
  }

  const uniqueIds = [...new Set(serviceIds)];

  if (uniqueIds.length !== serviceIds.length) {
    return {
      valid: false,
      message: "Duplicate services are not allowed.",
    };
  }

  const count = await Service.countDocuments({
    _id: { $in: uniqueIds },
    category,
    isActive: true,
  });

  if (count !== uniqueIds.length) {
    return {
      valid: false,
      message:
        "One or more selected services are invalid, inactive, or belong to another department.",
    };
  }

  return {
    valid: true,
    message: "",
  };
};

/* =========================================================
   1. GET PUBLIC STAFF
   GET /api/staff

   Customers can see only:
   - Active staff
   - Available staff
========================================================= */

export const getAllStaff = async (req, res) => {
  try {
    const filter = {
      isActive: true,
      isAvailable: true,
    };

    if (req.query.category) {
      if (!["clinic", "salon"].includes(req.query.category)) {
        return sendError(
          res,
          400,
          "Invalid department. Use clinic or salon."
        );
      }

      filter.category = req.query.category;
    }

    if (req.query.serviceId) {
      if (!validId(req.query.serviceId)) {
        return sendError(res, 400, "Invalid service ID.");
      }

      filter.services = req.query.serviceId;
    }

    const staff = await Staff.find(filter)
      .select("-__v")
      .populate("services", "name category price duration")
      .sort({ rating: -1, name: 1 });

    return res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    console.error("Get public staff error:", error);

    return sendError(
      res,
      500,
      "Failed to fetch staff members."
    );
  }
};

/* =========================================================
   2. GET ALL STAFF FOR ADMIN
   GET /api/staff/admin/all

   Admin can see:
   - Active staff
   - Inactive staff
   - Available staff
   - Unavailable staff

   IMPORTANT:
   Do not add isActive/isAvailable filters here.
========================================================= */

export const getAllStaffAdmin = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      if (!["clinic", "salon"].includes(req.query.category)) {
        return sendError(
          res,
          400,
          "Invalid department. Use clinic or salon."
        );
      }

      filter.category = req.query.category;
    }

    const staff = await Staff.find(filter)
      .select("-__v")
      .populate("services", "name category price duration")
      .sort({ createdAt: -1, name: 1 });

    return res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    console.error("Get admin staff error:", error);

    return sendError(
      res,
      500,
      "Failed to fetch staff members for admin."
    );
  }
};

/* =========================================================
   3. GET SINGLE STAFF MEMBER
   GET /api/staff/:id
========================================================= */

export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return sendError(res, 400, "Invalid staff ID.");
    }

    const staff = await Staff.findOne({
      _id: id,
      isActive: true,
    })
      .select("-__v")
      .populate("services", "name category price duration");

    if (!staff) {
      return sendError(res, 404, "Staff member not found.");
    }

    return res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    console.error("Get staff by ID error:", error);

    return sendError(
      res,
      500,
      "Failed to fetch staff details."
    );
  }
};

/* =========================================================
   4. CREATE STAFF
   POST /api/staff
========================================================= */

export const createStaff = async (req, res) => {
  try {
    const data = { ...req.body };

    // Normalize text fields.
    data.name = data.name?.trim();
    data.email = data.email?.trim().toLowerCase();
    data.phone = data.phone?.trim();
    data.specialization = data.specialization?.trim();
    data.qualification = data.qualification?.trim();
    data.bio = data.bio?.trim();

    // Validate required fields and values.
    const errors = validateStaffData(data);

    if (errors.length) {
      return sendError(
        res,
        400,
        "Please correct the staff information.",
        errors
      );
    }

    // Validate assigned services.
    const services = data.services ?? [];

    const serviceValidation = await validateServices(
      services,
      data.category
    );

    if (!serviceValidation.valid) {
      return sendError(
        res,
        400,
        serviceValidation.message
      );
    }

    const staff = await Staff.create({
      name: data.name,
      email: data.email || "",
      phone: data.phone || "",
      category: data.category,
      role: data.role,
      specialization: data.specialization || "",
      qualification: data.qualification || "",
      experience: Number(data.experience ?? 0),
      bio: data.bio || "",
      profileImage: data.profileImage || "",
      services,
      consultationFee: Number(data.consultationFee ?? 0),

      isAvailable: data.isAvailable ?? true,
      isActive: data.isActive ?? true,
    });

    const populatedStaff = await Staff.findById(staff._id)
      .populate("services", "name category price duration");

    return res.status(201).json({
      success: true,
      message: "Staff member created successfully.",
      staff: populatedStaff,
    });
  } catch (error) {
    console.error("Create staff error:", error);

    if (error.code === 11000) {
      return sendError(
        res,
        409,
        "A staff member with this email or phone number already exists."
      );
    }

    if (error.name === "ValidationError") {
      return sendError(
        res,
        400,
        error.message
      );
    }

    return sendError(
      res,
      500,
      "Failed to create staff member."
    );
  }
};

/* =========================================================
   5. UPDATE STAFF
   PATCH /api/staff/:id
========================================================= */

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return sendError(res, 400, "Invalid staff ID.");
    }

    const staff = await Staff.findById(id);

    if (!staff) {
      return sendError(res, 404, "Staff member not found.");
    }

    // Only these fields can be updated.
    const allowedFields = [
      "name",
      "email",
      "phone",
      "category",
      "role",
      "specialization",
      "qualification",
      "experience",
      "bio",
      "profileImage",
      "services",
      "consultationFee",
      "isAvailable",
      "isActive",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Normalize text fields.
    if (updates.name !== undefined) {
      updates.name = String(updates.name).trim();
    }

    if (updates.email !== undefined) {
      updates.email = String(updates.email).trim().toLowerCase();
    }

    if (updates.phone !== undefined) {
      updates.phone = String(updates.phone).trim();
    }

    if (updates.specialization !== undefined) {
      updates.specialization = String(updates.specialization).trim();
    }

    if (updates.qualification !== undefined) {
      updates.qualification = String(updates.qualification).trim();
    }

    if (updates.bio !== undefined) {
      updates.bio = String(updates.bio).trim();
    }

    // Validate updated fields.
    const errors = validateStaffData(updates, true);

    if (errors.length) {
      return sendError(
        res,
        400,
        "Please correct the staff information.",
        errors
      );
    }

    // Determine the final category and services.
    const finalCategory = updates.category ?? staff.category;

    const finalServices =
      updates.services !== undefined
        ? updates.services
        : staff.services.map((service) => String(service));

    // Validate role against the final category.
    const finalRole = updates.role ?? staff.role;

    if (
      !staffRoles[finalCategory] ||
      !staffRoles[finalCategory].includes(finalRole)
    ) {
      return sendError(
        res,
        400,
        `Invalid staff role "${finalRole}" for ${finalCategory}.`
      );
    }

    // Validate services when services or category changes.
    if (
      updates.services !== undefined ||
      updates.category !== undefined
    ) {
      const serviceValidation = await validateServices(
        finalServices,
        finalCategory
      );

      if (!serviceValidation.valid) {
        return sendError(
          res,
          400,
          serviceValidation.message
        );
      }
    }

    // Normalize numeric fields.
    if (updates.experience !== undefined) {
      updates.experience = Number(updates.experience);
    }

    if (updates.consultationFee !== undefined) {
      updates.consultationFee = Number(updates.consultationFee);
    }

    // Preserve protected fields:
    // _id, user, rating, totalReviews, createdAt, updatedAt, __v.
    Object.assign(staff, updates);

    await staff.save();

    const updatedStaff = await Staff.findById(staff._id)
      .select("-__v")
      .populate("services", "name category price duration");

    return res.status(200).json({
      success: true,
      message: "Staff member updated successfully.",
      staff: updatedStaff,
    });
  } catch (error) {
    console.error("Update staff error:", error);

    if (error.code === 11000) {
      return sendError(
        res,
        409,
        "A staff member with this email or phone number already exists."
      );
    }

    if (error.name === "ValidationError") {
      return sendError(
        res,
        400,
        error.message
      );
    }

    return sendError(
      res,
      500,
      "Failed to update staff member."
    );
  }
};

/* =========================================================
   6. DELETE / DEACTIVATE STAFF
   DELETE /api/staff/:id

   SOFT DELETE:
   The record is NOT physically removed from MongoDB.
========================================================= */

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return sendError(res, 400, "Invalid staff ID.");
    }

    const staff = await Staff.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: false,
          isAvailable: false,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!staff) {
      return sendError(res, 404, "Staff member not found.");
    }

    return res.status(200).json({
      success: true,
      message: "Staff member deactivated successfully.",
      staff,
    });
  } catch (error) {
    console.error("Delete staff error:", error);

    return sendError(
      res,
      500,
      "Failed to deactivate staff member."
    );
  }
};
