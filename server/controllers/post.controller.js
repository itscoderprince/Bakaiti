import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Post from "../models/post.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// Create Post
export const createPost = asyncHandler(async (req, res, next) => {
  const { media, mediaType, caption } = req.body;
  const owner = req.user._id;

  if (!media) {
    return next(new AppError(400, "Media content is required"));
  }

  if (!mediaType || !["image", "video"].includes(mediaType)) {
    return next(new AppError(400, "Invalid media type (must be image or video)"));
  }

  // Upload to Cloudinary (will fall back to base64 if not configured)
  // For images, limit width to 1080px to optimize file sizes and loading speed.
  const uploadOptions = mediaType === "image"
    ? {
        transformation: [
          { width: 1080, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" }
        ]
      }
    : {
        transformation: [
          { quality: "auto" },
          { fetch_format: "auto" }
        ]
      };

  const mediaUrl = await uploadToCloudinary(media, mediaType, uploadOptions);

  const post = await Post.create({
    owner,
    media: mediaUrl,
    mediaType,
    caption: caption || "",
  });

  // Populate owner before returning
  const populatedPost = await Post.findById(post._id)
    .populate("owner", "fullname username profilePic")
    .lean();

  res
    .status(201)
    .json(new ApiResponse(201, populatedPost, "Post created successfully"));
});

// Get Feed Posts
export const getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find()
    .populate("owner", "fullname username profilePic")
    .populate("comments.owner", "fullname username profilePic")
    .sort({ createdAt: -1 })
    .lean();

  res
    .status(200)
    .json(new ApiResponse(200, posts, "Posts retrieved successfully"));
});

// Like / Unlike Post
export const likePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError(404, "Post not found"));
  }

  const likeIndex = post.likes.indexOf(userId);

  if (likeIndex > -1) {
    // Already liked, so unlike
    post.likes.splice(likeIndex, 1);
  } else {
    // Like
    post.likes.push(userId);
  }

  await post.save();

  res
    .status(200)
    .json(new ApiResponse(200, post.likes, "Likes updated successfully"));
});

// Comment on Post
export const commentPost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  if (!text || !text.trim()) {
    return next(new AppError(400, "Comment text is required"));
  }

  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError(404, "Post not found"));
  }

  post.comments.push({
    owner: userId,
    text,
  });

  await post.save();

  // Retrieve the updated comments list populated
  const updatedPost = await Post.findById(postId)
    .populate("comments.owner", "fullname username profilePic")
    .lean();

  res
    .status(201)
    .json(new ApiResponse(201, updatedPost.comments, "Comment added successfully"));
});
