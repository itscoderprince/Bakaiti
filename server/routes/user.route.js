import express from "express";
import { register, login, getProfile, logout, getOtherUsers } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { signupSchema, loginSchema } from "../schemas/auth.schema.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", isAuthenticated, logout);
router.get("/profile", isAuthenticated, getProfile);
router.get("/", isAuthenticated, getOtherUsers);

export default router;