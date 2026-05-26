import { createSlice } from "@reduxjs/toolkit";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api/v1", "").replace(/\/$/, "")
  : "http://localhost:3500";

// Store socket instance outside Redux state to prevent Immer proxying/freezing issues.
let socketInstance = null;

export const getSocket = () => socketInstance;

const initialState = {
  isConnected: false,
  onlineUsers: [],
  typingUsers: {}, // { [userId]: boolean }
};

const shocketSlice = createSlice({
  name: "shocket",
  initialState,
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setTyping: (state, action) => {
      const { userId, isTyping } = action.payload;
      if (isTyping) {
        state.typingUsers[userId] = true;
      } else {
        delete state.typingUsers[userId];
      }
    },

    connectSocket: (state, action) => {
      const { userId } = action.payload;

      if (socketInstance?.connected) return;

      if (socketInstance) {
        socketInstance.disconnect();
      }

      socketInstance = io(BASE_URL, {
        query: {
          userId,
        },
        transports: ["websocket"],
      });

      state.isConnected = true;
    },
    disconnectSocket: (state) => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      state.isConnected = false;
      state.onlineUsers = [];
    },
  },
});

export const { setOnlineUsers, connectSocket, disconnectSocket, setTyping } =
  shocketSlice.actions;
export default shocketSlice.reducer;
