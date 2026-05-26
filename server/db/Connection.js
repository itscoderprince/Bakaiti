import mongoose from "mongoose";
import { config } from "../config/env.js";

/**
 * Connects to MongoDB using the URI from environment variables.
 *
 * Production approach:
 * - On failure, we log the error and call process.exit(1) so the
 *   process manager (e.g. PM2, Docker) can restart the app automatically.
 * - maxPoolSize: allows up to 10 concurrent DB operations (good for chat apps).
 * - serverSelectionTimeoutMS: fail fast if DB is unreachable instead of hanging.
 */
export const Connection = async () => {
  try {
    await mongoose.connect(config.MONOGDB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Crash fast so the process manager can restart cleanly
  }
};
