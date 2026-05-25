import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  MONOGDB_URI: z.string().url("MongoDB URI must be a valid URL"),
  JWT_SECRET: z.string().min(10, "JWT secret must be at least 10 characters long"),
  JWT_EXPIRE: z.string().default("7d"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error("❌ Invalid environment variables:", envVars.error.format());
  process.exit(1);
}

export const config = envVars.data;
