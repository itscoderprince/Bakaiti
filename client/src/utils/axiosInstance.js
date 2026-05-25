import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3500/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add logic here like appending tokens if you were using localStorage
    // But since we use httpOnly cookies, we don't need to manually attach tokens here!
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Centralized error handling
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized: Please log in again.");
      // You can dispatch a logout action or redirect to login here if needed
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
