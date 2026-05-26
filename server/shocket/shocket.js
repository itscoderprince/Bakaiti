import express from "express";
import http from "http";
import { Server } from "socket.io";
import { config } from "../config/env.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

// ─── App & Server Setup ──────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.CLIENT_URL.replace(/\/$/, ""), // strip trailing slash
    credentials: true,
  },
});

// ─── Online User Tracking ────────────────────────────────────────────────────

/**
 * In-memory map of { userId → socketId }.
 * Used to route messages and typing events to the correct socket.
 */
const userSocketMap = {};

/** Returns the active socket ID for a given user, or undefined if offline. */
export const getReceiverSocketId = (userId) => userSocketMap[userId];

// ─── DRY Helper ──────────────────────────────────────────────────────────────

/**
 * Forwards a typing event (typing / stopTyping) to the target receiver's socket.
 * Extracted here so both handlers share the same lookup logic (DRY principle).
 *
 * @param {string} receiverId  - The _id of the user who should receive the event.
 * @param {string} eventName   - "typing" or "stopTyping"
 * @param {string} senderId    - The _id of the user who is typing.
 */
const emitToReceiver = (receiverId, eventName, senderId) => {
  const receiverSocketId = userSocketMap[receiverId];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit(eventName, senderId);
  }
};

// ─── Socket Connection Handler ───────────────────────────────────────────────

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  // Register user only when they provide a valid userId
  if (userId) {
    userSocketMap[userId] = socket.id;
    if (config.NODE_ENV === "development") {
      console.log(`[Socket] connected: userId=${userId} socketId=${socket.id}`);
    }

    // Auto-update all pending "sent" messages to "delivered" status
    (async () => {
      try {
        await Message.updateMany(
          { receiverId: userId, status: "sent" },
          { $set: { status: "delivered" } }
        );

        // Find senders to notify that their messages reached this user
        const deliveredMessages = await Message.find({ receiverId: userId, status: "delivered" });
        const sendersToNotify = [...new Set(deliveredMessages.map((m) => m.senderId.toString()))];
        
        sendersToNotify.forEach((senderId) => {
          const senderSocketId = userSocketMap[senderId];
          if (senderSocketId) {
            io.to(senderSocketId).emit("messagesDelivered", { receiverId: userId });
          }
        });
      } catch (err) {
        console.error("[Socket] Error handling sent-to-delivered updates on connect:", err);
      }
    })();
  }

  // Broadcast updated online user list to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ── Typing indicators ────────────────────────────────────────────────────
  socket.on("typing", (receiverId) => emitToReceiver(receiverId, "typing", userId));
  socket.on("stopTyping", (receiverId) => emitToReceiver(receiverId, "stopTyping", userId));

  // ── Active Chat / Room Ticks ─────────────────────────────────────────────
  socket.on("joinChat", async ({ activeChatId }) => {
    socket.activeChatId = activeChatId;

    try {
      // Mark all messages from activeChatId to the current user (userId) as read in DB
      await Message.updateMany(
        { senderId: activeChatId, receiverId: userId, status: { $ne: "read" } },
        { $set: { status: "read" } }
      );

      // Notify the sender that their messages have been read
      const senderSocketId = userSocketMap[activeChatId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { readerId: userId });
      }
    } catch (err) {
      console.error("[Socket] Error in joinChat read update:", err);
    }
  });

  socket.on("leaveChat", () => {
    socket.activeChatId = null;
  });

  // ── Disconnect ───────────────────────────────────────────────────────────
  socket.on("disconnect", async () => {
    if (!userId) return; // guard: never registered, nothing to clean up

    delete userSocketMap[userId];
    if (config.NODE_ENV === "development") {
      console.log(`[Socket] disconnected: userId=${userId}`);
    }

    const lastSeenTime = new Date();

    // Persist lastSeen in DB so the timestamp survives page reloads
    try {
      await User.findByIdAndUpdate(userId, { lastSeen: lastSeenTime });
    } catch (err) {
      console.error("[Socket] Failed to persist lastSeen:", err.message);
    }

    // Broadcast updated lists to all remaining clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    io.emit("userLastSeenUpdate", { userId, lastSeen: lastSeenTime.toISOString() });
  });
});

// ─── Exports ─────────────────────────────────────────────────────────────────

export { app, io, server };
