import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";
import { X, Check, UserPlus, Camera } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { groupService } from "@/services/group-service";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/store/authStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

interface Friend {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  phoneNumber?: string;
  email?: string;
}

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  friends: Friend[];
  onGroupCreated: (groupId: string) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  visible,
  onClose,
  friends,
  onGroupCreated,
}) => {
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();

  // Filter friends based on search query
  const filteredFriends = friends.filter((friend) =>
    friend.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectFriend = (friend: Friend) => {
    if (selectedFriends.some((f) => f.id === friend.id)) {
      setSelectedFriends(selectedFriends.filter((f) => f.id !== friend.id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Cần quyền truy cập thư viện ảnh để chọn ảnh đại diện nhóm");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setGroupAvatar(result.assets[0].uri);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert("Vui lòng nhập tên nhóm");
      return;
    }

    if (selectedFriends.length === 0) {
      alert("Vui lòng chọn ít nhất một thành viên");
      return;
    }

    setIsLoading(true);

    try {
      // Create group with initial members
      const initialMembers = selectedFriends.map((friend) => {
        return {
          userId: friend.id,
          addedById: user?.userId || "",
        };
      });

      const newGroup = await groupService.createGroup({
        creatorId: user?.userId || "",
        name: groupName,
        initialMembers,
      });

      if (newGroup && groupAvatar) {
        // Upload group avatar if selected
        const formData = new FormData();
        formData.append("file", {
          uri: groupAvatar,
          type: "image/jpeg",
          name: "group_avatar.jpg",
        } as any);

        await groupService.updateGroupAvatar(newGroup.id, formData);
      }

      if (newGroup) {
        onGroupCreated(newGroup.id);
      }

      // Reset form
      setGroupName("");
      setSelectedFriends([]);
      setGroupAvatar(null);
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Không thể tạo nhóm. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-transparent">
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
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={"white"} />
            </TouchableOpacity>
            <Text className="text-lg text-white font-semibold">
              Tạo nhóm mới
            </Text>
            <TouchableOpacity
              onPress={handleCreateGroup}
              disabled={
                isLoading || !groupName.trim() || selectedFriends.length === 0
              }
              className={`${!groupName.trim() || selectedFriends.length === 0 ? "opacity-50" : ""}`}
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.light.PRIMARY_BLUE}
                />
              ) : (
                <Check size={24} color={"white"} />
              )}
            </TouchableOpacity>
          </HStack>
        </LinearGradient>

        {/* Group Info */}
        <VStack className="p-4 space-y-4">
          <HStack className="items-center space-x-4">
            <TouchableOpacity onPress={handlePickImage} className="relative">
              {groupAvatar ? (
                <Avatar size="xl">
                  <AvatarImage source={{ uri: groupAvatar }} />
                </Avatar>
              ) : (
                <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center">
                  <UserPlus size={32} color={Colors.light.PRIMARY_BLUE} />
                </View>
              )}
              <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                <Camera size={16} color="white" />
              </View>
            </TouchableOpacity>

            <TextInput
              className="flex-1 p-3 border border-gray-300 rounded-lg"
              placeholder="Nhập tên nhóm"
              value={groupName}
              onChangeText={setGroupName}
            />
          </HStack>

          {/* Selected Friends */}
          {selectedFriends.length > 0 && (
            <View>
              <Text className="text-sm font-medium mb-2">
                Đã chọn ({selectedFriends.length})
              </Text>
              <FlatList
                horizontal
                data={selectedFriends}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectFriend(item)}
                    className="mr-3 items-center"
                  >
                    <View className="relative">
                      <Avatar size="md">
                        {item.avatarUrl ? (
                          <AvatarImage source={{ uri: item.avatarUrl }} />
                        ) : (
                          <AvatarFallbackText>
                            {item.fullName}
                          </AvatarFallbackText>
                        )}
                      </Avatar>
                      <View className="absolute top-0 right-0 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                        <X size={12} color="white" />
                      </View>
                    </View>
                    <Text className="text-xs mt-1" numberOfLines={1}>
                      {item.fullName}
                    </Text>
                  </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
                className="pb-2"
              />
            </View>
          )}

          {/* Search */}
          <TextInput
            className="p-3 border border-gray-300 rounded-lg"
            placeholder="Tìm kiếm bạn bè"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Friends List */}
          <FlatList
            data={filteredFriends}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectFriend(item)}
                className="flex-row items-center py-2 border-b border-gray-100"
              >
                <Avatar size="md">
                  {item.avatarUrl ? (
                    <AvatarImage source={{ uri: item.avatarUrl }} />
                  ) : (
                    <AvatarFallbackText>{item.fullName}</AvatarFallbackText>
                  )}
                </Avatar>
                <Text className="flex-1 ml-3">{item.fullName}</Text>
                <View
                  className={`w-6 h-6 rounded-full border-2 ${selectedFriends.some((f) => f.id === item.id) ? "bg-blue-500 border-blue-500" : "border-gray-300"} items-center justify-center`}
                >
                  {selectedFriends.some((f) => f.id === item.id) && (
                    <Check size={16} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-8">
                <Text className="text-gray-500">Không tìm thấy bạn bè</Text>
              </View>
            }
          />
        </VStack>
      </View>
    </Modal>
  );
};

export default CreateGroupModal;
