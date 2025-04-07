// src/store/authStore.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { axiosPublicInstance } from "../lib/axios";
import { router } from "expo-router";
import * as device from "expo-device";
import { User, UserInfo } from "@/types";
import { getUserInfo } from "@/services/user-service";
import { socketManager } from "../lib/socket";

interface AuthState {
  user: User | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean | null;
  loading: boolean;
  registrationId: string | null;
  resetId: string | null;
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
  forgotPassword: (email: string) => Promise<void>;
  verifyForgotPassword: (otp: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
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
    resetId: null,

    fetchUserInfo: async () => {
      const { user } = get();
      if (!user) return;

      try {
        const userInfoData = await getUserInfo(user.userId);
        await SecureStore.setItemAsync(
          "userInfo",
          JSON.stringify(userInfoData),
        );
        set({ userInfo: userInfoData });
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    },

    // Login function
    login: async (email: string, password: string) => {
      try {
        const deviceName = device.modelName || "UNKNOWN";
        const deviceTypeS = device.deviceType;
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
          default:
            deviceType = "WEB";
            break;
        }
        const response = await axiosPublicInstance.post(`${API_URL}/login`, {
          email,
          password,
          deviceName,
          deviceType,
        });
        const { accessToken, refreshToken, user, deviceId } = response.data;

        // Store authentication data
        await SecureStore.setItemAsync("accessToken", accessToken);
        await SecureStore.setItemAsync("refreshToken", refreshToken);
        await SecureStore.setItemAsync("user", JSON.stringify(user));
        await SecureStore.setItemAsync("deviceId", deviceId);

        // Update state
        set({ user, isAuthenticated: true });

        // Connect to socket with retry mechanism
        try {
          console.log("Attempting to connect to socket after login");
          await socketManager.connect();
          console.log("Socket connection successful after login");
        } catch (socketError) {
          console.error(
            "Failed to connect to socket after login:",
            socketError,
          );
          // Continue even if socket connection fails - don't block the login flow
        }

        // Fetch user info
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

    // Forgot password
    forgotPassword: async (email: string) => {
      try {
        const response = await axiosPublicInstance.post(
          `${API_URL}/forgot-password`,
          {
            email,
          },
        );
        const { resetId } = response.data;
        set({ resetId });
      } catch (error) {
        console.error("Forgot password request failed:", error);
        throw error;
      }
    },

    // Verify forgot password OTP
    verifyForgotPassword: async (otp: string) => {
      try {
        const resetId = get().resetId;
        if (!resetId) {
          throw new Error("Reset ID not found");
        }
        await axiosPublicInstance.post(`${API_URL}/forgot-password/verify`, {
          resetId,
          otp,
        });
      } catch (error) {
        console.error("OTP verification failed:", error);
        throw error;
      }
    },
    resetPassword: async (newPassword: string) => {
      try {
        const resetId = get().resetId;
        if (!resetId) {
          throw new Error("Reset ID not found");
        }
        await axiosPublicInstance.post(`${API_URL}/forgot-password/reset`, {
          resetId,
          newPassword,
        });
      } catch (error) {
        console.error("Reset password failed:", error);
        throw error;
      }
    },

    // Logout function
    logout: async () => {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      const accessToken = await SecureStore.getItemAsync("accessToken");
      try {
        if (!refreshToken) {
          throw new Error("Refresh token is required");
        }
        await axiosPublicInstance.post(`${API_URL}/logout`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "refresh-token": refreshToken,
          },
        });
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await SecureStore.deleteItemAsync("user");
        await SecureStore.deleteItemAsync("userInfo");
        set({ user: null, userInfo: null, isAuthenticated: false });

        // socketManager.disconnect();
        router.replace("/login/loginScreen");
      } catch (error) {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await SecureStore.deleteItemAsync("user");
        await SecureStore.deleteItemAsync("userInfo");
        set({ user: null, userInfo: null, isAuthenticated: false });
        router.replace("/login/loginScreen");
        throw error;
      }
    },
  };
});
