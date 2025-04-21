import axiosInstance from "@/lib/axios";
import * as SecureStore from "expo-secure-store";
import { Group, GroupInfo, GroupMember } from "@/types";

// Interface for group member request payload
export interface GroupMemberRequest {
  userId: string;
  addedById: string;
}

// Interface for creating a group
export interface CreateGroupRequest {
  name: string;
  creatorId: string;
  initialMembers: GroupMemberRequest[];
  file?: any; // File can be any type to match actual usage
  avatar?: string | null;
}

// Interface for group chat data
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

// Interface for updating group information
export interface UpdateGroupRequest {
  name?: string;
  avatarUrl?: string;
}

// Interface for adding a member to a group
export interface AddMemberRequest {
  groupId: string;
  userId: string;
}

/**
 * Create a new group with the given name and initial members
 */
export const createGroup = async (
  name: string,
  initialMembers: string[],
  avatarFile?: any,
): Promise<GroupChat> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");

    // Get user information from SecureStore
    const userStr = await SecureStore.getItemAsync("user");
    console.log("User data in SecureStore:", userStr);

    if (!userStr) {
      throw new Error("User data not found");
    }

    // Parse user information
    const userData = JSON.parse(userStr);
    console.log("Parsed user data:", userData);

    // Get userId from user object
    const userId = userData.userId;
    console.log("User ID from user object:", userId);

    if (!userId) {
      throw new Error("User ID not found in user data");
    }

    // Create initial members list
    const members = initialMembers.map((memberId) => ({
      userId: memberId,
      addedById: userId,
    }));

    // If there's an avatar file, use FormData
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
      // If no avatar file, use JSON
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

/**
 * Get list of groups
 */
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

/**
 * Get details of a specific group
 */
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

/**
 * Get basic information about a group
 */
export const getGroupInfo = async (groupId: string): Promise<GroupInfo> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/groups/${groupId}/info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching group info:", error);
    throw error;
  }
};

/**
 * Update group information
 */
export const updateGroupInfo = async (
  groupId: string,
  updateData: UpdateGroupRequest,
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

/**
 * Add members to a group
 */
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

/**
 * Remove a member from a group
 */
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

/**
 * Leave a group
 */
export const leaveGroup = async (groupId: string): Promise<any> => {
  try {
    console.log(`Calling API to leave group ${groupId}`);
    const token = await SecureStore.getItemAsync("accessToken");
    console.log("Token retrieved for leave group API call");

    const response = await axiosInstance.post(
      `/groups/${groupId}/leave`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("Leave group API response:", response.status, response.data);
    return true; // Trả về true để xác nhận thành công
  } catch (error: any) {
    console.error(
      "Error leaving group:",
      error?.response?.status,
      error?.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Update group avatar
 */
export const updateGroupAvatar = async (
  groupId: string,
  avatarFile: any,
): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");

    // If avatarFile is already a FormData object, use it directly
    const formData =
      avatarFile instanceof FormData ? avatarFile : new FormData();

    // If it's not a FormData object, append the file
    if (!(avatarFile instanceof FormData)) {
      formData.append("file", avatarFile);
    }

    const response = await axiosInstance.patch(
      `/groups/${groupId}/avatar`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating group avatar:", error);
    throw error;
  }
};

/**
 * Update a member's role in a group
 */
export const updateMemberRole = async (
  groupId: string,
  memberId: string,
  role: "MEMBER" | "CO_LEADER" | "LEADER",
): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.patch(
      `/groups/${groupId}/members/${memberId}/role`,
      { role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating member role:", error);
    throw error;
  }
};

/**
 * Group service object for components that expect an object-based API
 */
export const groupService = {
  createGroup,
  getGroupList,
  getGroupDetails,
  getGroupInfo,
  updateGroup: updateGroupInfo, // Alias for compatibility
  updateGroupInfo,
  addMembersToGroup,
  removeMember: removeMemberFromGroup, // Alias for compatibility
  removeMemberFromGroup,
  leaveGroup,
  deleteGroup: async (groupId: string): Promise<boolean> => {
    try {
      console.log(`Calling API to delete group ${groupId}`);
      const token = await SecureStore.getItemAsync("accessToken");
      console.log("Token retrieved for delete group API call");

      const response = await axiosInstance.delete(`/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Delete group API response:", response.status, response.data);
      return true;
    } catch (error: any) {
      console.error(
        "Error deleting group:",
        error?.response?.status,
        error?.response?.data || error.message,
      );
      throw error;
    }
  },
  updateGroupAvatar,
  updateMemberRole,
};
