
import mongoose from "mongoose";

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const validateCreateStaff = (req) => {
  const errors = [];

  const {
    name,
    email,
    phone,
    category,
    role,
    specialization,
    qualification,
    experience,
    services,
    consultationFee,
  } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Staff name is required.");
  } else if (name.trim().length > 120) {
    errors.push("Staff name cannot exceed 120 characters.");
  }

  if (email !== undefined && email !== "") {
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      errors.push("Enter a valid staff email address.");
    }
  }

  if (phone !== undefined && phone !== "") {
    if (
      typeof phone !== "string" ||
      !/^[+]?[0-9\s()-]{7,20}$/.test(phone.trim())
    ) {
      errors.push("Enter a valid staff phone number.");
    }
  }

  if (!["clinic", "salon"].includes(category)) {
    errors.push("Staff category must be clinic or salon.");
  }

  if (!role || typeof role !== "string" || !role.trim()) {
    errors.push("Staff role is required.");
  } else if (role.trim().length > 100) {
    errors.push("Staff role cannot exceed 100 characters.");
  }

  if (
    specialization !== undefined &&
    (typeof specialization !== "string" || specialization.length > 150)
  ) {
    errors.push("Specialization cannot exceed 150 characters.");
  }

  if (
    qualification !== undefined &&
    (typeof qualification !== "string" || qualification.length > 250)
  ) {
    errors.push("Qualification cannot exceed 250 characters.");
  }

  if (
    experience !== undefined &&
    (
      !Number.isFinite(Number(experience)) ||
      Number(experience) < 0
    )
  ) {
    errors.push("Experience must be a non-negative number.");
  }

  if (
    consultationFee !== undefined &&
    (
      !Number.isFinite(Number(consultationFee)) ||
      Number(consultationFee) < 0
    )
  ) {
    errors.push("Consultation fee must be a non-negative number.");
  }

  if (services !== undefined) {
    if (
      !Array.isArray(services) ||
      !services.every((id) => isValidObjectId(id))
    ) {
      errors.push("Services must contain valid service IDs.");
    }
  }

  return errors;
};

const validateUpdateStaff = (req) => {
  const errors = [];
  const body = req.body;

  if (Object.keys(body).length === 0) {
    errors.push("At least one field is required to update staff.");
  }

  if (body.name !== undefined) {
    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.trim().length > 120
    ) {
      errors.push("Staff name must be between 1 and 120 characters.");
    }
  }

  if (body.email !== undefined && body.email !== "") {
    if (
      typeof body.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
    ) {
      errors.push("Enter a valid staff email address.");
    }
  }

  if (body.phone !== undefined && body.phone !== "") {
    if (
      typeof body.phone !== "string" ||
      !/^[+]?[0-9\s()-]{7,20}$/.test(body.phone.trim())
    ) {
      errors.push("Enter a valid staff phone number.");
    }
  }

  if (
    body.category !== undefined &&
    !["clinic", "salon"].includes(body.category)
  ) {
    errors.push("Staff category must be clinic or salon.");
  }

  if (body.role !== undefined) {
    if (
      typeof body.role !== "string" ||
      !body.role.trim() ||
      body.role.trim().length > 100
    ) {
      errors.push("Enter a valid staff role.");
    }
  }

  if (body.experience !== undefined) {
    if (
      !Number.isFinite(Number(body.experience)) ||
      Number(body.experience) < 0
    ) {
      errors.push("Experience must be a non-negative number.");
    }
  }

  if (body.consultationFee !== undefined) {
    if (
      !Number.isFinite(Number(body.consultationFee)) ||
      Number(body.consultationFee) < 0
    ) {
      errors.push("Consultation fee must be a non-negative number.");
    }
  }

  if (body.services !== undefined) {
    if (
      !Array.isArray(body.services) ||
      !body.services.every((id) => isValidObjectId(id))
    ) {
      errors.push("Services must contain valid service IDs.");
    }
  }

  return errors;
};

const validateStaffId = (req) => {
  const errors = [];

  if (!req.params.id || !isValidObjectId(req.params.id)) {
    errors.push("A valid staff ID is required.");
  }

  return errors;
};

export {
  validateCreateStaff,
  validateUpdateStaff,
  validateStaffId,
};
