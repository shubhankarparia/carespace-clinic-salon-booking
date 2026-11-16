
/**
 * Reusable request validation middleware.
 *
 * @param {Function|Function[]} validators
 * @returns {Function}
 */

const validateMiddleware = (validators = []) => {
  const validationFunctions = Array.isArray(validators)
    ? validators
    : [validators];

  return async (req, res, next) => {
    try {
      const errors = [];

      for (const validator of validationFunctions) {
        if (typeof validator !== "function") {
          throw new Error(
            "Invalid validator. Expected a validation function."
          );
        }

        const result = await validator(req);

        if (!result) {
          continue;
        }

        if (Array.isArray(result)) {
          errors.push(...result.filter(Boolean));
        } else {
          errors.push(result);
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Request validation failed.",
          errors,
        });
      }

      next();

    } catch (error) {
      next(error);
    }
  };
};

// ==========================================
// COMMON VALIDATION HELPERS
// ==========================================

const requiredFields = (fields = [], source = "body") => {
  return (req) => {
    const data = req[source] || {};

    return fields
      .filter((field) => {
        const value = data[field];

        return (
          value === undefined ||
          value === null ||
          (typeof value === "string" && !value.trim())
        );
      })
      .map((field) => `${field} is required.`);
  };
};

const validateEmail = (field = "email", source = "body") => {
  return (req) => {
    const value = req[source]?.[field];

    if (!value) {
      return null;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(String(value).trim())
      ? null
      : `${field} must be a valid email address.`;
  };
};

const validatePhone = (field = "phone", source = "body") => {
  return (req) => {
    const value = req[source]?.[field];

    if (!value) {
      return null;
    }

    const phone = String(value).replace(/[\s\-+()]/g, "");

    return /^\d{10,15}$/.test(phone)
      ? null
      : `${field} must contain a valid phone number.`;
  };
};

const validateObjectId = (field = "id", source = "params") => {
  return (req) => {
    const value = req[source]?.[field];

    if (!value) {
      return `${field} is required.`;
    }

    return /^[0-9a-fA-F]{24}$/.test(String(value))
      ? null
      : `${field} must be a valid ID.`;
  };
};

// ==========================================
// EXPORTS
// ==========================================

export {
  requiredFields,
  validateEmail,
  validatePhone,
  validateObjectId,
};

export default validateMiddleware;
