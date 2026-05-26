import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessagesThunk } from "../store/message.thunks.js";
import { clearMessages } from "../store/message.slice.js";

/**
 * Custom hook to fetch and manage messages for a specific contact.
 * @param {string} contactId - The ID of the contact to fetch messages for.
 */
export const useGetMessages = (contactId) => {
  const dispatch = useDispatch();
  const { messages, isMessagesLoading, error } = useSelector((state) => state.messages);

  useEffect(() => {
    if (!contactId) return;

    // Fetch messages for the selected contact
    dispatch(getMessagesThunk(contactId));

    // Cleanup: Clear messages when unmounting or changing contacts
    // so we don't flash old messages before the new ones load
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch, contactId]);

  return { messages, isMessagesLoading, error };
};
