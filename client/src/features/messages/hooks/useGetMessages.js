import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessagesThunk } from "../store/message.thunks.js";

/**
 * Custom hook to fetch and manage messages for a specific contact.
 * @param {string} contactId - The ID of the contact to fetch messages for.
 */
export const useGetMessages = (contactId) => {
  const dispatch = useDispatch();
  const { messages, isMessagesLoading, error } = useSelector(
    (state) => state.messages,
  );

  useEffect(() => {
    if (!contactId) return;

    // Fetch messages for the selected contact.
    // MED-5: Messages are now cleared in getMessagesThunk.pending (message.slice.js)
    // instead of in a cleanup function here. This prevents the old pattern of:
    //   1. cleanup: clearMessages() → messages=[], isLoading still false → flash
    //   2. new effect: pending → isLoading=true
    // With the new pattern both happen atomically in the same dispatch cycle.
    dispatch(getMessagesThunk(contactId));
  }, [dispatch, contactId]);

  return { messages, isMessagesLoading, error };
};
