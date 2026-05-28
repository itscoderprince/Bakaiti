import express from "express";
import {
  createPost,
  getPosts,
  likePost,
  commentPost,
} from "../controllers/post.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", isAuthenticated, getPosts);
router.post("/", isAuthenticated, createPost);
router.post("/:postId/like", isAuthenticated, likePost);
router.post("/:postId/comment", isAuthenticated, commentPost);

export default router;
