import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT token (if present) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If token expired/invalid, force logout so user sees login screen again
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const login = (username, password) =>
  api.post("/auth/login", { username, password });

export const getImages = () => api.get("/images");
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/images/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteImage = (id) => api.delete(`/images/${id}`);
export const reactToImage = (id, emoji, comment) =>
  api.post(`/images/${id}/react`, { emoji, comment });

export const getVideos = () => api.get("/videos");
export const uploadVideo = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/videos/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteVideo = (id) => api.delete(`/videos/${id}`);
export const reactToVideo = (id, emoji, comment) =>
  api.post(`/videos/${id}/react`, { emoji, comment });

export default api;