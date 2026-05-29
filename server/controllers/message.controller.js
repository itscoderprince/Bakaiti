import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../shocket/shocket.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const sendMessage = asyncHandler(async (req, res, next) => {
  const senderId = req.user._id;
  const receiverId = req.params.reciverId;

  const { message, file, fileType, fileName, fileSize } = req.body;

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  // Determine initial status based on socket connection and active room
  const receiverSocketId = getReceiverSocketId(receiverId);
  let status = "sent";
  if (receiverSocketId) {
    status = "delivered";
    const receiverSocket = io.sockets.sockets.get(receiverSocketId);
    if (receiverSocket && receiverSocket.activeChatId === senderId.toString()) {
      status = "read";
    }
  }

  let fileUrl = "";
  if (file) {
    const resourceType =
      fileType === "image" || fileType === "video" ? fileType : "raw";
    // For raw documents/zips, skip image auto-transformations
    const uploadOptions = resourceType === "raw" ? { transformation: [] } : {};
    fileUrl = await uploadToCloudinary(file, resourceType, uploadOptions);
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    message: message || "",
    fileUrl,
    fileType,
    fileName,
    fileSize,
    status,
  });

  if (newMessage) {
    conversation.messages.push(newMessage._id);
  }

  // Save both in parallel
  await Promise.all([conversation.save(), newMessage.save()]);

  // SOCKET.IO implementation for real-time messaging
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  res
    .status(201)
    .json(new ApiResponse(201, newMessage, "Message sent successfully"));
});

export const getMessages = asyncHandler(async (req, res, next) => {
  const myId = req.user._id;
  const userToChatId = req.params.userId;
  const limit = parseInt(req.query.limit) || 30;
  const before = req.query.before;

  // Build query dynamically for pagination
  const messageQuery = {
    $or: [
      { senderId: myId, receiverId: userToChatId },
      { senderId: userToChatId, receiverId: myId },
    ],
  };

  if (before) {
    messageQuery.createdAt = { $lt: new Date(before) };
  }

  // CRIT-6: Run the status-update write and the message fetch concurrently.
  // Previously the write blocked the fetch, adding unnecessary latency to every
  // chat open. Now both happen in parallel and we respond as soon as both settle.
  //
  // MED-8: Query Message directly instead of Conversation.populate().
  // Conversation.messages[] is an unbounded ObjectId array — with 10k messages
  // it becomes a 120 KB document that must be loaded just to be re-populated.
  // Querying Message directly with a compound index is faster and avoids bloat.
  // We fetch limit + 1 messages to determine hasMore.
  const [rawMessages] = await Promise.all([
    Message.find(messageQuery)
      .select("message senderId receiverId createdAt status fileUrl fileType fileName fileSize") // Include file fields
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean(),

    // Mark received messages as read (concurrently with the fetch above)
    Message.updateMany(
      { senderId: userToChatId, receiverId: myId, status: { $ne: "read" } },
      { $set: { status: "read" } },
    ),
  ]);

  const hasMore = rawMessages.length > limit;
  const messages = hasMore ? rawMessages.slice(0, limit) : rawMessages;

  // Reverse to restore chronological order (oldest first)
  messages.reverse();

  // Notify the sender that their messages have been read
  const senderSocketId = getReceiverSocketId(userToChatId);
  if (senderSocketId) {
    io.to(senderSocketId).emit("messagesRead", { readerId: myId });
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { messages, hasMore },
        "Messages retrieved successfully"
      )
    );
});
