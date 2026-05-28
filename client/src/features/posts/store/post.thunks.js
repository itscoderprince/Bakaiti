import { createAsyncThunk } from "@reduxjs/toolkit";
import postApi from "../api/post.api.js";
import toast from "react-hot-toast";

export const getPostsThunk = createAsyncThunk(
  "posts/getPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await postApi.getPosts();
      return response.data; // Array of posts
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch posts";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  },
);

export const createPostThunk = createAsyncThunk(
  "posts/createPost",
  async (postData, { rejectWithValue }) => {
    try {
      const response = await postApi.createPost(postData);
      toast.success("Post uploaded successfully!");
      return response.data; // The new post object
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload post";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  },
);

export const likePostThunk = createAsyncThunk(
  "posts/likePost",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postApi.likePost(postId);
      return { postId, likes: response.data }; // response.data contains the new likes array
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update like";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  },
);

export const commentPostThunk = createAsyncThunk(
  "posts/commentPost",
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const response = await postApi.commentPost(postId, text);
      toast.success("Comment added!");
      return { postId, comments: response.data }; // response.data contains the updated comments array
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to add comment";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  },
);
