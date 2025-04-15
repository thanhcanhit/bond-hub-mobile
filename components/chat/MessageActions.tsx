import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Trash2, RefreshCcw, Heart, Forward } from "lucide-react-native";
import { VStack } from "../ui/vstack";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "../ui/select/select-actionsheet";

interface MessageActionsProps {
  isVisible: boolean;
  isMyMessage: boolean;
  onReaction: () => void;
  onRecall: () => void;
  onDelete: () => void;
  onForward: () => void;
  onClose: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  isVisible,
  isMyMessage,
  onReaction,
  onRecall,
  onDelete,
  onForward,
  onClose,
}) => {
  return (
    <Actionsheet isOpen={isVisible} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-4 pb-6">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <View className="w-full">
          <Text className="text-xl font-bold text-center mb-4 pt-2">
            Tùy chọn tin nhắn
          </Text>

          <VStack space="md" className="mt-2">
            <TouchableOpacity
              onPress={() => {
                onReaction();
                onClose();
              }}
              className="px-3 py-3 flex-row items-center  rounded-lg"
            >
              <View className="bg-blue-50 p-2 rounded-full mr-3">
                <Heart size={22} color="#297eff" />
              </View>
              <Text className="text-base font-medium">Thả cảm xúc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onForward();
                onClose();
              }}
              className="px-3 py-3 flex-row items-center  rounded-lg"
            >
              <View className="bg-blue-50 p-2 rounded-full mr-3">
                <Forward size={22} color="#297eff" />
              </View>
              <Text className="text-base font-medium">Chuyển tiếp</Text>
            </TouchableOpacity>

            {isMyMessage && (
              <TouchableOpacity
                onPress={() => {
                  onRecall();
                  onClose();
                }}
                className="px-3 py-3 flex-row items-center  rounded-lg"
              >
                <View className="bg-blue-50 p-2 rounded-full mr-3">
                  <RefreshCcw size={22} color="#297eff" />
                </View>
                <Text className="text-base font-medium">Thu hồi</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => {
                onDelete();
                onClose();
              }}
              className="px-3 py-3 flex-row items-center  rounded-lg"
            >
              <View className="bg-red-50 p-2 rounded-full mr-3">
                <Trash2 size={22} color="#EF4444" />
              </View>
              <Text className="text-base font-medium text-red-500">
                Xóa tin nhắn
              </Text>
            </TouchableOpacity>
          </VStack>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
};
