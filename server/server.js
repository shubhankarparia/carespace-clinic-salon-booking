
import "dotenv/config";

import http from "node:http";
import mongoose from "mongoose";

import app from "./app.js";
import connectDB from "./config/db.js";

// ==========================================
// SERVER CONFIGURATION
// ==========================================

const PORT = Number(process.env.PORT) || 5001;
const HOST = process.env.HOST || "0.0.0.0";
const NODE_ENV = process.env.NODE_ENV || "development";

let server;
let isShuttingDown = false;

// ==========================================
// START CARESPACE SERVER
// ==========================================

const startServer = async () => {
  try {
    // 1. Validate port
    if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
      throw new Error("Invalid PORT configuration in .env file.");
    }

    // 2. Connect to MongoDB before starting HTTP server
    console.log("\nConnecting to MongoDB...");

    await connectDB();

    // 3. Create HTTP server
    server = http.createServer(app);

    // 4. Handle HTTP server errors
    server.on("error", (error) => {
      console.error("\nHTTP Server Error:", error.message);

      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use.`);
        console.error("Stop the existing process or change PORT in .env.");
      }

      process.exitCode = 1;

      void shutdownServer("SERVER_ERROR");
    });

    // 5. Start listening
    server.listen(PORT, HOST, () => {
      console.log("");
      console.log("======================================");
      console.log("       CARESPACE BACKEND SERVER       ");
      console.log("======================================");
      console.log(`Environment : ${NODE_ENV}`);
      console.log(`Host        : ${HOST}`);
      console.log(`Port        : ${PORT}`);
      console.log(`API URL     : http://localhost:${PORT}`);
      console.log(`Health URL  : http://localhost:${PORT}/api/health`);
      console.log(
        `Database    : ${
          mongoose.connection.readyState === 1
            ? "Connected"
            : "Disconnected"
        }`
      );
      console.log("Status      : Running");
      console.log("======================================");
      console.log("");
    });

  } catch (error) {
    console.error("\n======================================");
    console.error("   CARESPACE SERVER STARTUP FAILED    ");
    console.error("======================================");
    console.error(error.message);
    console.error("======================================\n");

    process.exitCode = 1;

    await shutdownServer("STARTUP_ERROR");
  }
};

// ==========================================
// GRACEFUL SERVER SHUTDOWN
// ==========================================

const shutdownServer = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`\n${signal} received.`);
  console.log("Shutting down CareSpace server...");

  try {
    // Stop accepting new HTTP connections
    if (server && server.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      console.log("HTTP server closed.");
    }

    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    }

    console.log("CareSpace shutdown completed.");

    process.exit(process.exitCode || 0);

  } catch (error) {
    console.error("Shutdown error:", error.message);
    process.exit(1);
  }
};

// ==========================================
// PROCESS SIGNAL HANDLERS
// ==========================================

process.on("SIGINT", () => {
  void shutdownServer("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdownServer("SIGTERM");
});

// ==========================================
// UNHANDLED ERROR HANDLERS
// ==========================================

process.on("unhandledRejection", (reason) => {
  console.error("\nUnhandled Promise Rejection:");

  console.error(
    reason instanceof Error ? reason.stack : reason
  );

  process.exitCode = 1;

  void shutdownServer("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (error) => {
  console.error("\nUncaught Exception:");
  console.error(error.stack || error.message);

  process.exitCode = 1;

  void shutdownServer("UNCAUGHT_EXCEPTION");
});

// ==========================================
// START APPLICATION
// ==========================================

void startServer();
