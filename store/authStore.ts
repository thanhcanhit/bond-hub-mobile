// src/store/authStore.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import axiosInstance, { axiosPublicInstance } from "../lib/axios";
import { router } from "expo-router";
interface User {
  fullName: string;
  phoneNumber: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean | null;
  loading: boolean;
}

interface AuthActions {
  login: (phoneNumber: string, password: string) => Promise<void>;
  register: (
    phoneNumber: string,
    password: string,
    fullName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

if (!process.env.EXPO_PUBLIC_API_URL) {
  throw new Error("Missing EXPO_PUBLIC_API_URL in .env file");
}

const API_URL = process.env.EXPO_PUBLIC_API_URL + "/auth";
export const useAuthStore = create<AuthState & AuthActions>((set, get) => {
  // Initialize the auth state
  const initializeAuth = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      if (accessToken) {
        const userStr = await SecureStore.getItemAsync("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          set({ isAuthenticated: true, user, loading: false });
          return;
        }
      }
      set({ isAuthenticated: false, user: null, loading: false });
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      set({ isAuthenticated: false, user: null, loading: false });
    }
  };

  // Call initialize function when store is created
  initializeAuth();

  return {
    user: null,
    isAuthenticated: null,
    loading: true,

    // Hàm đăng nhập
    login: async (phoneNumber: string, password: string) => {
      try {
        const response = await axiosPublicInstance.post(`${API_URL}/login`, {
          phoneNumber,
          password,
        });
        const { accessToken, refreshToken, user } = response.data;

        await SecureStore.setItemAsync("accessToken", accessToken);
        await SecureStore.setItemAsync("refreshToken", refreshToken);
        await SecureStore.setItemAsync("user", JSON.stringify(user));

        set({ isAuthenticated: true, user });
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    // Hàm đăng ký
    register: async (
      phoneNumber: string,
      password: string,
      fullName: string,
    ) => {
      try {
        const response = await axiosPublicInstance.post(`${API_URL}/register`, {
          phoneNumber,
          password,
          fullName,
        });
        return response.data;
      } catch (error) {
        console.error("Registration failed:", error);
        throw error;
      }
    },

    // Hàm đăng xuất
    logout: async () => {
      try {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await SecureStore.deleteItemAsync("user");

        set({ isAuthenticated: false, user: null });
        router.replace("/login/loginScreen");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    },
  };
});
