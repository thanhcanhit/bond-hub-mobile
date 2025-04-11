import axiosInstance from "@/lib/axios";
import * as SecureStore from "expo-secure-store";

export interface UserInfo {
  id?: string;
  fullName?: string;
  profilePictureUrl?: string;
}

export interface Friend {
  friend: {
    email: string;
    id: string;
    phoneNumber: string;
    userInfo: UserInfo;
  };
  friendshipId: string;
  since: string;
}

export const getFriendList = async (): Promise<Friend[]> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/friends/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching friend list:", error);
    throw error;
  }
};

export const updatePhoneContacts = async (): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.post(
      `/friends/sync-contacts`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch (error) {
    console.error("Error updating phone contacts:", error);
    throw error;
  }
};
