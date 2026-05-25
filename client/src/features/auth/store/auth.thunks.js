import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../api/auth.api.js";
import toast from "react-hot-toast";

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
