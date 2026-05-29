import { createSlice } from "@reduxjs/toolkit";
import { loginUserThunk, signupUserThunk, logoutUserThunk, checkAuthThunk, getOtherUsersThunk, updateProfileThunk } from "./auth.thunks.js";

/**
 * Initial state configuration for the authentication slice.
 * @property {Object|null} user - The currently authenticated user's profile data.
 * @property {Array} otherUsers - List of other registered users (contacts).
 * @property {boolean} isAuthenticated - Flag indicating if a valid session exists.
 * @property {boolean} isLoading - Flag for tracking generic API request loading states.
 * @property {boolean} isCheckingAuth - Flag specifically for the initial session hydration check.
 * @property {string|null} error - Stores any error messages from failed thunk operations.
 */
const initialState = {
  user: null,
  otherUsers: [],
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
  profileUploadProgress: 0,
};

/**
 * Authentication Slice
 * Manages global state for user sessions, profile data, and contact lists.
 */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Synchronous logout fallback.
     * Use logoutUserThunk for standard flow to ensure backend cookies are cleared.
     */
    logoutUser: (state) => {
      state.user = null;
      state.otherUsers = [];
      state.isAuthenticated = false;
      state.error = null;
    },
    // Real-time listener updates lastSeen timestamp directly in global otherUsers contacts array
    updateUserPresence: (state, action) => {
      const { userId, lastSeen } = action.payload;
      const contact = state.otherUsers.find((u) => u._id === userId);
      if (contact) {
        contact.lastSeen = lastSeen;
      }
    },
    // Real-time badge increment for unread messages
    incrementUnreadCount: (state, action) => {
      const { contactId } = action.payload;
      const contact = state.otherUsers.find((u) => u._id === contactId);
      if (contact) {
        contact.unreadCount = (contact.unreadCount || 0) + 1;
      }
    },
    // Reset unread badge when chat is active
    resetUnreadCount: (state, action) => {
      const { contactId } = action.payload;
      const contact = state.otherUsers.find((u) => u._id === contactId);
      if (contact) {
        contact.unreadCount = 0;
      }
    },
    setProfileUploadProgress: (state, action) => {
      state.profileUploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // For Login
      .addCase(loginUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user || null;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      //For Signup
      .addCase(signupUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user || null;
      })
      .addCase(signupUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // For Logout
      .addCase(logoutUserThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.otherUsers = [];
      })
      .addCase(logoutUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // For Check Auth
      .addCase(checkAuthThunk.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = !!action.payload;
        // Adjust depending on what getProfile returns (e.g. action.payload or action.payload.user)
        state.user = action.payload?.user || action.payload || null; 
      })
      .addCase(checkAuthThunk.rejected, (state) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = false;
        state.user = null;
        state.otherUsers = [];
      })

      // For Get Other Users
      .addCase(getOtherUsersThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOtherUsersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otherUsers = action.payload; // Payload should be the array of users
      })
      .addCase(getOtherUsersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // For Update Profile
      .addCase(updateProfileThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.profileUploadProgress = 0;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        console.log("[auth.slice] updateProfileThunk fulfilled. payload:", action.payload);
        state.isLoading = false;
        state.profileUploadProgress = 0;
        const nextUser = action.payload?.user || action.payload;
        if (nextUser) {
          state.user = {
            ...state.user,
            ...nextUser,
          };
          console.log("[auth.slice] state.user updated to:", state.user);
        }
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.profileUploadProgress = 0;
        state.error = action.payload;
      });
  },
});

export const {
  logoutUser,
  updateUserPresence,
  incrementUnreadCount,
  resetUnreadCount,
  setProfileUploadProgress,
} = authSlice.actions;
export default authSlice.reducer;
