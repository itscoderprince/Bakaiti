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
 */
const emitToReceiver = (receiverId, eventName, senderId) => {
  const receiverSocketId = userSocketMap[receiverId];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit(eventName, senderId);
  }
};

// ─── Debounced Online Users Broadcast ────────────────────────────────────────
// Batches rapid connect/disconnect events so we don't flood ALL clients with
// a new online-list payload on every individual socket event (MED-9).

let _broadcastTimer = null;
const broadcastOnlineUsers = () => {
  clearTimeout(_broadcastTimer);
  _broadcastTimer = setTimeout(() => {
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }, 200);
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

    // CRIT-5: Use distinct() to get sender IDs BEFORE the bulk-update so we
    // avoid a second full-table read after the write (old code: updateMany → find).
    // Now: distinct → updateMany  (two queries instead of three, no re-read).
    (async () => {
      try {
        const senderIds = await Message.distinct("senderId", {
          receiverId: userId,
          status: "sent",
        });

        if (senderIds.length > 0) {
          await Message.updateMany(
            { receiverId: userId, status: "sent" },
            { $set: { status: "delivered" } },
          );

          senderIds.forEach((senderId) => {
            const senderSocketId = userSocketMap[senderId.toString()];
            if (senderSocketId) {
              io.to(senderSocketId).emit("messagesDelivered", {
                receiverId: userId,
              });
            }
          });
        }
      } catch (err) {
        console.error(
          "[Socket] Error handling sent-to-delivered on connect:",
          err,
        );
      }
    })();
  }

  // Broadcast updated online user list — debounced to avoid broadcast storm
  broadcastOnlineUsers();

  // ── Typing indicators ────────────────────────────────────────────────────
  socket.on("typing", (receiverId) =>
    emitToReceiver(receiverId, "typing", userId),
  );
  socket.on("stopTyping", (receiverId) =>
    emitToReceiver(receiverId, "stopTyping", userId),
  );

  // ── Active Chat / Room Ticks ─────────────────────────────────────────────
  socket.on("joinChat", async ({ activeChatId }) => {
    socket.activeChatId = activeChatId;

    try {
      await Message.updateMany(
        { senderId: activeChatId, receiverId: userId, status: { $ne: "read" } },
        { $set: { status: "read" } },
      );

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
  socket.on("disconnect", () => {
    if (!userId) return; // guard: never registered, nothing to clean up

    delete userSocketMap[userId];
    if (config.NODE_ENV === "development") {
      console.log(`[Socket] disconnected: userId=${userId}`);
    }

    const lastSeenTime = new Date();

    // CRIT-4: Fire-and-forget with a timeout guard — do NOT await here.
    // Awaiting inside a disconnect handler blocks the socket event loop for
    // every disconnection; if MongoDB is slow this causes cascading delays.
    User.findByIdAndUpdate(
      userId,
      { lastSeen: lastSeenTime },
      { maxTimeMS: 3000 },
    ).catch((err) =>
      console.error("[Socket] Failed to persist lastSeen:", err.message),
    );

    // Broadcast updated lists to all remaining clients (debounced)
    broadcastOnlineUsers();
    io.emit("userLastSeenUpdate", {
      userId,
      lastSeen: lastSeenTime.toISOString(),
    });
  });
});

// ─── Exports ─────────────────────────────────────────────────────────────────

export { app, io, server };
