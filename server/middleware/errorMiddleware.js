
const notFoundMiddleware = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  error.statusCode = 404;

  next(error);
};

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

const errorMiddleware = (err, req, res, next) => {
  console.error("\nAPI Error:", err);

  // CORS error
  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: "Access denied by CORS policy.",
    });
  }

  // Invalid JSON
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  // MongoDB invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID.",
    });
  }

  // MongoDB validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors || {}).map(
      (item) => item.message
    );

    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors,
    });
  }

  // Duplicate MongoDB record
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];

    return res.status(409).json({
      success: false,
      message: field
        ? `${field} already exists.`
        : "Duplicate record already exists.",
    });
  }

  // JWT errors
  if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }

  // Multer upload errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed.",
    });
  }

  // Determine HTTP status
  const statusCode = Number(err.statusCode || err.status) || 500;

  const safeStatusCode =
    statusCode >= 400 && statusCode <= 599 ? statusCode : 500;

  const isProduction = process.env.NODE_ENV === "production";

  return res.status(safeStatusCode).json({
    success: false,
    message:
      isProduction && safeStatusCode >= 500
        ? "Internal server error."
        : err.message || "Something went wrong.",
    ...(isProduction
      ? {}
      : { stack: err.stack }),
  });
};

export {
  notFoundMiddleware,
  errorMiddleware,
};

export default errorMiddleware;
