import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/store/auth.slice.js";
import messageReducer from "../features/messages/store/message.slice.js";
import shocketReducer from "../features/shocket/store/shocket.slice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messageReducer,
    shocket: shocketReducer,
  },
});
