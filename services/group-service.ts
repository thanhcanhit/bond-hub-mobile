import axiosInstance from "@/lib/axios";
import { Group, GroupInfo, GroupMember } from "@/types";

interface CreateGroupRequest {
  name: string;
  creatorId: string;
  initialMembers?: Array<{
    userId: string;
    addedById: string;
  }>;
  avatarUrl?: string;
}

interface AddMemberRequest {
  groupId: string;
  userId: string;
}

interface UpdateGroupRequest {
  name?: string;
  avatarUrl?: string;
}

const handleError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);

  // Check if it's a network error
  if (
    error.name === "NetworkError" ||
    (error.message && error.message.includes("Network")) ||
    (error.code && error.code === "ECONNABORTED")
  ) {
    // Return empty data instead of throwing for network errors
    console.log(`Network error in ${context}, returning empty data`);
    return null;
  }

  throw error;
};

export const groupService = {
  // Tạo nhóm mới
  async createGroup(data: CreateGroupRequest): Promise<Group | null> {
    try {
      const response = await axiosInstance.post("/groups", data);
      return response.data;
    } catch (error) {
      return handleError(error, "createGroup");
    }
  },

  // Lấy thông tin chi tiết của nhóm
  async getGroupDetails(groupId: string): Promise<Group | null> {
    try {
      const response = await axiosInstance.get(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      return handleError(error, "getGroupDetails");
    }
  },
  async getGroupInfo(groupId: string): Promise<GroupInfo | null> {
    try {
      const response = await axiosInstance.get(`/groups/${groupId}/info`);
      return response.data;
    } catch (error) {
      return handleError(error, "getGroupDetails");
    }
  },

  // Cập nhật thông tin nhóm
  async updateGroup(
    groupId: string,
    data: UpdateGroupRequest,
  ): Promise<Group | null> {
    try {
      const response = await axiosInstance.patch(`/groups/${groupId}`, data);
      return response.data;
    } catch (error) {
      return handleError(error, "updateGroup");
    }
  },

  // Xóa nhóm
  async deleteGroup(groupId: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      return true;
    } catch (error) {
      handleError(error, "deleteGroup");
      return false;
    }
  },

  // Thêm thành viên vào nhóm
  async addMember(data: AddMemberRequest): Promise<GroupMember | null> {
    try {
      const response = await axiosInstance.post("/groups/members", data);
      return response.data;
    } catch (error) {
      return handleError(error, "addMember");
    }
  },

  // Xóa thành viên khỏi nhóm
  async removeMember(groupId: string, userId: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`/groups/${groupId}/members/${userId}`);
      return true;
    } catch (error) {
      handleError(error, "removeMember");
      return false;
    }
  },

  // Rời khỏi nhóm
  async leaveGroup(groupId: string): Promise<boolean> {
    try {
      await axiosInstance.post(`/groups/${groupId}/leave`);
      return true;
    } catch (error) {
      handleError(error, "leaveGroup");
      return false;
    }
  },

  // Cập nhật avatar nhóm
  async updateGroupAvatar(
    groupId: string,
    file: FormData,
  ): Promise<Group | null> {
    try {
      const response = await axiosInstance.patch(
        `/groups/${groupId}/avatar`,
        file,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      return handleError(error, "updateGroupAvatar");
    }
  },
};
