import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

/**
 * Generates a JWT token and attaches it as an HTTP-only cookie.
 *
 * Security notes:
 * - httpOnly: JS cannot read this cookie, blocking XSS token theft.
 * - sameSite: "strict" blocks Cross-Site Request Forgery (CSRF).
 * - secure: only sent over HTTPS in production.
 * - maxAge: driven by COOKIE_EXPIRES env var (days → milliseconds).
 */
export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES,
  });

  const isProduction = config.NODE_ENV === "production";

  res.cookie("jwt", token, {
    maxAge: config.COOKIE_EXPIRES * 24 * 60 * 60 * 1000, // days → ms
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });

  return token;
};
