
const isValidSlug = (slug) => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
    slug.trim()
  );
};

const isValidNumber = (value) => {
  return (
    value !== "" &&
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value))
  );
};

// ==========================================
// CREATE SERVICE VALIDATION
// POST /api/services
// ==========================================

const validateCreateService = (req) => {
  const errors = [];

  const {
    name,
    slug,
    category,
    description,
    shortDescription,
    price,
    discountPrice,
    duration,
    preparationTime,
    cleanupTime,
    features,
  } = req.body || {};

  // Service name
  if (
    !name ||
    typeof name !== "string" ||
    !name.trim()
  ) {
    errors.push("Service name is required.");
  } else if (name.trim().length > 120) {
    errors.push(
      "Service name cannot exceed 120 characters."
    );
  }

  // Slug
  if (
    !slug ||
    typeof slug !== "string" ||
    !slug.trim()
  ) {
    errors.push("Service slug is required.");
  } else if (!isValidSlug(slug)) {
    errors.push(
      "Slug must contain lowercase letters, numbers and hyphens only."
    );
  }

  // Category
  if (!["clinic", "salon"].includes(category)) {
    errors.push(
      "Category must be clinic or salon."
    );
  }

  // Description
  if (
    !description ||
    typeof description !== "string" ||
    !description.trim()
  ) {
    errors.push(
      "Service description is required."
    );
  } else if (description.length > 3000) {
    errors.push(
      "Description cannot exceed 3000 characters."
    );
  }

  // Short description
  if (
    shortDescription !== undefined &&
    (
      typeof shortDescription !== "string" ||
      shortDescription.length > 250
    )
  ) {
    errors.push(
      "Short description cannot exceed 250 characters."
    );
  }

  // Price
  if (
    !isValidNumber(price) ||
    Number(price) < 0
  ) {
    errors.push(
      "A valid non-negative service price is required."
    );
  }

  // Discount price
  if (
    discountPrice !== undefined &&
    discountPrice !== null &&
    discountPrice !== ""
  ) {
    if (
      !isValidNumber(discountPrice) ||
      Number(discountPrice) < 0
    ) {
      errors.push(
        "Discount price must be a non-negative number."
      );
    } else if (
      isValidNumber(price) &&
      Number(discountPrice) > Number(price)
    ) {
      errors.push(
        "Discount price cannot be greater than the original price."
      );
    }
  }

  // Duration
  if (
    !isValidNumber(duration) ||
    !Number.isInteger(Number(duration)) ||
    Number(duration) < 5
  ) {
    errors.push(
      "Service duration must be at least 5 minutes."
    );
  }

  // Preparation time
  if (
    preparationTime !== undefined &&
    (
      !isValidNumber(preparationTime) ||
      !Number.isInteger(Number(preparationTime)) ||
      Number(preparationTime) < 0
    )
  ) {
    errors.push(
      "Preparation time must be a non-negative whole number."
    );
  }

  // Cleanup time
  if (
    cleanupTime !== undefined &&
    (
      !isValidNumber(cleanupTime) ||
      !Number.isInteger(Number(cleanupTime)) ||
      Number(cleanupTime) < 0
    )
  ) {
    errors.push(
      "Cleanup time must be a non-negative whole number."
    );
  }

  // Features
  if (
    features !== undefined &&
    (
      !Array.isArray(features) ||
      !features.every(
        (item) => typeof item === "string"
      )
    )
  ) {
    errors.push(
      "Features must be an array of text values."
    );
  }

  return errors;
};

// ==========================================
// UPDATE SERVICE VALIDATION
// PATCH /api/services/:id
// ==========================================

const validateUpdateService = (req) => {
  const errors = [];
  const body = req.body || {};

  if (Object.keys(body).length === 0) {
    errors.push(
      "At least one field is required to update a service."
    );
  }

  // Service name
  if (body.name !== undefined) {
    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.trim().length > 120
    ) {
      errors.push(
        "Service name must be between 1 and 120 characters."
      );
    }
  }

  // Slug
  if (body.slug !== undefined) {
    if (
      typeof body.slug !== "string" ||
      !body.slug.trim() ||
      !isValidSlug(body.slug)
    ) {
      errors.push(
        "Enter a valid service slug."
      );
    }
  }

  // Category
  if (
    body.category !== undefined &&
    !["clinic", "salon"].includes(body.category)
  ) {
    errors.push(
      "Category must be clinic or salon."
    );
  }

  // Description
  if (body.description !== undefined) {
    if (
      typeof body.description !== "string" ||
      !body.description.trim() ||
      body.description.length > 3000
    ) {
      errors.push(
        "Description must be between 1 and 3000 characters."
      );
    }
  }

  // Short description
  if (body.shortDescription !== undefined) {
    if (
      typeof body.shortDescription !== "string" ||
      body.shortDescription.length > 250
    ) {
      errors.push(
        "Short description cannot exceed 250 characters."
      );
    }
  }

  // Price
  if (body.price !== undefined) {
    if (
      !isValidNumber(body.price) ||
      Number(body.price) < 0
    ) {
      errors.push(
        "Enter a valid non-negative service price."
      );
    }
  }

  // Discount price
  if (
    body.discountPrice !== undefined &&
    body.discountPrice !== null &&
    body.discountPrice !== ""
  ) {
    if (
      !isValidNumber(body.discountPrice) ||
      Number(body.discountPrice) < 0
    ) {
      errors.push(
        "Enter a valid discount price."
      );
    } else if (
      isValidNumber(body.price) &&
      Number(body.discountPrice) > Number(body.price)
    ) {
      errors.push(
        "Discount price cannot be greater than the original price."
      );
    }
  }

  // Duration
  if (body.duration !== undefined) {
    if (
      !isValidNumber(body.duration) ||
      !Number.isInteger(Number(body.duration)) ||
      Number(body.duration) < 5
    ) {
      errors.push(
        "Duration must be at least 5 minutes."
      );
    }
  }

  // Preparation time
  if (body.preparationTime !== undefined) {
    if (
      !isValidNumber(body.preparationTime) ||
      !Number.isInteger(Number(body.preparationTime)) ||
      Number(body.preparationTime) < 0
    ) {
      errors.push(
        "Preparation time must be a non-negative whole number."
      );
    }
  }

  // Cleanup time
  if (body.cleanupTime !== undefined) {
    if (
      !isValidNumber(body.cleanupTime) ||
      !Number.isInteger(Number(body.cleanupTime)) ||
      Number(body.cleanupTime) < 0
    ) {
      errors.push(
        "Cleanup time must be a non-negative whole number."
      );
    }
  }

  // Features
  if (body.features !== undefined) {
    if (
      !Array.isArray(body.features) ||
      !body.features.every(
        (item) => typeof item === "string"
      )
    ) {
      errors.push(
        "Features must be an array of text values."
      );
    }
  }

  return errors;
};

// ==========================================
// SERVICE ID VALIDATION
// ==========================================

const validateServiceId = (req) => {
  const errors = [];
  const id = req.params.id;

  if (
    !id ||
    !/^[a-f\d]{24}$/i.test(id)
  ) {
    errors.push(
      "A valid service ID is required."
    );
  }

  return errors;
};

// ==========================================
// EXPORT VALIDATORS
// ==========================================

export {
  validateCreateService,
  validateUpdateService,
  validateServiceId,
};
