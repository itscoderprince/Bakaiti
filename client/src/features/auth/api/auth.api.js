import axiosInstance from "../../../utils/axiosInstance.js";

/**
 * API service for handling all authentication and user-related network requests.
 * Uses a configured axios instance that automatically handles sending HTTP-only cookies.
 */
export const authApi = {
  /**
   * Authenticates a user with their credentials.
   * @param {Object} credentials - The user's login details (e.g., username/email and password).
   * @returns {Promise<Object>} The server response containing the user data and token.
   */
  login: async (credentials) => {
    const response = await axiosInstance.post("/user/login", credentials);
    return response.data;
  },

  /**
   * Registers a new user account.
   * @param {Object} userData - The new user's details (fullname, username, email, password, gender).
   * @returns {Promise<Object>} The server response containing the new user data.
   */
  signup: async (userData) => {
    const response = await axiosInstance.post("/user/signup", userData);
    return response.data;
  },

  /**
   * Logs out the currently authenticated user by clearing their server-side cookie.
   * @returns {Promise<Object>} The server response confirming successful logout.
   */
  logout: async () => {
    const response = await axiosInstance.post("/user/logout");
    return response.data;
  },

  /**
   * Retrieves the currently authenticated user's profile information.
   * Used on app load to verify session validity via the stored HTTP-only cookie.
   * @returns {Promise<Object>} The server response containing the user's profile.
   */
  getProfile: async () => {
    const response = await axiosInstance.get("/user/profile");
    return response.data;
  },

  /**
   * Retrieves a list of all other registered users (excluding the current user).
   * Used for populating the chat sidebar contacts.
   * @returns {Promise<Object>} The server response containing an array of users.
   */
  getOtherUsers: async () => {
    const response = await axiosInstance.get("/user/");
    return response.data;
  },

  /**
   * Sends a password reset request email.
   * @param {Object} emailData - { email }
   * @returns {Promise<Object>}
   */
  forgotPassword: async (emailData) => {
    const response = await axiosInstance.post("/user/forgot-password", emailData);
    return response.data;
  },

  /**
   * Resets password using a verification token.
   * @param {Object} payload - { token, password, confirmPassword }
   * @returns {Promise<Object>}
   */
  resetPassword: async ({ token, ...passwordData }) => {
    const response = await axiosInstance.post(`/user/reset-password/${token}`, passwordData);
    return response.data;
  },

  /**
   * Changes the password of currently authenticated user.
   * @param {Object} passwordData - { oldPassword, newPassword, confirmNewPassword }
   * @returns {Promise<Object>}
   */
  changePassword: async (passwordData) => {
    const response = await axiosInstance.post("/user/change-password", passwordData);
    return response.data;
  }
};
