import { createAsyncThunk } from "@reduxjs/toolkit";
import { messageApi } from "../api/message.api.js";
import toast from "react-hot-toast";

/**
 * Thunk to fetch all messages between the current user and the specified contact.
 */
export const getMessagesThunk = createAsyncThunk(
  "messages/getMessages",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await messageApi.getMessages(userId);
      // The backend returns an array if empty, or a conversation object containing .messages
      return Array.isArray(response.data) ? response.data : response.data.messages || [];
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch messages";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * Thunk to send a new message to the specified contact.
 */
export const sendMessageThunk = createAsyncThunk(
  "messages/sendMessage",
  async ({ receiverId, messageData }, { rejectWithValue }) => {
    try {
      const data = await messageApi.sendMessage(receiverId, messageData);
      return data.data; // The newly created message object
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to send message";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);
