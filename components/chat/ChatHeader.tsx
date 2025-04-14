import React from "react";
import { View, TouchableOpacity, Text, Platform } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { ArrowLeft, Phone, Video, Search, Logs } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ChatHeaderProps } from "@/types";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatarUrl,
  isGroup,
  onBack,
}) => {
  const insets = useSafeAreaInsets();

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
              <Text className="text-xs text-gray-200">Online</Text>
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
                <TouchableOpacity className="px-2.5">
                  <Video size={24} color="white" />
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
    </LinearGradient>
  );
};
