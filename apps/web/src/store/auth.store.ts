import type { SafeUser } from "../interface/user.dto";
import { create } from "zustand";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";

interface AuthState {
  user: SafeUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
}
interface AuthResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: SafeUser | null | T;
}

interface LoginPayload {
  email: string;
  password: string;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticating: false,
  isAuthenticated: false,
};

interface AuthActions {
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  authenticate: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,
  login: async (payload: LoginPayload) => {
    const response:AuthResponse = { success: false, message: "Login failed" };
    set({ loading: true, error: null });
    await handleRequest({
      request: () => api.post("/auth/login", payload),
      onSuccess: (response) => {
        const { data } = response;
        set({ user: data as SafeUser, isAuthenticated: true, loading: false, isAuthenticating: false });
        response.success = true;
        response.message = "Login successful";
      },
      onError: (error) => {
        set({
          isAuthenticating: false,
          error: error.response?.data?.message || "Login failed",
          loading: false,
        });
        response.success = false;
        response.message = error.response?.data?.message || "Login failed";
      },
    });
    return response;
  },
  logout: async () => {
    set({ loading: true, error: null });
    await handleRequest({
      request: () => api.post("/auth/logout"),
      onSuccess: () => {
        set({ user: null, isAuthenticated: false, loading: false });
      },
      onError: (error) => {
        set({
          error: error.response?.data?.message || "Logout failed",
          loading: false,
        });
      },
    });
  },
  authenticate: async () => {
    set({ isAuthenticating: true, error: null });
    await handleRequest({
      request: () => api.get("/auth/me"),
      onSuccess: (response) => {
        const { data } = response;
        set({
          user: data as SafeUser,
          isAuthenticated: true,
          isAuthenticating: false,
        });
      },
      onError: (error) => {
        set({
          user: null,
          isAuthenticated: false,
          isAuthenticating: false,
          error: error.response?.data?.message || "Authentication failed",
        });
      },
      showToast: false,
    });
  },
  reset: () => {
    set({ ...initialState });
  }
}));
