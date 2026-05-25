import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import User from "../models/user.model.js";
import { config } from "../config/env.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // 1. Check for token in cookies OR authorization header
    let token = req.cookies?.jwt;
    
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError(401, "Not authorized, please login to access this route"));
    }

    // 2. Verify the token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // 3. Find the user from the decoded token ID
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new AppError(401, "User belonging to this token no longer exists"));
    }

    // 4. Attach user to the request object so next controllers can use it
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError(401, "Not authorized, token failed or expired"));
  }
};
