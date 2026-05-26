import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../shocket/shocket.js";

export const sendMessage = asyncHandler(async (req, res, next) => {
  const senderId = req.user._id;
  const receiverId = req.params.reciverId;

  const { message } = req.body;

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

  const newMessage = new Message({
    senderId,
    receiverId,
    message,
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

  // Auto-mark all received messages from this sender as read
  await Message.updateMany(
    { senderId: userToChatId, receiverId: myId, status: { $ne: "read" } },
    { $set: { status: "read" } }
  );

  // Notify the sender that their messages have been read
  const senderSocketId = getReceiverSocketId(userToChatId);
  if (senderSocketId) {
    io.to(senderSocketId).emit("messagesRead", { readerId: myId });
  }

  const conversation = await Conversation.findOne({
    participants: { $all: [myId, userToChatId] },
  })
    .select("-__v -updatedAt")
    .populate({
      path: "messages",
      select: "message senderId createdAt status",
    })
    .lean();

  if (!conversation) {
    return res.status(200).json(new ApiResponse(200, [], "No messages yet"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Messages retrieved successfully"),
    );
});
