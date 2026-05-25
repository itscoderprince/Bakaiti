import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/user/user.Slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});
