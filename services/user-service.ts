import axiosInstance from "../lib/axios";
import { User, UserInfo } from "@/types";

export const getUserInfo = async (
  userId: string,
): Promise<{ user: User; userInfo: UserInfo }> => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};
