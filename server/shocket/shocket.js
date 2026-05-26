import express from "express";
import http from "http";
import { Server } from "socket.io";
import { config } from "../config/env.js";
import User from "../models/user.model.js";

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
  }

  // Broadcast updated online user list to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ── Typing indicators ────────────────────────────────────────────────────
  socket.on("typing", (receiverId) => emitToReceiver(receiverId, "typing", userId));
  socket.on("stopTyping", (receiverId) => emitToReceiver(receiverId, "stopTyping", userId));

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
