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
