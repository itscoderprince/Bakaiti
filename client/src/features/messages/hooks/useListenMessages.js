import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  appendMessage,
  updateLastMessageTime,
  markMessagesAsRead,
  markMessagesAsDelivered,
} from "../store/message.slice.js";
import { getSocket } from "../../shocket/store/shocket.slice.js";
import toast from "react-hot-toast";

/**
 * Custom hook that listens for real-time messages via Socket.io.
 * If the message is from the active contact, it's appended to the current chat state.
 * Otherwise, it triggers a toast notification.
 * 
 * @param {string} activeContactId - The ID of the currently open chat contact.
 */
export const useListenMessages = (activeContactId) => {
  const dispatch = useDispatch();
  const { isConnected } = useSelector((state) => state.shocket);
  const { otherUsers } = useSelector((state) => state.auth);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // Only append if the message belongs to the active conversation
      if (newMessage.senderId === activeContactId) {
        dispatch(appendMessage(newMessage));
      } else {
        // Update last message timestamp for background contact to sort sidebar
        dispatch(updateLastMessageTime({
          contactId: newMessage.senderId,
          timestamp: newMessage.createdAt || new Date().toISOString()
        }));

        // Find sender's full name to display a toast
        const sender = otherUsers?.find((u) => u._id === newMessage.senderId);
        const senderName = sender ? sender.fullname : "Someone";
        toast(`New message from ${senderName}: ${newMessage.message}`, {
          icon: "💬",
        });
      }
    };

    const handleMessagesRead = ({ readerId }) => {
      if (readerId === activeContactId) {
        dispatch(markMessagesAsRead({ readerId }));
      }
    };

    const handleMessagesDelivered = ({ receiverId }) => {
      if (receiverId === activeContactId) {
        dispatch(markMessagesAsDelivered({ receiverId }));
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("messagesDelivered", handleMessagesDelivered);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("messagesDelivered", handleMessagesDelivered);
    };
  }, [isConnected, dispatch, activeContactId, otherUsers]);
};
