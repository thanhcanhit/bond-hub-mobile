// src/store/authStore.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
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

console.log("API_URL", API_URL);

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  isAuthenticated: null,
  loading: true,

  // Hàm đăng nhập
  login: async (phoneNumber: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
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
  register: async (phoneNumber: string, password: string, fullName: string) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
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
}));
