import React from "react";
import { View, TouchableOpacity, Text, Pressable } from "react-native";
import {
  MessageCircle,
  Trash2,
  RefreshCcw,
  Heart,
  Forward,
} from "lucide-react-native";
import { HStack } from "@/components/ui/hstack";
import clsx from "clsx";

interface MessageActionsProps {
  isVisible: boolean;
  isMyMessage: boolean;
  onReaction: () => void;
  onRecall: () => void;
  onDelete: () => void;
  onForward: () => void;
  onClose: () => void;
  position?: "left" | "right";
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  isVisible,
  isMyMessage,
  onReaction,
  onRecall,
  onDelete,
  onForward,
  onClose,
  position = "left",
}) => {
  if (!isVisible) return null;

  return (
    <>
      {/* Overlay để xử lý click outside */}
      <Pressable
        onPress={onClose}
        className="absolute inset-0 w-full h-screen z-10"
      />

      <View
        className={clsx(
          "absolute -bottom-0 bg-white rounded-full shadow-md py-2 px-3 z-50 flex-row items-center ",
          position === "left" ? "left-0" : "right-0",
        )}
      >
        <HStack space="sm">
          <TouchableOpacity
            onPress={() => {
              onReaction();
              onClose();
            }}
            className="px-2 flex-row items-center"
          >
            <Heart size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onForward();
              onClose();
            }}
            className="px-2"
          >
            <Forward size={20} color="#6B7280" />
          </TouchableOpacity>

          {isMyMessage && (
            <TouchableOpacity
              onPress={() => {
                onRecall();
                onClose();
              }}
              className="px-2"
            >
              <RefreshCcw size={20} color="#6B7280" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              onDelete();
              onClose();
            }}
            className="px-2"
          >
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </HStack>
      </View>
    </>
  );
};
