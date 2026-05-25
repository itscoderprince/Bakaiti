import axiosInstance from "../../../utils/axiosInstance.js";

export const authApi = {
  login: async (credentials) => {
    const response = await axiosInstance.post("/user/login", credentials);
    return response.data;
  },
  signup: async (userData) => {
    const response = await axiosInstance.post("/user/signup", userData);
    return response.data;
  },
  logout: async () => {
    const response = await axiosInstance.post("/user/logout");
    return response.data;
  },
  getProfile: async () => {
    const response = await axiosInstance.get("/user/profile");
    return response.data;
  }
};
