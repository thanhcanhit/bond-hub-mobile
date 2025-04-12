import { useAuthStore } from "@/store/authStore";
import axiosInstance from "../lib/axios";
import { User, UserInfo } from "@/types";
import * as SecureStore from "expo-secure-store";

export const getUserInfo = async (userId: string): Promise<UserInfo> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/users/${userId}/basic-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Trả về trực tiếp UserInfo
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

// Lấy thông tin chi tiết của người dùng khác
export const getUserProfile = async (userId: string): Promise<any> => {
  console.log("Fetching user profile for ID:", userId);
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("User profile data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

interface UpdateBasicInfoData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bio: string;
}

export const updateBasicInfo = async (
  data: UpdateBasicInfoData,
): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.put("/auth/update-basic-info", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userStr = await SecureStore.getItemAsync("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUserInfo = await getUserInfo(user.userId); // Lấy UserInfo trực tiếp

      // Lưu vào SecureStore
      await SecureStore.setItemAsync(
        "userInfo",
        JSON.stringify(updatedUserInfo),
      );

      // Cập nhật state
      useAuthStore.setState({ userInfo: updatedUserInfo });
      console.log("Updated userInfo in state:", updatedUserInfo);
    }
  } catch (error) {
    console.error("Error updating basic info:", error);
    throw error;
  }
};

export const updateProfilePicture = async (
  formData: FormData,
): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.put("/auth/update-profile-picture", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const userStr = await SecureStore.getItemAsync("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUserInfo = await getUserInfo(user.userId); // Lấy UserInfo trực tiếp

      // Lưu vào SecureStore
      await SecureStore.setItemAsync(
        "userInfo",
        JSON.stringify(updatedUserInfo),
      );

      // Cập nhật state
      useAuthStore.setState({ userInfo: updatedUserInfo });
      console.log(
        "Updated userInfo after profile picture update:",
        updatedUserInfo,
      );
    }
  } catch (error) {
    console.error("Error updating profile picture:", error);
    throw error;
  }
};

export const updateCoverImage = async (formData: FormData): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.put("/auth/update-cover-image", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const userStr = await SecureStore.getItemAsync("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUserInfo = await getUserInfo(user.userId); // Lấy UserInfo trực tiếp

      // Lưu vào SecureStore
      await SecureStore.setItemAsync(
        "userInfo",
        JSON.stringify(updatedUserInfo),
      );

      // Cập nhật state
      useAuthStore.setState({ userInfo: updatedUserInfo });
      console.log(
        "Updated userInfo after cover image update:",
        updatedUserInfo,
      );
    }
  } catch (error) {
    console.error("Error updating cover image:", error);
    throw error;
  }
};

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (
  data: ChangePasswordData,
): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.put("/auth/change-password", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Change password failed:", error);
    throw error;
  }
};

// Tìm kiếm người dùng bằng email hoặc số điện thoại
export const searchUser = async (searchData: {
  email?: string;
  phoneNumber?: string;
}): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.post("/users/search", searchData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Search user data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error searching user:", error);
    throw error;
  }
};
