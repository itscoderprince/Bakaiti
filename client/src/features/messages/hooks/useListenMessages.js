import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  appendMessage,
  updateLastMessageTime,
  markMessagesAsRead,
  markMessagesAsDelivered,
} from "../store/message.slice.js";
import { incrementUnreadCount } from "../../auth/store/auth.slice.js";
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

  // CRIT-1: Store otherUsers in a ref so handleNewMessage can always read the
  // latest value WITHOUT adding otherUsers to the effect's dependency array.
  // Previously otherUsers was a dep, so every time the unread-badge count
  // changed, all three socket listeners were torn down and re-registered —
  // causing missed events during the brief re-subscription window.
  const otherUsersRef = useRef(otherUsers);
  useEffect(() => {
    otherUsersRef.current = otherUsers;
  }, [otherUsers]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // Only append if the message belongs to the active conversation
      if (newMessage.senderId === activeContactId) {
        dispatch(appendMessage(newMessage));
      } else {
        // Update last message timestamp for background contact to sort sidebar
        dispatch(
          updateLastMessageTime({
            contactId: newMessage.senderId,
            timestamp: newMessage.createdAt || new Date().toISOString(),
          }),
        );

        // Increment unread count badge
        dispatch(incrementUnreadCount({ contactId: newMessage.senderId }));

        // Find sender's full name to display a toast — read from ref (not dep)
        const sender = otherUsersRef.current?.find(
          (u) => u._id === newMessage.senderId,
        );
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
    // otherUsers intentionally excluded — read via ref to prevent unnecessary
    // listener teardown/re-registration on every unread badge update (CRIT-1)
  }, [isConnected, dispatch, activeContactId]);
};
