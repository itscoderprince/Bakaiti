import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/store/auth.slice.js";
import messageReducer from "../features/messages/store/message.slice.js";
import shocketReducer from "../features/shocket/store/shocket.slice.js";
import postReducer from "../features/posts/store/post.slice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messageReducer,
    shocket: shocketReducer,
    posts: postReducer,
  },
});

// ─── CRIT-3: Debounced localStorage sync for lastMessageTimes ────────────────
// Reducers (message.slice.js) no longer call localStorage.setItem() directly
// because that is a synchronous, blocking main-thread operation that fires on
// every incoming socket message. Instead, we batch writes here to at most once
// per 500ms using a store subscriber — completely off the hot path.

let _lmtSaveTimer = null;
store.subscribe(() => {
  clearTimeout(_lmtSaveTimer);
  _lmtSaveTimer = setTimeout(() => {
    try {
      const times = store.getState().messages.lastMessageTimes;
      localStorage.setItem("last_message_times", JSON.stringify(times));
    } catch (_) {
      // Quota exceeded or private browsing — fail silently
    }
  }, 500);
});
