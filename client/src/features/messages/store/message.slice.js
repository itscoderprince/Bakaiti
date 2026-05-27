import { createSlice } from "@reduxjs/toolkit";
import { getMessagesThunk, sendMessageThunk } from "./message.thunks.js";

// Load last message timestamps from localStorage to persist sorting across page refreshes
const loadLastMessageTimes = () => {
  try {
    const data = localStorage.getItem("last_message_times");
    return data ? JSON.parse(data) : {};
  } catch (err) {
    return {};
  }
};

// NOTE: Writing to localStorage is done by a debounced store subscriber in store.js
// (CRIT-3). DO NOT call localStorage.setItem() inside reducers — it blocks the
// main thread synchronously on every dispatched action.

/**
 * Initial state for the messages slice.
 */
const initialState = {
  messages: [],
  isMessagesLoading: false,
  isSendingMessage: false,
  error: null,
  lastMessageTimes: loadLastMessageTimes(),
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    // Reducer for clearing messages when changing chats
    clearMessages: (state) => {
      state.messages = [];
    },
    // Append incoming socket message — localStorage write handled by store subscriber
    appendMessage: (state, action) => {
      const message = action.payload;
      state.messages.push(message);

      // Update last message time in Redux state only
      const contactId = message.senderId;
      const timestamp = message.createdAt || new Date().toISOString();
      state.lastMessageTimes[contactId] = timestamp;
      // ← No saveLastMessageTimes() here; debounced subscriber handles persistence
    },
    // Action to update last message time for background incoming messages
    updateLastMessageTime: (state, action) => {
      const { contactId, timestamp } = action.payload;
      state.lastMessageTimes[contactId] = timestamp;
      // ← No saveLastMessageTimes() here; debounced subscriber handles persistence
    },
    // Action to mark sent messages in active conversation as read
    markMessagesAsRead: (state, action) => {
      const { readerId } = action.payload;
      state.messages.forEach((msg) => {
        if (msg.receiverId === readerId && msg.status !== "read") {
          msg.status = "read";
        }
      });
    },
    // Action to mark sent messages in active conversation as delivered
    markMessagesAsDelivered: (state, action) => {
      const { receiverId } = action.payload;
      state.messages.forEach((msg) => {
        if (msg.receiverId === receiverId && msg.status === "sent") {
          msg.status = "delivered";
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // getMessages
      .addCase(getMessagesThunk.pending, (state) => {
        // MED-5: Clear previous conversation's messages right here, at the start
        // of a new fetch, instead of in a useEffect cleanup function.
        // This eliminates the brief empty-flash caused by clearMessages() firing
        // before isMessagesLoading becomes true.
        state.messages = [];
        state.isMessagesLoading = true;
        state.error = null;
      })
      .addCase(getMessagesThunk.fulfilled, (state, action) => {
        state.isMessagesLoading = false;
        state.messages = action.payload || [];
      })
      .addCase(getMessagesThunk.rejected, (state, action) => {
        state.isMessagesLoading = false;
        state.error = action.payload;
      })

      // sendMessage
      .addCase(sendMessageThunk.pending, (state) => {
        state.isSendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        state.isSendingMessage = false;
        // Automatically append the newly sent message to the chat
        if (action.payload) {
          state.messages.push(action.payload);

          // Update last message time for the receiver of this sent message
          const contactId = action.payload.receiverId;
          const timestamp = action.payload.createdAt || new Date().toISOString();
          state.lastMessageTimes[contactId] = timestamp;
          // ← No saveLastMessageTimes() here; debounced subscriber handles persistence
        }
      })
      .addCase(sendMessageThunk.rejected, (state, action) => {
        state.isSendingMessage = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearMessages,
  appendMessage,
  updateLastMessageTime,
  markMessagesAsRead,
  markMessagesAsDelivered,
} = messageSlice.actions;
export default messageSlice.reducer;
