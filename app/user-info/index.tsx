import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import {
  ArrowDownLeft,
  ArrowLeft,
  ChevronLeft,
  Ellipsis,
  Plus,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/Colors";

export default function UserInfoScreen() {
  const insets = useSafeAreaInsets();
  const { userInfo, user } = useAuthStore();
  const posts: any[] = [];

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="relative">
        {/* Cover Image */}
        <Image
          source={{ uri: userInfo?.coverImgUrl }}
          className="w-full h-[230px]"
          resizeMode="cover"
        />

        {/* Header with transparent background */}
        <View
          className="absolute w-full flex-row justify-between p-4"
          style={{ paddingTop: insets.top }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={28} color="white" />
          </TouchableOpacity>
          <View className="flex-row">
            <Ellipsis size={28} color="white" />
          </View>
        </View>

        {/* Profile Picture */}
        <View className="absolute -bottom-16 w-full items-center">
          <Image
            source={{ uri: userInfo?.profilePictureUrl }}
            className="w-32 h-32 rounded-full border-4 border-white"
            resizeMode="cover"
          />
        </View>
      </View>

      {/* User Info */}
      <View className="mt-20 items-center">
        <Text className="text-2xl font-medium text-gray-800">
          {user?.fullName}
        </Text>
      </View>

      {/* Posts or Create Post Button */}
      <View className="px-28 mt-4">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <View key={index} className="mb-4 p-4 bg-gray-100 rounded-lg">
              <Text>{post}</Text>
            </View>
          ))
        ) : (
          <TouchableOpacity
            className={`w-full flex-row items-center justify-center py-2 rounded-full bg-[${Colors.light.PRIMARY_BLUE}]`}
            onPress={() => {}}
          >
            <Text className=" text-white font-medium text-lg">
              Đăng lên Nhật Ký
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
