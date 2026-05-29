import { createAsyncThunk } from "@reduxjs/toolkit";
import postApi from "../api/post.api.js";
import toast from "react-hot-toast";

/**
 * Fetches all posts. Uses a condition guard to skip the network call if posts
 * are already loaded in the Redux store. Pass { force: true } to bypass.
 * This prevents triple-fetching when the user navigates between Feed/Reels/Profile.
 */
export const getPostsThunk = createAsyncThunk(
  "posts/getPosts",
  async (_args, { rejectWithValue }) => {
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
  {
    // Only skip if posts already loaded AND no explicit force refresh requested
    condition: (args, { getState }) => {
      if (args?.force) return true;
      const { posts } = getState();
      // Skip fetch if we already have posts cached
      if (posts.posts?.length > 0 && !posts.isPostsLoading) return false;
      return true;
    },
  }
);


export const createPostThunk = createAsyncThunk(
  "posts/createPost",
  async (postData, { dispatch, rejectWithValue }) => {
    try {
      const response = await postApi.createPost(postData, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          dispatch({
            type: "posts/setPostUploadProgress",
            payload: percentCompleted,
          });
        }
      });
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

/**
 * Like/unlike with optimistic update.
 * The UI flips instantly on click; the API call confirms it silently.
 * On failure, the optimistic toggle is rolled back.
 */
export const likePostThunk = createAsyncThunk(
  "posts/likePost",
  async ({ postId, userId }, { dispatch, rejectWithValue }) => {
    // Optimistically toggle before hitting the network
    dispatch({ type: "posts/toggleLikeOptimistic", payload: { postId, userId } });
    try {
      const response = await postApi.likePost(postId);
      // Reconcile with server truth (handles race conditions / multi-device)
      return { postId, likes: response.data };
    } catch (error) {
      // Roll back the optimistic toggle
      dispatch({ type: "posts/toggleLikeOptimistic", payload: { postId, userId } });
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
  async ({ postId, text }, { dispatch, getState, rejectWithValue }) => {
    const tempId = `temp-${Date.now()}`;
    const user = getState().auth?.user;

    // Optimistically add the comment to the feed
    dispatch({
      type: "posts/addCommentOptimistic",
      payload: { postId, text, tempId, user },
    });

    try {
      const response = await postApi.commentPost(postId, text);
      toast.success("Comment added!");
      return { postId, comments: response.data }; // response.data contains the updated comments array
    } catch (error) {
      // Rollback optimistic comment on failure
      dispatch({
        type: "posts/removeCommentOptimistic",
        payload: { postId, tempId },
      });
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to add comment";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  },
);
