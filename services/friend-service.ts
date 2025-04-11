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

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  introduce: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    email: string;
    phoneNumber: string;
    userInfo: UserInfo;
  };
  receiver?: {
    id: string;
    email: string;
    phoneNumber: string;
    userInfo: UserInfo;
  };
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

// Lấy danh sách lời mời kết bạn đã nhận
export const getReceivedFriendRequests = async (): Promise<FriendRequest[]> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/friends/requests/received`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching received friend requests:", error);
    throw error;
  }
};

// Lấy danh sách lời mời kết bạn đã gửi
export const getSentFriendRequests = async (): Promise<FriendRequest[]> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/friends/requests/sent`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sent friend requests:", error);
    throw error;
  }
};

// Phản hồi lời mời kết bạn (chấp nhận hoặc từ chối)
export const respondToFriendRequest = async (
  requestId: string,
  status: "ACCEPTED" | "DECLINED",
): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.put(
      `/friends/respond`,
      {
        requestId,
        status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      `Error ${status === "ACCEPTED" ? "accepting" : "rejecting"} friend request:`,
      error,
    );
    throw error;
  }
};

// Chấp nhận lời mời kết bạn (giữ lại để tương thích ngược)
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  return respondToFriendRequest(requestId, "ACCEPTED");
};

// Từ chối lời mời kết bạn (giữ lại để tương thích ngược)
export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  return respondToFriendRequest(requestId, "DECLINED");
};

// Hủy lời mời kết bạn đã gửi
export const cancelFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.delete(`/friends/request/${requestId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error canceling friend request:", error);
    throw error;
  }
};
