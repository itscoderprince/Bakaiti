import { useDispatch, useSelector } from "react-redux";
import { sendMessageThunk } from "../store/message.thunks.js";

/**
 * Custom hook to send a message.
 */
export const useSendMessage = () => {
  const dispatch = useDispatch();
  const { isSendingMessage, error } = useSelector((state) => state.messages);

  const sendMessage = async (receiverId, messageData) => {
    if (!receiverId || !messageData.message?.trim()) return;

    try {
      await dispatch(sendMessageThunk({ receiverId, messageData })).unwrap();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return { sendMessage, isSendingMessage, error };
};
