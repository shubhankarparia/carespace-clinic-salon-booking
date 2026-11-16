
import "dotenv/config";
import mongoose from "mongoose";

// ==========================================
// MONGODB CONFIGURATION
// ==========================================

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    // Check MongoDB URI
    if (!mongoURI || !mongoURI.trim()) {
      throw new Error(
        "MONGODB_URI is missing in the server/.env file."
      );
    }

    // Avoid unnecessary reconnection
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB is already connected.");

      return mongoose.connection;
    }

    console.log("\nConnecting to MongoDB...");

    // ==========================================
    // CONNECT TO MONGODB
    // ==========================================

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      autoIndex: process.env.NODE_ENV !== "production",
    });

    // ==========================================
    // CONNECTION SUCCESS
    // ==========================================

    console.log("");
    console.log("======================================");
    console.log("       MONGODB CONNECTION SUCCESS     ");
    console.log("======================================");
    console.log(
      `Host        : ${mongoose.connection.host}`
    );
    console.log(
      `Database    : ${mongoose.connection.name}`
    );
    console.log(
      `Ready State : ${mongoose.connection.readyState}`
    );
    console.log("Status      : Connected");
    console.log("======================================");
    console.log("");

    return mongoose.connection;

  } catch (error) {
    console.error("");
    console.error("======================================");
    console.error("       MONGODB CONNECTION FAILED      ");
    console.error("======================================");
    console.error(error.message);
    console.error("======================================");
    console.error("");

    throw error;
  }
};

// ==========================================
// MONGODB CONNECTION EVENTS
// ==========================================

mongoose.connection.on("connected", () => {
  console.log("MongoDB event: Connected.");
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB event: Disconnected.");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB event: Reconnected.");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

// ==========================================
// EXPORT
// ==========================================

export default connectDB;
