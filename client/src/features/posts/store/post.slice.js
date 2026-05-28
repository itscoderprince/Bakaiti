import { createSlice } from "@reduxjs/toolkit";
import {
  getPostsThunk,
  createPostThunk,
  likePostThunk,
  commentPostThunk,
} from "./post.thunks.js";

const initialState = {
  posts: [],
  isPostsLoading: false,
  isUploadingPost: false,
  error: null,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPosts: (state) => {
      state.posts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // getPosts
      .addCase(getPostsThunk.pending, (state) => {
        state.isPostsLoading = true;
        state.error = null;
      })
      .addCase(getPostsThunk.fulfilled, (state, action) => {
        state.isPostsLoading = false;
        state.posts = action.payload || [];
      })
      .addCase(getPostsThunk.rejected, (state, action) => {
        state.isPostsLoading = false;
        state.error = action.payload;
      })

      // createPost
      .addCase(createPostThunk.pending, (state) => {
        state.isUploadingPost = true;
      })
      .addCase(createPostThunk.fulfilled, (state, action) => {
        state.isUploadingPost = false;
        if (action.payload) {
          state.posts.unshift(action.payload); // Add new post to the top of the feed
        }
      })
      .addCase(createPostThunk.rejected, (state) => {
        state.isUploadingPost = false;
      })

      // likePost
      .addCase(likePostThunk.fulfilled, (state, action) => {
        const { postId, likes } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.likes = likes;
        }
      })

      // commentPost
      .addCase(commentPostThunk.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.comments = comments;
        }
      });
  },
});

export const { clearPosts } = postSlice.actions;
export default postSlice.reducer;
