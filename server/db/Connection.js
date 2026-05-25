import mongoose from "mongoose";
import { config } from "../config/env.js";

export const Connection = async () => {
  try {
    await mongoose.connect(config.MONOGDB_URI);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error: ", error.message);
  }
};
