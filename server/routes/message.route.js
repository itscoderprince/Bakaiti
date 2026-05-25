import express from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { sendMessageSchema } from "../schemas/message.schema.js";

const router = express.Router();

router.get("/:userId", isAuthenticated, getMessages);
router.post("/send/:reciverId", isAuthenticated, validate(sendMessageSchema), sendMessage);

export default router;
