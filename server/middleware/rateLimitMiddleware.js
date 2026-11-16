
import rateLimit from "express-rate-limit";

// ==========================================
// GENERAL API RATE LIMITER
// ==========================================

const apiRateLimiter = rateLimit({
  windowMs:
    Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,

  limit:
    Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  skip: () => process.env.NODE_ENV === "test",

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// ==========================================
// AUTHENTICATION RATE LIMITER
// ==========================================

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 10,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  skipSuccessfulRequests: true,

  skip: () => process.env.NODE_ENV === "test",

  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

// ==========================================
// PASSWORD RESET RATE LIMITER
// ==========================================

const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,

  limit: 5,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  skipSuccessfulRequests: true,

  skip: () => process.env.NODE_ENV === "test",

  message: {
    success: false,
    message:
      "Too many password reset requests. Please try again later.",
  },
});

// ==========================================
// EXPORTS
// ==========================================

export {
  apiRateLimiter,
  authRateLimiter,
  passwordResetRateLimiter,
};

export default apiRateLimiter;
