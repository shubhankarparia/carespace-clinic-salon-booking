
import "dotenv/config";

import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

// Rate limiter
import { apiRateLimiter } from "./middleware/rateLimitMiddleware.js";

// Error handling middleware
import {
  notFoundMiddleware,
  errorMiddleware,
} from "./middleware/errorMiddleware.js";


// ==========================================
// CONFIGURATION
// ==========================================

import corsMiddleware from "./config/cors.js";

// ==========================================
// ROUTE IMPORTS
// ==========================================

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

// ==========================================
// EXPRESS APP
// ==========================================

const app = express();

app.disable("x-powered-by");

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

app.use(helmet());

app.use(corsMiddleware);

// ==========================================
// REQUEST LOGGING
// ==========================================

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ==========================================
// REQUEST BODY PARSING
// ==========================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ==========================================
// API RATE LIMITING
// ==========================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to CareSpace API",
    application: "CareSpace Clinic & Salon Booking System",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: databaseConnected
      ? "CareSpace API is running successfully"
      : "CareSpace API is running, but database is disconnected",
    database: databaseConnected ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/contact", contactRoutes);
// ==========================================
// 404 NOT FOUND HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("API Error:", err);

  // CORS errors
  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: "Access denied by CORS policy",
    });
  }

  // Invalid JSON
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID",
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Duplicate MongoDB key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];

    return res.status(409).json({
      success: false,
      message: field
        ? `${field} already exists`
        : "Duplicate record already exists",
    });
  }

  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" && statusCode >= 500
        ? "Internal server error"
        : err.message || "Something went wrong",
  });
});

// ==========================================
// EXPORT APP
// ==========================================

export default app;
