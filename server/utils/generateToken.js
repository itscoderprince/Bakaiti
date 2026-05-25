import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // prevents XSS attacks
    sameSite: "strict", // CSRF attacks protection
    secure: config.NODE_ENV !== "development",
  });

  return token;
};
