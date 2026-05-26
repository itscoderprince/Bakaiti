import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

/**
 * Central environment variable validation using Zod.
 *
 * Production approach:
 * - All variables are declared here in one place (Single Source of Truth).
 * - If any required variable is missing or wrong, the app refuses to start.
 * - .coerce.number() handles string-typed env vars safely.
 *
 * NOTE: Your .env file uses JWT_EXPIRES (with S). The schema matches that.
 */
const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  MONOGDB_URI: z.string().url("MongoDB URI must be a valid URL"),

  CLIENT_URL: z.string().url("Client URL must be a valid URL"),

  JWT_SECRET: z.string().min(10, "JWT secret must be at least 10 characters"),
  JWT_EXPIRES: z.string().default("7d"),
  COOKIE_EXPIRES: z.coerce.number().default(2),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().optional(),
  SMTP_FROM_NAME: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:\n", parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
