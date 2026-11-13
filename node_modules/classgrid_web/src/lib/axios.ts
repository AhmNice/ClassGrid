import axios from "axios";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});
api.defaults.withCredentials = true;

const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/forgot-password",
  "/auth/verify-otp",
  "/auth/reset-password",
];
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || "An error occurred";
    const currentPath = window.location.pathname;

    // Unauthorized access - token might be expired or invalid
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accessToken");
      useAuthStore.getState().reset();
      if (!publicRoutes.includes(currentPath)) {
        toast.error(message || "Session expired. Please log in again.");
        window.location.href = "/auth/login";
      }
      return Promise.reject(error);
    }

    // Forbidden
    if (status === 401) {
      if (!publicRoutes.includes(currentPath)) {
        window.location.href = "/auth/login";
      }
      toast.error(
        message || "You don't have permission to perform this action.",
      );
    }
    if (status === 403) {
      toast.error(
        message || "You don't have permission to perform this action.",
      );
    }
    return Promise.reject(error);
  },
);

export default api;
