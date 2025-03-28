import React from "react";
import { HStack } from "./ui/hstack";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";
import { Text, TouchableOpacity } from "react-native";
import { VStack } from "./ui/vstack";
import { BellOff, CircleIcon } from "lucide-react-native";

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

const ChatItem: React.FC<ChatItemProps> = ({
  name,
  lastMessage = "",
  lastMessageTime = "",
  avatarUrl,
  isGroup = false,
  isMuted = false,
  unreadCount = 0,
  onPress,
}) => {
  // Hàm xử lý hiển thị thời gian
  const formatTime = (timeString: string) => {
    if (!timeString) return "";

    const date = new Date(timeString);
    const now = new Date();

    // Nếu cùng ngày
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Nếu trong cùng tuần
    const daysDiff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <TouchableOpacity onPress={onPress} className="items-center h-20 px-2">
      <HStack className="w-full items-center justify-between">
        {/* Avatar */}
        <Avatar size="md">
          <AvatarFallbackText>{name}</AvatarFallbackText>
          {avatarUrl && <AvatarImage source={{ uri: avatarUrl }} />}
        </Avatar>

        <VStack className="w-5/6  py-2.5 border-b-[1px] border-gray-300">
          <HStack className="justify-between">
            <Text className="font-semibold text-lg" numberOfLines={1}>
              {name}
            </Text>
            <HStack className="items-center ">
              {isMuted && <BellOff size={16} color="gray" />}
              <Text className="text-gray-500 pl-2">
                {formatTime(lastMessageTime)}
              </Text>
            </HStack>
          </HStack>

          <HStack>
            <Text className="text-gray-500 pt-1" numberOfLines={1}>
              {lastMessage}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
};

export default ChatItem;
