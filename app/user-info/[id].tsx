import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  MessageCircle,
  UserPlus,
  UserCheck,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import * as userService from "@/services/user-service";
import { HStack } from "@/components/ui/hstack";

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isPendingRequest, setIsPendingRequest] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, [id]);

  const fetchUserInfo = async () => {
    if (!id || typeof id !== "string") {
      setError("ID người dùng không hợp lệ");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching user profile for ID:", id);
      setIsLoading(true);
      setError(null);
      const userData = await userService.getUserProfile(id);
      setUserProfile(userData);

      // Kiểm tra trạng thái bạn bè và lời mời kết bạn từ dữ liệu API
      console.log("User profile data:", JSON.stringify(userData));
      // Kiểm tra nếu có relationship và status là FRIEND
      setIsFriend(userData.relationship?.status === "FRIEND");
      // Kiểm tra nếu có relationship và status là PENDING
      setIsPendingRequest(userData.relationship?.status === "PENDING");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (userProfile?.id) {
      router.push({
        pathname: "/chat/[id]",
        params: { id: userProfile.id },
      });
    }
  };

  const handleAddFriend = () => {
    if (!userProfile?.id) return;

    // Implement send friend request with introduce
    Alert.prompt(
      "Lời giới thiệu",
      "Nhập lời giới thiệu để gửi lời mời kết bạn",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Gửi",
          onPress: (introduce) => {
            console.log(
              "Send friend request to:",
              userProfile.id,
              "with introduce:",
              introduce,
            );
            // TODO: Call API to send friend request
            // API endpoint: POST /friends/request
            // Body: { receiverId: userProfile.id, introduce: introduce }
            // Trong trường hợp thực tế, bạn sẽ gọi API để gửi lời mời kết bạn
            setIsPendingRequest(true);
          },
        },
      ],
      "plain-text",
    );
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color={Colors.light.PRIMARY_BLUE} />
          <Text className="text-gray-500 mt-2">Đang tải thông tin...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-red-500">{error}</Text>
          <TouchableOpacity
            onPress={fetchUserInfo}
            style={{
              marginTop: 16, // mt-4
              backgroundColor: "#EBF5FF", // bg-blue-50 equivalent
              paddingHorizontal: 16, // px-4
              paddingVertical: 8, // py-2
              borderRadius: 9999, // rounded-full
            }}
          >
            <Text style={{ color: "#3B82F6" }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View className="relative">
            {/* Cover Image */}
            {userProfile?.userInfo?.coverImgUrl ? (
              <Image
                source={{ uri: userProfile.userInfo.coverImgUrl }}
                className="w-full h-[280px]"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-[280px] bg-gray-300" />
            )}

            {/* Header with transparent background */}
            <View
              className="absolute w-full flex-row justify-between p-4"
              style={{ paddingTop: insets.top }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={28} color="white" />
              </TouchableOpacity>
            </View>

            <View className="absolute -bottom-16 w-full items-center">
              <Avatar size="2xl">
                <AvatarFallbackText>
                  {userProfile?.userInfo?.fullName || "User"}
                </AvatarFallbackText>
                {userProfile?.userInfo?.profilePictureUrl && (
                  <AvatarImage
                    source={{ uri: userProfile.userInfo.profilePictureUrl }}
                  />
                )}
              </Avatar>
            </View>
          </View>

          {/* User Info */}
          <View className="mt-20 items-center">
            <Text className="text-2xl font-medium text-gray-800">
              {userProfile?.userInfo?.fullName || "Người dùng"}
            </Text>
            {userProfile?.userInfo?.bio && (
              <Text className="text-gray-500 mt-2 px-4 text-center">
                {userProfile.userInfo.bio}
              </Text>
            )}
          </View>

          {/* Status message */}
          <View className="mt-4 items-center">
            <Text className="text-gray-500 text-center px-8">
              Bạn chưa thể xem nhật ký của{" "}
              {userProfile?.userInfo?.fullName || "người dùng này"} khi chưa là
              bạn bè
            </Text>
          </View>

          {/* Action Buttons */}
          <HStack className="mt-6 px-4 justify-center space-x-4">
            {isFriend ? (
              <TouchableOpacity
                className="flex-1 bg-blue-500 py-2.5 rounded-full items-center"
                onPress={handleSendMessage}
              >
                <HStack className="items-center space-x-2">
                  <MessageCircle size={24} color="white" />
                  <Text className="text-white font-medium">Nhắn tin</Text>
                </HStack>
              </TouchableOpacity>
            ) : isPendingRequest ? (
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-2.5 rounded-full items-center"
                disabled={true}
              >
                <HStack className="items-center space-x-2">
                  <UserCheck size={24} color="gray" />
                  <Text className="text-gray-500 font-medium">
                    Đã gửi lời mời
                  </Text>
                </HStack>
              </TouchableOpacity>
            ) : (
              <HStack className="w-full justify-center space-x-2">
                {/* Nút nhắn tin - chiếm 8 phần */}
                <TouchableOpacity
                  style={{ flex: 9 }}
                  className="bg-blue-100 py-2.5 rounded-full items-center justify-center"
                  onPress={handleSendMessage}
                >
                  <HStack className="items-center space-x-2 mx-5">
                    <MessageCircle size={24} color="#3B82F6" />
                    <Text className="text-blue-500 font-medium">Nhắn tin</Text>
                  </HStack>
                </TouchableOpacity>

                {/* Nút kết bạn - chiếm 2 phần */}
                <TouchableOpacity
                  style={{ flex: 2 }}
                  className="bg-blue-50 ml-1 py-2.5 rounded-full items-center justify-center"
                  onPress={handleAddFriend}
                >
                  <HStack className="items-center space-x-2">
                    <UserPlus size={24} color="black" />
                  </HStack>
                </TouchableOpacity>
              </HStack>
            )}
          </HStack>

          {/* Suggested Friends Section */}
          <View className="mt-8 px-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-medium">Có thể bạn quen</Text>
              <TouchableOpacity>
                <Text className="text-blue-500">Xem thêm</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3, 4].map((item) => (
                <View key={item} className="mr-4 items-center w-24">
                  <TouchableOpacity className="relative">
                    <Avatar size="lg">
                      <AvatarFallbackText>User {item}</AvatarFallbackText>
                    </Avatar>
                    <TouchableOpacity className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                      <Text className="text-gray-500">×</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                  <Text className="text-center mt-2 text-sm" numberOfLines={2}>
                    Nguyễn Thị {item}
                  </Text>
                  <TouchableOpacity className="mt-2 bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-500 text-xs">Kết bạn</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </ScrollView>
  );
}
