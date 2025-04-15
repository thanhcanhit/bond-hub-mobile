import React from "react";
import { HStack } from "./ui/hstack";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";
import { Text, TouchableOpacity, View } from "react-native";
import { VStack } from "./ui/vstack";
import { useUserStatusStore } from "@/store/userStatusStore";
import { useRouter } from "expo-router";

// Comment interface cũ
/*
interface ChatItemProps {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  avatarUrl?: string;
  isGroup?: boolean;
  isMuted?: boolean;
  unreadCount?: number;
  onPress?: () => void;
}
*/

// Interface mới theo dữ liệu getAllUsers
interface ChatItemProps {
  id: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  profilePictureUrl: string;
  statusMessage: string;
  lastSeen: string;
  since: string;
  isGroup?: boolean;
  hasNewMessages?: boolean; // Thêm prop mới
  onPress?: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  id,
  fullName,
  profilePictureUrl,
  statusMessage,
  lastSeen,
  since,
  hasNewMessages = false, // Giá trị mặc định là false
  onPress,
}) => {
  const router = useRouter();
  const isOnline = useUserStatusStore((state) => state.isUserOnline(id));
  const userStatus = useUserStatusStore((state) => state.getUserStatus(id));

  const getStatusColor = () => {
    return isOnline ? "bg-green-500" : "bg-gray-400";
  };

  const getStatusText = () => {
    if (isOnline) return "Đang hoạt động";
    if (!userStatus?.timestamp) return formatLastSeen(lastSeen);
    return `${formatLastSeen(userStatus.timestamp.toISOString())}`;
  };

  const formatLastSeen = (lastSeenDate: string) => {
    const date = new Date(lastSeenDate);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffMinutes < 1) return "Vừa mới truy cập";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    return date.toLocaleDateString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: `../chat/${id}`,
          params: { fullName, profilePictureUrl },
        });
      }}
      className="items-center px-2.5"
    >
      <HStack className="w-full items-center justify-between">
        <View className="relative">
          <Avatar size="lg">
            {profilePictureUrl ? (
              <AvatarImage source={{ uri: profilePictureUrl }} />
            ) : (
              <AvatarFallbackText>{fullName}</AvatarFallbackText>
            )}
          </Avatar>
          {/* Online status indicator */}
          <View
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor()}`}
          />
        </View>

        <VStack className="w-5/6 pl-2 py-4 border-b-[0.5px] border-gray-200">
          <HStack className="justify-between">
            <HStack className="items-center">
              <Text className="font-semibold text-lg" numberOfLines={1}>
                {fullName}
              </Text>
              {/* Notification dot */}
              {hasNewMessages && (
                <View className="w-2 h-2 rounded-full bg-red-500 ml-2" />
              )}
            </HStack>

            {/* Status Button */}
            <TouchableOpacity
              className={`px-2 py-1 rounded-full flex-row items-center ${
                isOnline ? "bg-green-100" : "bg-white"
              }`}
            >
              <View
                className={`w-2 h-2 rounded-full mr-1.5 ${getStatusColor()}`}
              />
              <Text
                className={`text-xs ${
                  isOnline ? "text-green-700" : "text-gray-600"
                }`}
              >
                {getStatusText()}
              </Text>
            </TouchableOpacity>
          </HStack>

          <HStack>
            <Text className="text-gray-500 pt-1" numberOfLines={1}>
              {statusMessage}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
};

export default ChatItem;
