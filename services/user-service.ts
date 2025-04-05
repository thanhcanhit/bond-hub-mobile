import axiosInstance from "../lib/axios";
import { User, UserInfo } from "@/types";
import * as SecureStore from "expo-secure-store";

export const getUserInfo = async (
  userId: string,
): Promise<{ user: User; userInfo: UserInfo }> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/users/${userId}/basic-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
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
      },
    });
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
      },
    });
  } catch (error) {
    console.error("Error updating cover image:", error);
    throw error;
  }
};
