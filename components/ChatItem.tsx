import React from "react";
import { HStack } from "./ui/hstack";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";
import { Text, TouchableOpacity } from "react-native";
import { VStack } from "./ui/vstack";
import { BellOff, CircleIcon } from "lucide-react-native";
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
  onPress?: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  id,
  fullName,
  profilePictureUrl,
  statusMessage,
  lastSeen,
  since,
  onPress,
}) => {
  const router = useRouter();

  // Comment hàm cũ
  /*
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    const daysDiff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };
  */

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
        <Avatar size="lg">
          {profilePictureUrl ? (
            <AvatarImage source={{ uri: profilePictureUrl }} />
          ) : (
            <AvatarFallbackText>{fullName}</AvatarFallbackText>
          )}
        </Avatar>

        <VStack className="w-5/6 pl-2 py-4 border-b-[0.5px] border-gray-200">
          <HStack className="justify-between">
            <Text className="font-semibold text-lg" numberOfLines={1}>
              {fullName}
            </Text>
            <VStack>
              {/* <Text className="text-gray-500">{formatDate(since)}</Text> /* Đã gửi tin nhắn */}
              <Text className="text-xs text-gray-400 ml-2">
                {formatLastSeen(lastSeen)}
              </Text>
            </VStack>
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
