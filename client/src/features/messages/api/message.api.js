import axiosInstance from "../../../utils/axiosInstance.js";

/**
 * API service for handling all message-related network requests.
 */
export const messageApi = {
  /**
   * Fetches the conversation history between the logged-in user and the specified user.
   * @param {string} userId - The ID of the contact user to get messages for.
   * @returns {Promise<Object>} The server response containing an array of messages.
   */
  getMessages: async (userId, before, limit = 30) => {
    let url = `/message/${userId}?limit=${limit}`;
    if (before) {
      url += `&before=${encodeURIComponent(before)}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Sends a new message to the specified user.
   * @param {string} receiverId - The ID of the user receiving the message.
   * @param {Object} messageData - The content of the message (e.g., { text, image }).
   * @returns {Promise<Object>} The server response containing the newly created message.
   */
  sendMessage: async (receiverId, messageData) => {
    // Note: The backend route expects /send/:reciverId (with typo)
    const response = await axiosInstance.post(`/message/send/${receiverId}`, messageData);
    return response.data;
  }
};
