import { createAsyncThunk } from "@reduxjs/toolkit";

// First, create the thunk
export const loginUserThunk = createAsyncThunk(
  "users/loginUserStatus",
  async () => {
    console.log("Hello i am async thunk...");
  },
);
