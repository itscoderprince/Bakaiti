import express from "express";
import {
  register,
  login,
  getProfile,
  logout,
  getOtherUsers,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "../schemas/auth.schema.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", isAuthenticated, logout);
router.get("/profile", isAuthenticated, getProfile);
router.get("/", isAuthenticated, getOtherUsers);

// Recovery & password management routes
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);
router.post("/change-password", isAuthenticated, validate(changePasswordSchema), changePassword);
router.put("/update-profile", isAuthenticated, validate(updateProfileSchema), updateProfile);

export default router;