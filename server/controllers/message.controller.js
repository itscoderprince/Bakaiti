import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

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

  const newMessage = new Message({
    senderId,
    receiverId,
    message,
  });

  if (newMessage) {
    conversation.messages.push(newMessage._id);
  }

  // Save both in parallel
  await Promise.all([conversation.save(), newMessage.save()]);

  // TODO: SOCKET.IO implementation for real-time messaging

  res
    .status(201)
    .json(new ApiResponse(201, newMessage, "Message sent successfully"));
});

export const getMessages = asyncHandler(async (req, res, next) => {
  const myId = req.user._id;
  const userToChatId = req.params.userId;

  const conversation = await Conversation.findOne({
    participants: { $all: [myId, userToChatId] },
  })
    .select("-__v -updatedAt")
    .populate({
      path: "messages",
      select: "message senderId createdAt",
    });

  if (!conversation) {
    return res.status(200).json(new ApiResponse(200, [], "No messages yet"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Messages retrieved successfully"),
    );
});
