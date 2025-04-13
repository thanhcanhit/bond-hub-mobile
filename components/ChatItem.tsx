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
  email: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
  infoId: string | null;
  onPress?: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  id,
  email,
  phoneNumber,
  createdAt,
  updatedAt,
  infoId,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/chat/${id}`)}
      className="items-center px-2.5"
    >
      <HStack className="w-full items-center justify-between">
        <Avatar size="lg">
          <AvatarFallbackText>
            {email || phoneNumber || "User"}
          </AvatarFallbackText>
        </Avatar>

        <VStack className="w-5/6 pl-2 py-4 border-b-[0.5px] border-gray-200">
          <HStack className="justify-between">
            <Text className="font-semibold text-lg" numberOfLines={1}>
              {email || phoneNumber || "Unknown User"}
            </Text>
            <Text className="text-gray-500">{formatDate(createdAt)}</Text>
          </HStack>

          <HStack>
            <Text className="text-gray-500 pt-1" numberOfLines={1}>
              ID: {id.slice(0, 8)}...
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
};

export default ChatItem;
