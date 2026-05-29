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
  postUploadProgress: 0,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPosts: (state) => {
      state.posts = [];
    },
    // Optimistic like toggle — flips the userId in the likes array immediately.
    // If the API call fails, this same action is dispatched again to revert.
    toggleLikeOptimistic: (state, action) => {
      const { postId, userId } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (!post) return;
      const idx = post.likes.indexOf(userId);
      if (idx > -1) {
        post.likes.splice(idx, 1);
      } else {
        post.likes.push(userId);
      }
    },
    setPostUploadProgress: (state, action) => {
      state.postUploadProgress = action.payload;
    },
    addCommentOptimistic: (state, action) => {
      const { postId, text, tempId, user } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post && user) {
        if (!post.comments) post.comments = [];
        post.comments.push({
          _id: tempId,
          text,
          owner: {
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            profilePic: user.profilePic,
          },
          createdAt: new Date().toISOString(),
        });
      }
    },
    removeCommentOptimistic: (state, action) => {
      const { postId, tempId } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post && post.comments) {
        post.comments = post.comments.filter((c) => c._id !== tempId);
      }
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
        state.postUploadProgress = 0;
      })
      .addCase(createPostThunk.fulfilled, (state, action) => {
        state.isUploadingPost = false;
        state.postUploadProgress = 0;
        if (action.payload) {
          state.posts.unshift(action.payload); // Add new post to the top of the feed
        }
      })
      .addCase(createPostThunk.rejected, (state) => {
        state.isUploadingPost = false;
        state.postUploadProgress = 0;
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
      })

      // Sync local posts/comments owner details immediately when the user updates their profile
      .addMatcher(
        (action) => action.type === "auth/updateProfile/fulfilled",
        (state, action) => {
          const updatedUser = action.payload?.user || action.payload;
          if (!updatedUser) return;

          state.posts.forEach((post) => {
            if (post.owner?._id === updatedUser._id) {
              post.owner = {
                ...post.owner,
                profilePic: updatedUser.profilePic,
                fullname: updatedUser.fullname,
                username: updatedUser.username,
              };
            }
            if (post.comments && Array.isArray(post.comments)) {
              post.comments.forEach((comment) => {
                if (comment.owner?._id === updatedUser._id) {
                  comment.owner = {
                    ...comment.owner,
                    profilePic: updatedUser.profilePic,
                    fullname: updatedUser.fullname,
                    username: updatedUser.username,
                  };
                }
              });
            }
          });
        }
      );
  },
});

export const {
  clearPosts,
  toggleLikeOptimistic,
  setPostUploadProgress,
  addCommentOptimistic,
  removeCommentOptimistic
} = postSlice.actions;
export default postSlice.reducer;
