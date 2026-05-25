import { createSlice } from "@reduxjs/toolkit";
import { loginUserThunk } from "./user.Thunk";
// import { loginUserThunk } from "./user.thunk";

const initialState = {
  isAuthenticated: false,
  screenLoading: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loginUserThunk.fulfilled, (state, action) => {
      console.log("Fulfilled");
    });
    builder.addCase(loginUserThunk.rejected, (state, action) => {
      console.log("Rejected");
    });
    builder.addCase(loginUserThunk.pending, (state, action) => {
      console.log("Pending");
    });
  },
});

export const { loginUser, logoutUser } = userSlice.actions;

export default userSlice.reducer;
