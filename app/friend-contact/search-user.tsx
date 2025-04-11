import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Search, X } from "lucide-react-native";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { LinearGradient } from "expo-linear-gradient";

export default function SearchUserScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // TODO: Implement actual API call here
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock result
    if (searchQuery === "test@example.com" || searchQuery === "0123456789") {
      setSearchResult({
        id: "1",
        fullName: "Test User",
        avatarUrl: null,
        isFriend: false,
      });
    } else {
      setSearchResult(null);
    }
    setIsSearching(false);
  };

  const handleAddFriend = () => {
    // TODO: Implement send friend request
    console.log("Send friend request to:", searchResult.id);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={["#297eff", "#228eff", "#00d4ff"]}
      >
        <View
          style={{ paddingTop: Platform.OS === "ios" ? insets.top : 16 }}
          className="bg-transparent border-b border-gray-200"
        >
          <HStack className="px-4 pb-2.5 items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-1 ml-4">
              <HStack className="bg-gray-100 rounded-full items-center px-4 py-2.5">
                <Search size={20} color="gray" />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="Nhập email hoặc số điện thoại..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <X size={20} color="gray" />
                  </TouchableOpacity>
                )}
              </HStack>
            </View>
          </HStack>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView className="flex-1 px-4">
        {isSearching ? (
          <Text className="text-center py-8 text-gray-500">
            Đang tìm kiếm...
          </Text>
        ) : searchResult ? (
          <View className="py-4">
            <HStack className="items-center justify-between">
              <HStack className="items-center flex-1">
                <Avatar size="lg">
                  <AvatarFallbackText>
                    {searchResult.fullName}
                  </AvatarFallbackText>
                  {searchResult.avatarUrl && (
                    <AvatarImage source={{ uri: searchResult.avatarUrl }} />
                  )}
                </Avatar>
                <VStack className="ml-4">
                  <Text className="text-lg font-medium">
                    {searchResult.fullName}
                  </Text>
                </VStack>
              </HStack>
              {!searchResult.isFriend && (
                <TouchableOpacity
                  onPress={handleAddFriend}
                  className="bg-blue-500 px-4 py-2 rounded-full"
                >
                  <Text className="text-white font-medium">Kết bạn</Text>
                </TouchableOpacity>
              )}
            </HStack>
          </View>
        ) : searchQuery.length > 0 ? (
          <Text className="text-center py-8 text-gray-500">
            Không tìm thấy người dùng
          </Text>
        ) : (
          <Text className="text-center py-8 text-gray-500">
            Nhập email hoặc số điện thoại để tìm kiếm
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
