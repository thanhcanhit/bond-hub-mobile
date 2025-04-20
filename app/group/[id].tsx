import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  ArrowLeft,
  Edit2,
  UserPlus,
  LogOut,
  Trash2,
  Camera,
  Phone,
  MessageSquare,
  X,
  User,
  ShieldAlert,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { groupService } from "@/services/group-service";
import axiosInstance from "@/lib/axios";
import * as SecureStore from "expo-secure-store";
import { Group, GroupMember } from "@/types";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function GroupInfoScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const groupId = params.id;
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<ExtendedGroupMember | null>(null);
  const [showMemberInfo, setShowMemberInfo] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    if (groupId) {
      console.log("Fetching group details for ID:", groupId);
      fetchGroupDetails();
    } else {
      console.error("No group ID provided");
    }
  }, [groupId]);

  const fetchGroupDetails = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching group details for ID:", groupId);

      try {
        // Phương pháp 1: Sử dụng groupService.getGroupDetails
        const groupData = await groupService.getGroupDetails(groupId);
        console.log("Group data received from service:", groupData);

        if (groupData) {
          setGroup(groupData);
          setNewGroupName(groupData.name);
          return; // Thoát khỏi hàm nếu thành công
        }
      } catch (serviceError) {
        console.error("Error using groupService:", serviceError);
      }

      try {
        // Phương pháp 2: Gọi trực tiếp API
        const token = await SecureStore.getItemAsync("accessToken");
        console.log(
          "Trying direct API call with token:",
          token ? "Token exists" : "No token",
        );

        // Thử gọi API với đường dẫn từ .env
        const response = await axiosInstance.get(`/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Direct API call status:", response.status);
        const directData = response.data;
        console.log("Direct API data:", directData);

        if (directData) {
          setGroup(directData);
          setNewGroupName(directData.name);
        }
      } catch (directError) {
        console.error("Error with direct API call:", directError);
        throw directError; // Re-throw để xử lý ở catch bên ngoài
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin nhóm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroupName = async () => {
    if (!newGroupName.trim() || !group) return;

    setIsUpdating(true);
    try {
      const updatedGroup = await groupService.updateGroup(groupId, {
        name: newGroupName,
      });
      if (updatedGroup) {
        setGroup(updatedGroup);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating group name:", error);
      Alert.alert("Lỗi", "Không thể cập nhật tên nhóm");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateGroupAvatar = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Cần quyền truy cập",
        "Cần quyền truy cập thư viện ảnh để chọn ảnh đại diện nhóm",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIsUpdating(true);
      try {
        const formData = new FormData();
        formData.append("file", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "group_avatar.jpg",
        } as any);

        const updatedGroup = await groupService.updateGroupAvatar(
          groupId,
          formData,
        );
        if (updatedGroup) {
          setGroup(updatedGroup);
        }
      } catch (error) {
        console.error("Error updating group avatar:", error);
        Alert.alert("Lỗi", "Không thể cập nhật ảnh đại diện nhóm");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert("Rời nhóm", "Bạn có chắc chắn muốn rời khỏi nhóm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Rời nhóm",
        style: "destructive",
        onPress: async () => {
          setIsUpdating(true);
          try {
            const success = await groupService.leaveGroup(groupId);
            if (success) {
              router.replace("/");
            }
          } catch (error) {
            console.error("Error leaving group:", error);
            Alert.alert("Lỗi", "Không thể rời khỏi nhóm");
          } finally {
            setIsUpdating(false);
          }
        },
      },
    ]);
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      "Xóa nhóm",
      "Bạn có chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa nhóm",
          style: "destructive",
          onPress: async () => {
            setIsUpdating(true);
            try {
              const success = await groupService.deleteGroup(groupId);
              if (success) {
                router.replace("/");
              }
            } catch (error) {
              console.error("Error deleting group:", error);
              Alert.alert("Lỗi", "Không thể xóa nhóm");
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ],
    );
  };

  const isGroupLeader =
    group?.members?.some(
      (member) =>
        member.userId === currentUser?.userId && member.role === "LEADER",
    ) || false;

  // Sử dụng type casting để phù hợp với cấu trúc dữ liệu mới
  interface ExtendedGroupMember extends GroupMember {
    fullName?: string;
    profilePictureUrl?: string;
    addedBy?: {
      id: string;
      fullName: string;
    };
  }

  const renderMemberItem = ({ item }: { item: ExtendedGroupMember }) => {
    // Trong cấu trúc dữ liệu mới, thông tin người dùng được đưa trực tiếp vào đối tượng thành viên
    const fullName = item.fullName || "Không có tên";
    const profilePictureUrl = item.profilePictureUrl;
    const addedBy = item.addedBy?.fullName || "";

    // Kiểm tra xem có phải là người dùng hiện tại không
    const isCurrentUser = item.userId === currentUser?.userId;

    return (
      <TouchableOpacity
        className="py-3 border-b border-gray-100"
        onPress={() => {
          // Chỉ hiển thị thông tin khi nhấn vào thành viên khác
          if (!isCurrentUser) {
            setSelectedMember(item);
            setShowMemberInfo(true);
          }
        }}
        disabled={isCurrentUser}
        activeOpacity={isCurrentUser ? 1 : 0.7}
      >
        <HStack className="items-center">
          <Avatar size="md">
            {profilePictureUrl ? (
              <AvatarImage source={{ uri: profilePictureUrl }} />
            ) : (
              <AvatarFallbackText>{fullName}</AvatarFallbackText>
            )}
          </Avatar>
          <VStack className="ml-3 flex-1">
            <Text className="font-medium">
              {fullName}
              {isCurrentUser ? " (Bạn)" : ""}
            </Text>
            <Text className="text-xs text-gray-500">
              {item.role === "LEADER"
                ? "Trưởng nhóm"
                : item.role === "CO_LEADER"
                  ? "Phó nhóm"
                  : "Thành viên"}
            </Text>
            {addedBy && item.role !== "LEADER" && (
              <Text className="text-xs text-gray-400">Thêm bởi: {addedBy}</Text>
            )}
          </VStack>

          {isGroupLeader && item.userId !== currentUser?.userId && (
            <TouchableOpacity
              className="p-2"
              onPress={(e) => {
                e.stopPropagation(); // Ngăn sự kiện lan tỏa đến TouchableOpacity cha
                Alert.alert(
                  "Xóa thành viên",
                  `Bạn có chắc chắn muốn xóa ${(item as ExtendedGroupMember).fullName || "thành viên này"} khỏi nhóm?`,
                  [
                    { text: "Hủy", style: "cancel" },
                    {
                      text: "Xóa",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await groupService.removeMember(groupId, item.userId);
                          fetchGroupDetails();
                        } catch (error) {
                          console.error("Error removing member:", error);
                          Alert.alert("Lỗi", "Không thể xóa thành viên");
                        }
                      },
                    },
                  ],
                );
              }}
            >
              <Trash2 size={20} color={"red"} />
            </TouchableOpacity>
          )}
        </HStack>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={["#297eff", "#228eff", "#00d4ff"]}
        style={{
          paddingTop: insets.top,
        }}
      >
        {/* Header */}
        <HStack className="p-2.5 border-b border-gray-200 justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={"white"} />
          </TouchableOpacity>
          <Text className="text-lg text-white font-semibold">
            Thông tin nhóm
          </Text>
          <View style={{ width: 24 }} />
        </HStack>
      </LinearGradient>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.light.PRIMARY_BLUE} />
        </View>
      ) : group ? (
        <ScrollView className="flex-1">
          {/* Group Info */}
          <VStack className="p-4 items-center border-b border-gray-200">
            <TouchableOpacity
              onPress={handleUpdateGroupAvatar}
              disabled={!isGroupLeader || isUpdating}
              className="relative"
            >
              <Avatar size="xl">
                {group?.avatarUrl ? (
                  <AvatarImage source={{ uri: group?.avatarUrl || "" }} />
                ) : (
                  <AvatarFallbackText>
                    {group?.name || "Nhóm"}
                  </AvatarFallbackText>
                )}
              </Avatar>
              {isGroupLeader && (
                <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                  <Camera size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>

            {isEditing ? (
              <HStack className="mt-3 items-center">
                <TextInput
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={handleUpdateGroupName}
                  disabled={isUpdating}
                  className="ml-2"
                >
                  <Text className="text-blue-500 font-medium">Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditing(false);
                    setNewGroupName(group?.name || "");
                  }}
                  className="ml-2"
                >
                  <Text className="text-gray-500">Hủy</Text>
                </TouchableOpacity>
              </HStack>
            ) : (
              <HStack className="mt-3 items-center">
                <Text className="text-xl font-semibold">
                  {group?.name || ""}
                </Text>
                {isGroupLeader && (
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    className="ml-2"
                  >
                    <Edit2 size={16} color={Colors.light.PRIMARY_BLUE} />
                  </TouchableOpacity>
                )}
              </HStack>
            )}

            <Text className="text-gray-500 mt-1">
              {group?.members?.length || 0} thành viên
            </Text>
          </VStack>

          {/* Members List */}
          <View>
            <HStack className="px-4 py-3 bg-gray-50 justify-between items-center">
              <Text className="font-semibold">Thành viên nhóm</Text>
              {isGroupLeader && (
                <TouchableOpacity className="flex-row items-center">
                  <UserPlus size={18} color={Colors.light.PRIMARY_BLUE} />
                  <Text className="ml-1 text-blue-500">Thêm</Text>
                </TouchableOpacity>
              )}
            </HStack>

            <FlatList
              data={group?.members || []}
              keyExtractor={(item) => item.id}
              renderItem={renderMemberItem}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          </View>

          {/* Actions */}
          <VStack className="p-4 border-t border-gray-200 mt-4">
            <TouchableOpacity
              onPress={handleLeaveGroup}
              className="flex-row items-center py-3"
            >
              <LogOut size={20} color={"red"} />
              <Text className="ml-3 text-red-500">Rời khỏi nhóm</Text>
            </TouchableOpacity>

            {isGroupLeader && (
              <TouchableOpacity
                onPress={handleDeleteGroup}
                className="flex-row items-center py-3"
              >
                <Trash2 size={20} color={"red"} />
                <Text className="ml-3 text-red-500">Giải tán nhóm</Text>
              </TouchableOpacity>
            )}
          </VStack>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text>Không tìm thấy thông tin nhóm</Text>
        </View>
      )}

      {isUpdating && (
        <View className="absolute inset-0 bg-black bg-opacity-30 items-center justify-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* Modal thông tin thành viên */}
      <Modal
        visible={showMemberInfo}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMemberInfo(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{
            backgroundColor: "rgba(148, 163, 184, 0.3)",
          }} /* Màu slate-400 với độ trong suốt 30% */
          onPress={() => setShowMemberInfo(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl p-5"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="items-center mb-4">
              <View className="w-10 h-1 bg-gray-300 rounded-full mb-4" />
              <Text className="text-xl font-bold mb-2">
                Thông tin thành viên
              </Text>

              <TouchableOpacity
                className="absolute right-0 top-0"
                onPress={() => setShowMemberInfo(false)}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedMember && (
              <View className="items-center">
                <Avatar size="xl" className="mb-4">
                  {selectedMember.profilePictureUrl ? (
                    <AvatarImage
                      source={{ uri: selectedMember.profilePictureUrl }}
                    />
                  ) : (
                    <AvatarFallbackText>
                      {selectedMember.fullName || ""}
                    </AvatarFallbackText>
                  )}
                </Avatar>

                <Text className="text-xl font-bold mb-1">
                  {selectedMember.fullName}
                </Text>
                <Text className="text-gray-500 mb-4">
                  {selectedMember.role === "LEADER"
                    ? "Trưởng nhóm"
                    : selectedMember.role === "CO_LEADER"
                      ? "Phó nhóm"
                      : "Thành viên"}
                </Text>

                <View className="w-full">
                  <TouchableOpacity className="flex-row items-center py-4 border-t border-gray-200">
                    <User size={20} color={Colors.light.PRIMARY_BLUE} />
                    <Text className="ml-3 text-base">Xem trang cá nhân</Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-row items-center py-4 border-t border-gray-200">
                    <MessageSquare
                      size={20}
                      color={Colors.light.PRIMARY_BLUE}
                    />
                    <Text className="ml-3 text-base">Nhắn tin</Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-row items-center py-4 border-t border-gray-200">
                    <Phone size={20} color={Colors.light.PRIMARY_BLUE} />
                    <Text className="ml-3 text-base">Gọi điện</Text>
                  </TouchableOpacity>

                  {/* Bổ nhiệm làm phó nhóm */}
                  {isGroupLeader &&
                    selectedMember.role !== "LEADER" &&
                    selectedMember.role !== "CO_LEADER" && (
                      <TouchableOpacity
                        className="flex-row items-center py-4 border-t border-gray-200"
                        onPress={() => {
                          setShowMemberInfo(false);
                          Alert.alert(
                            "Bổ nhiệm làm phó nhóm",
                            `Bạn có muốn bổ nhiệm ${selectedMember.fullName} làm phó nhóm?`,
                            [
                              { text: "Hủy", style: "cancel" },
                              {
                                text: "Bổ nhiệm",
                                onPress: async () => {
                                  try {
                                    setIsUpdating(true);
                                    // Gọi API để cập nhật vai trò thành viên
                                    await groupService.updateMemberRole(
                                      groupId,
                                      selectedMember.userId,
                                      "CO_LEADER",
                                    );
                                    // Cập nhật lại thông tin nhóm
                                    await fetchGroupDetails();
                                    Alert.alert(
                                      "Thành công",
                                      `Đã bổ nhiệm ${selectedMember.fullName} làm phó nhóm`,
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Error updating member role:",
                                      error,
                                    );
                                    Alert.alert(
                                      "Lỗi",
                                      "Không thể bổ nhiệm phó nhóm",
                                    );
                                  } finally {
                                    setIsUpdating(false);
                                  }
                                },
                              },
                            ],
                          );
                        }}
                      >
                        <ShieldAlert
                          size={20}
                          color={Colors.light.PRIMARY_BLUE}
                        />
                        <Text className="ml-3 text-base">
                          Bổ nhiệm làm phó nhóm
                        </Text>
                      </TouchableOpacity>
                    )}

                  {/* Hạ cấp phó nhóm xuống thành viên thường */}
                  {isGroupLeader && selectedMember.role === "CO_LEADER" && (
                    <TouchableOpacity
                      className="flex-row items-center py-4 border-t border-gray-200"
                      onPress={() => {
                        setShowMemberInfo(false);
                        Alert.alert(
                          "Hạ cấp phó nhóm",
                          `Bạn có muốn hạ cấp ${selectedMember.fullName} xuống thành viên thường?`,
                          [
                            { text: "Hủy", style: "cancel" },
                            {
                              text: "Hạ cấp",
                              onPress: async () => {
                                try {
                                  setIsUpdating(true);
                                  // Gọi API để cập nhật vai trò thành viên
                                  await groupService.updateMemberRole(
                                    groupId,
                                    selectedMember.userId,
                                    "MEMBER",
                                  );
                                  // Cập nhật lại thông tin nhóm
                                  await fetchGroupDetails();
                                  Alert.alert(
                                    "Thành công",
                                    `Đã hạ cấp ${selectedMember.fullName} xuống thành viên thường`,
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error updating member role:",
                                    error,
                                  );
                                  Alert.alert(
                                    "Lỗi",
                                    "Không thể hạ cấp phó nhóm",
                                  );
                                } finally {
                                  setIsUpdating(false);
                                }
                              },
                            },
                          ],
                        );
                      }}
                    >
                      <ShieldAlert size={20} color="#6B7280" />
                      <Text className="ml-3 text-base">
                        Hạ cấp xuống thành viên
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isGroupLeader &&
                    selectedMember.userId !== currentUser?.userId && (
                      <TouchableOpacity
                        className="flex-row items-center py-4 border-t border-gray-200"
                        onPress={() => {
                          setShowMemberInfo(false);
                          Alert.alert(
                            "Xóa thành viên",
                            `Bạn có chắc chắn muốn xóa ${selectedMember.fullName || "thành viên này"} khỏi nhóm?`,
                            [
                              { text: "Hủy", style: "cancel" },
                              {
                                text: "Xóa",
                                style: "destructive",
                                onPress: async () => {
                                  try {
                                    await groupService.removeMember(
                                      groupId,
                                      selectedMember.userId,
                                    );
                                    fetchGroupDetails();
                                  } catch (error) {
                                    console.error(
                                      "Error removing member:",
                                      error,
                                    );
                                    Alert.alert(
                                      "Lỗi",
                                      "Không thể xóa thành viên",
                                    );
                                  }
                                },
                              },
                            ],
                          );
                        }}
                      >
                        <Trash2 size={20} color="red" />
                        <Text className="ml-3 text-red-500">Xóa khỏi nhóm</Text>
                      </TouchableOpacity>
                    )}
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
