import axiosInstance from "@/lib/axios";
import * as SecureStore from "expo-secure-store";

export interface GroupMember {
  userId: string;
  addedById: string;
}

export interface CreateGroupRequest {
  name: string;
  creatorId: string;
  initialMembers: GroupMember[];
  file?: FormData;
}

export interface GroupChat {
  id: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  memberCount: number;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  };
}

export const createGroup = async (
  name: string,
  initialMembers: string[],
  avatarFile?: any,
): Promise<GroupChat> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");

    // Lấy thông tin người dùng từ SecureStore
    const userStr = await SecureStore.getItemAsync("user");
    console.log("User data in SecureStore:", userStr);

    if (!userStr) {
      throw new Error("User data not found");
    }

    // Parse thông tin người dùng
    const userData = JSON.parse(userStr);
    console.log("Parsed user data:", userData);

    // Lấy userId từ đối tượng user
    const userId = userData.userId;
    console.log("User ID from user object:", userId);

    if (!userId) {
      throw new Error("User ID not found in user data");
    }

    // Tạo danh sách thành viên ban đầu
    const members = initialMembers.map((memberId) => ({
      userId: memberId,
      addedById: userId,
    }));

    // Nếu có file ảnh, sử dụng FormData
    if (avatarFile) {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("creatorId", userId);
      formData.append("initialMembers", JSON.stringify(members));
      formData.append("file", avatarFile);

      console.log(
        "FormData being sent:",
        JSON.stringify({
          name,
          creatorId: userId,
          initialMembers: members,
          hasFile: true,
        }),
      );

      const response = await axiosInstance.post(`/groups`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } else {
      // Nếu không có file ảnh, sử dụng JSON
      const data = {
        name,
        creatorId: userId,
        avatar: null,
        initialMembers: members,
      };

      console.log("JSON data being sent:", JSON.stringify(data));

      const response = await axiosInstance.post(`/groups`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    }
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

export const getGroupList = async (): Promise<GroupChat[]> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching group list:", error);
    throw error;
  }
};

export const getGroupDetails = async (groupId: string): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/groups/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching group details:", error);
    throw error;
  }
};

export const updateGroupInfo = async (
  groupId: string,
  updateData: { name?: string; avatarUrl?: string },
): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.put(`/groups/${groupId}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating group info:", error);
    throw error;
  }
};

export const addMembersToGroup = async (
  groupId: string,
  memberIds: string[],
): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.post(
      `/groups/${groupId}/members`,
      { memberIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error adding members to group:", error);
    throw error;
  }
};

export const removeMemberFromGroup = async (
  groupId: string,
  memberId: string,
): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.delete(
      `/groups/${groupId}/members/${memberId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error removing member from group:", error);
    throw error;
  }
};

export const leaveGroup = async (groupId: string): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.delete(`/groups/${groupId}/leave`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error leaving group:", error);
    throw error;
  }
};
