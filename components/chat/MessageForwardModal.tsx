import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { getFriendList, Friend } from "@/services/friend-service";
import { messageService } from "@/services/message-service";
import { Check } from "lucide-react-native";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
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
}

export const MessageForwardModal: React.FC<MessageForwardModalProps> = ({
  isOpen,
  onClose,
  messageId,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen]);

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const friendList = await getFriendList();
      setFriends(friendList);
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

          {isLoading ? (
            <ActivityIndicator size="large" className="my-4" />
          ) : (
            <ScrollView className="max-h-96">
              <VStack space="md">
                {friends.map((friend) => (
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
                ))}
              </VStack>
            </ScrollView>
          )}

          <TouchableOpacity
            onPress={handleForward}
            disabled={selectedFriends.size === 0 || isForwarding}
            className="mt-4 bg-blue-500 p-3 rounded-full mx-12 items-center justify-center"
          >
            <Text className="text-white font-medium text-lg">
              {isForwarding ? "Đang chuyển tiếp..." : `Chuyển tiếp `}
            </Text>
          </TouchableOpacity>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
};
