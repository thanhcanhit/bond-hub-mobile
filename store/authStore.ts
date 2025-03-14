// src/store/authStore.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { axiosPublicInstance } from "../lib/axios";
import { router } from "expo-router";
import * as device from "expo-device";
import { User, UserInfo } from "@/types";
import { getUserInfo } from "@/services/user-service";

interface AuthState {
  user: User | null;
  userInfo: UserInfo | null;
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
  fetchUserInfo: () => Promise<void>;
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
        const userInfoStr = await SecureStore.getItemAsync("userInfo");

        if (userStr) {
          const user = JSON.parse(userStr);

          const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
          console.log("user: ", user);
          console.log("userInfo: ", userInfo);
          set({ isAuthenticated: true, user, userInfo, loading: false });
          if (!userInfo && user) {
            get().fetchUserInfo();
          }
          return;
        }
      }
      set({
        isAuthenticated: false,
        user: null,
        userInfo: null,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      set({
        isAuthenticated: false,
        user: null,
        userInfo: null,
        loading: false,
      });
    }
  };

  // Call initialize function when store is created
  initializeAuth();

  return {
    user: null,
    userInfo: null,
    isAuthenticated: null,
    loading: true,
    registrationId: null,

    fetchUserInfo: async () => {
      const { user } = get();
      if (!user) return;

      try {
        const { userInfo } = await getUserInfo(user.id);
        await SecureStore.setItemAsync("userInfo", JSON.stringify(userInfo));
        set({ userInfo });
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    },

    // Login function
    login: async (email: string, password: string) => {
      try {
        const deviceName = device.modelName || "UNKNOWN";
        const deviceTypeS = device.deviceType;
        const deviceId = "device_id";
        let deviceType = "";
        switch (deviceTypeS) {
          case 0:
            deviceType = "WEB";
            break;
          case 1:
            deviceType = "MOBILE";
            break;
          case 2:
            deviceType = "TABLET";
            break;
          case 3:
            deviceType = "TV";
            break;
          case 4:
            deviceType = "DESKTOP";
            break;
          default:
            deviceType = "WEB";
            break;
        }
        const response = await axiosPublicInstance.post(`${API_URL}/login`, {
          email,
          password,
          deviceName,
          deviceType,
          deviceId,
        });
        const { accessToken, refreshToken, user } = response.data;

        await SecureStore.setItemAsync("accessToken", accessToken);
        await SecureStore.setItemAsync("refreshToken", refreshToken);
        await SecureStore.setItemAsync("user", JSON.stringify(user));

        set({ user, isAuthenticated: true });
        get().fetchUserInfo();
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
        await SecureStore.deleteItemAsync("userInfo");
        set({ user: null, userInfo: null, isAuthenticated: false });
        router.replace("/login/loginScreen");
      } catch (error) {
        console.error("Logout failed:", error);
        throw error;
      }
    },
  };
});
