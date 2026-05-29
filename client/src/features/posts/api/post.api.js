import axiosInstance from "../../../utils/axiosInstance.js";

export const postApi = {
  createPost: async (postData, onUploadProgress) => {
    const response = await axiosInstance.post("/post", postData, {
      onUploadProgress,
    });
    return response.data;
  },
  getPosts: async () => {
    const response = await axiosInstance.get("/post");
    return response.data;
  },
  likePost: async (postId) => {
    const response = await axiosInstance.post(`/post/${postId}/like`);
    return response.data;
  },
  commentPost: async (postId, text) => {
    const response = await axiosInstance.post(`/post/${postId}/comment`, { text });
    return response.data;
  },
};
export default postApi;
