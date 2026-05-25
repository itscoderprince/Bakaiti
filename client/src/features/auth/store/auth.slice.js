import { createSlice } from "@reduxjs/toolkit";
import { loginUserThunk, signupUserThunk, logoutUserThunk, checkAuthThunk } from "./auth.thunks.js";

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
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
        state.user = action.payload.user;
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
        state.user = action.payload.user;
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
        state.isAuthenticated = true;
        // Adjust depending on what getProfile returns (e.g. action.payload or action.payload.user)
        state.user = action.payload.user || action.payload; 
      })
      .addCase(checkAuthThunk.rejected, (state) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;
