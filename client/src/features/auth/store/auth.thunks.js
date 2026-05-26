import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../api/auth.api.js";
import toast from "react-hot-toast";

/**
 * Thunk to handle user login.
 * On success: Returns user data and displays a success toast.
 * On failure: Returns rejected promise with error message and displays an error toast.
 */
export const loginUserThunk = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      toast.success(data.message || "Logged in successfully!");
      return data.data; 
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to login";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * Thunk to handle new user registration.
 * On success: Returns user data and displays a success toast.
 * On failure: Returns rejected promise with error message and displays an error toast.
 */
export const signupUserThunk = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authApi.signup(userData);
      toast.success(data.message || "Account created successfully!");
      return data.data; 
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to create account";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * Thunk to handle user logout.
 * Clears the HTTP-only cookie on the server and displays a success toast.
 */
export const logoutUserThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.logout();
      toast.success(data.message || "Logged out successfully!");
      return data; 
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to log out";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * Thunk to verify user session on initial app load.
 * Silent failure (no toast) if the user is simply not logged in.
 * Helps persist authentication state across page reloads.
 */
export const checkAuthThunk = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.getProfile();
      return data.data; // Should return { user }
    } catch (error) {
      return rejectWithValue("Not authenticated");

    }
  }
);

/**
 * Thunk to fetch all other available users for chat contacts.
 * Typically dispatched after a successful login or initial auth check.
 */
export const getOtherUsersThunk = createAsyncThunk(
  "auth/getOtherUsers",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.getOtherUsers();
      return data.data; // Should return the array of other users
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch users";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * Thunk to request a password reset email/link.
 */
export const forgotPasswordThunk = createAsyncThunk(
  "auth/forgotPassword",
  async (emailData, { rejectWithValue }) => {
    try {
      const data = await authApi.forgotPassword(emailData);
      toast.success(data.message || "Reset link dispatched!");
      return data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to request reset";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * Thunk to reset password using token.
 */
export const resetPasswordThunk = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const data = await authApi.resetPassword({ token, password, confirmPassword });
      toast.success(data.message || "Password reset completed successfully!");
      return data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to reset password";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * Thunk to change password for logged-in user.
 */
export const changePasswordThunk = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const data = await authApi.changePassword(passwordData);
      toast.success(data.message || "Password updated successfully!");
      return data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to change password";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);
