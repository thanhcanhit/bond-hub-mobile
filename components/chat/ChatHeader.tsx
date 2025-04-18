import React, { useState } from "react";
import { View, TouchableOpacity, Text, Platform } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  ArrowLeft,
  Phone,
  Video,
  Search,
  Logs,
  Users,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ChatHeaderProps, GroupInfo } from "@/types";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { useUserStatusStore } from "@/store/userStatusStore";
import GroupDetailsModal from "../GroupDetailsModal";
import { useRouter } from "expo-router";
import { groupService } from "@/services/group-service";
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
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatId,
  name,
  avatarUrl,
  isGroup,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const isOnline = useUserStatusStore((state) => state.isUserOnline(chatId));
  const userStatus = useUserStatusStore((state) => state.getUserStatus(chatId));
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);

  React.useEffect(() => {
    if (isGroup) {
      groupService.getGroupInfo(chatId).then((info) => {
        setGroupInfo(info);
      });
    }
  }, [isGroup, chatId]);

  const getStatusText = () => {
    if (isGroup) return `Số thành viên: ${groupInfo?.memberCount}`; // Không hiển thị trạng thái cho group
    if (isOnline && !isGroup) return "Đang hoạt động";
    if (!userStatus?.timestamp) return "Không hoạt động";
    return `${formatLastSeen(userStatus.timestamp.toISOString())}`;
  };

  const getStatusColor = () => {
    if (isGroup) return "bg-transparent";
    return isOnline ? "bg-green-500" : "bg-gray-400";
  };

  const handleLeaveGroup = () => {
    // Navigate back to conversation list
    router.replace("/");
  };

  const handleDeleteGroup = () => {
    // Navigate back to conversation list
    router.replace("/");
  };
  return (
    <LinearGradient
      start={{ x: 0.03, y: 0 }}
      end={{ x: 0.99, y: 2.5 }}
      colors={["#297eff", "#228eff", "#00d4ff"]}
    >
      <View
        className="flex-row items-center justify-between px-4 py-2"
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 5,
        }}
      >
        <HStack className="items-center justify-between w-full">
          <HStack className="items-center flex-1">
            <TouchableOpacity onPress={onBack}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>

            <VStack className="pl-2.5">
              <Text
                className="text-lg font-semibold text-white mr-2.5"
                numberOfLines={1}
              >
                {name}
              </Text>
              <HStack className="items-center">
                {!isGroup && (
                  <View
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusColor()}`}
                  />
                )}
                <Text className="text-xs text-gray-200">{getStatusText()}</Text>
              </HStack>
            </VStack>
          </HStack>
          <HStack className="space-x-4">
            {!isGroup ? (
              <>
                <TouchableOpacity className="px-2.5">
                  <Phone size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="px-2.5">
                  <Video size={25} color="white" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  className="px-2.5"
                  onPress={() => setShowGroupDetails(true)}
                >
                  <Users size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="px-2.5">
                  <Search size={24} color="white" />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity className="pl-2.5">
              <Logs size={24} color="white" />
            </TouchableOpacity>
          </HStack>
        </HStack>
      </View>

      {/* Group Details Modal */}
      {isGroup && (
        <GroupDetailsModal
          visible={showGroupDetails}
          onClose={() => setShowGroupDetails(false)}
          groupId={chatId}
          onLeaveGroup={handleLeaveGroup}
          onDeleteGroup={handleDeleteGroup}
        />
      )}
    </LinearGradient>
  );
};
