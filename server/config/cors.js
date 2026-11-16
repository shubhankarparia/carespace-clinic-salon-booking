
import "dotenv/config";
import cors from "cors";

// ==========================================
// ALLOWED FRONTEND ORIGINS
// ==========================================

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const environmentOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([
    ...defaultOrigins,
    ...environmentOrigins,
  ]),
];

// ==========================================
// CORS OPTIONS
// ==========================================

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without Origin headers.
    // Example: Postman, server-to-server requests.
    if (!origin) {
      return callback(null, true);
    }

    // Normalize origin
    const normalizedOrigin = origin.replace(/\/+$/, "");

    // Check allowed frontend origins
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // Block unauthorized origins
    return callback(
      new Error(`CORS blocked this origin: ${origin}`)
    );
  },

  // ==========================================
  // ALLOWED HTTP METHODS
  // ==========================================

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  // ==========================================
  // ALLOWED REQUEST HEADERS
  // ==========================================

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],

  // ==========================================
  // RESPONSE HEADERS
  // ==========================================

  exposedHeaders: [
    "Content-Length",
    "Content-Type",
  ],

  // ==========================================
  // CREDENTIALS
  // ==========================================

  credentials: true,

  // ==========================================
  // PREFLIGHT OPTIONS
  // ==========================================

  optionsSuccessStatus: 204,

  preflightContinue: false,

  // ==========================================
  // CACHE PREFLIGHT RESPONSE
  // ==========================================

  maxAge: 86400,
};

// ==========================================
// CREATE CORS MIDDLEWARE
// ==========================================

const corsMiddleware = cors(corsOptions);

// ==========================================
// EXPORTS
// ==========================================

export {
  allowedOrigins,
  corsOptions,
};

export default corsMiddleware;
