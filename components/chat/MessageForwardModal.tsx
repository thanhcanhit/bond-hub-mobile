import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import { getFriendList, Friend } from "@/services/friend-service";
import { messageService } from "@/services/message-service";
import { Check, Search } from "lucide-react-native";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";

import { useAuthStore } from "@/store/authStore";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "../ui/select/select-actionsheet";

interface MessageForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
  currentRecipientId?: string; // ID của người đang nhắn tin với mình
}

export const MessageForwardModal: React.FC<MessageForwardModalProps> = ({
  isOpen,
  onClose,
  messageId,
  currentRecipientId,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
      // Reset search and selection when modal opens
      setSearchQuery("");
      setSelectedFriends(new Set());
    }
  }, [isOpen]);

  // Filter friends based on search query
  useEffect(() => {
    if (friends.length > 0) {
      const query = searchQuery.toLowerCase().trim();
      if (query === "") {
        setFilteredFriends(friends);
      } else {
        const filtered = friends.filter((friend) =>
          friend.friend.userInfo.fullName?.toLowerCase().includes(query),
        );
        setFilteredFriends(filtered);
      }
    }
  }, [friends, searchQuery]);

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const friendList = await getFriendList();

      // Filter out the current user and current recipient from the friend list
      const filteredList = friendList.filter(
        (friend) =>
          friend.friend.id !== currentUser?.userId &&
          (currentRecipientId ? friend.friend.id !== currentRecipientId : true),
      );

      setFriends(filteredList);
      setFilteredFriends(filteredList);
    } catch (err) {
      console.error("Error loading friends:", err);
      setError("Không thể tải danh sách bạn bè");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleForward = async () => {
    if (selectedFriends.size === 0) return;

    try {
      setIsForwarding(true);
      setError(null);

      await messageService.forwardMessage({
        messageId,
        targets: Array.from(selectedFriends).map((userId) => ({
          // Đổi từ 'recipients' thành 'targets'

          userId,
        })),
      });

      onClose();
    } catch (err) {
      console.error("Error forwarding message:", err);
      setError("Không thể chuyển tiếp tin nhắn");
    } finally {
      setIsForwarding(false);
    }
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-4 pb-6 ">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <View className="w-full">
          <Text className="text-xl font-bold text-center mb-4 pt-2">
            Chuyển tiếp tin nhắn
          </Text>

          {error && (
            <Text className="text-red-500 text-center mb-2">{error}</Text>
          )}

          {/* Thanh tìm kiếm */}
          <View className="mb-4 px-2 flex-row items-center border border-gray-300 rounded-full overflow-hidden">
            <Search size={20} color="#6B7280" className="ml-2" />
            <TextInput
              className="flex-1 py-2 px-3 text-base"
              placeholder="Tìm kiếm bạn bè..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" className="my-4" />
          ) : (
            <ScrollView className="max-h-96">
              <VStack space="md">
                {filteredFriends.length === 0 ? (
                  <Text className="text-center text-gray-500 py-4">
                    {searchQuery
                      ? "Không tìm thấy bạn bè nào"
                      : "Bạn chưa có bạn bè nào"}
                  </Text>
                ) : (
                  filteredFriends.map((friend) => (
                    <TouchableOpacity
                      key={friend.friend.id}
                      onPress={() => toggleFriendSelection(friend.friend.id)}
                      className="flex-row items-center p-2 rounded-lg"
                    >
                      <HStack space="md" className="items-center flex-1">
                        <Avatar size="md">
                          {friend.friend.userInfo.profilePictureUrl ? (
                            <AvatarImage
                              source={{
                                uri: friend.friend.userInfo.profilePictureUrl,
                              }}
                            />
                          ) : (
                            <AvatarFallbackText>
                              {friend.friend.userInfo.fullName
                                ?.slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallbackText>
                          )}
                        </Avatar>
                        <Text className="flex-1 text-base">
                          {friend.friend.userInfo.fullName}
                        </Text>
                        {selectedFriends.has(friend.friend.id) && (
                          <Check color={"#297eff"} size={24} />
                        )}
                      </HStack>
                    </TouchableOpacity>
                  ))
                )}
              </VStack>
            </ScrollView>
          )}

          <TouchableOpacity
            onPress={handleForward}
            disabled={selectedFriends.size === 0 || isForwarding}
            className={`mt-4 p-3 rounded-full mx-12 items-center justify-center ${selectedFriends.size > 0 ? "bg-blue-500" : "bg-gray-400"}`}
          >
            <Text className="text-white font-medium text-lg">
              {isForwarding
                ? "Đang chuyển tiếp..."
                : selectedFriends.size > 0
                  ? `Chuyển tiếp (${selectedFriends.size})`
                  : "Chuyển tiếp"}
            </Text>
          </TouchableOpacity>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
};
