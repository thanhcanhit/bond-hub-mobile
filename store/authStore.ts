// src/store/authStore.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import axiosInstance, { axiosPublicInstance } from "../lib/axios";
import { router } from "expo-router";

interface User {
  fullName: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean | null;
  loading: boolean;
  registrationId: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  initiateRegistration: (email: string) => Promise<void>;
  verifyRegistration: (otp: string) => Promise<void>;
  completeRegistration: (params: {
    password: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
  }) => Promise<void>;
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
    registrationId: null,

    // Login function
    login: async (email: string, password: string) => {
      try {
        const response = await axiosPublicInstance.post(`${API_URL}/login`, {
          email,
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

    // Step 1: Initiate Registration
    initiateRegistration: async (email: string) => {
      try {
        const response = await axiosPublicInstance.post(
          `${API_URL}/register/initiate`,
          { email },
        );
        const { registrationId } = response.data;
        set({ registrationId });
      } catch (error) {
        console.error("Registration initiation failed:", error);
        throw error;
      }
    },

    // Step 2: Verify OTP
    verifyRegistration: async (otp: string) => {
      try {
        const registrationId = get().registrationId;
        if (!registrationId) {
          throw new Error("Registration ID not found");
        }
        await axiosPublicInstance.post(`${API_URL}/register/verify`, {
          otp,
          registrationId,
        });
      } catch (error) {
        console.error("OTP verification failed:", error);
        throw error;
      }
    },

    // Step 3: Complete Registration
    completeRegistration: async (params) => {
      try {
        const registrationId = get().registrationId;
        if (!registrationId) {
          throw new Error("Registration ID not found");
        }
        const response = await axiosPublicInstance.post(
          `${API_URL}/register/complete`,
          {
            ...params,
            registrationId,
          },
        );
        const { user } = response.data;
        set({ registrationId: null, user });
      } catch (error) {
        console.error("Registration completion failed:", error);
        throw error;
      }
    },

    // Logout function
    logout: async () => {
      try {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await SecureStore.deleteItemAsync("user");
        set({ isAuthenticated: false, user: null });
        router.replace("/login/loginScreen");
      } catch (error) {
        console.error("Logout failed:", error);
        throw error;
      }
    },
  };
});
