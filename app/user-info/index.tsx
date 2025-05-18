import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, Ellipsis, Image as ImageIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/Colors";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Menu,
  MenuItem,
  MenuItemLabel,
  MenuSeparator,
} from "@/components/ui/menu";
import {
  updateCoverImage,
  updateProfilePicture,
} from "@/services/user-service";

export default function UserInfoScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const userInfo = useAuthStore((state) => state.userInfo);
  const posts: any[] = [];

  const handlePickImage = async (type: "profile" | "cover") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Ứng dụng cần quyền truy cập thư viện ảnh!");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === "profile" ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const formData = new FormData();

        // Xác định MIME type dựa trên phần mở rộng file
        const extension = asset.uri?.split(".")?.pop()?.toLowerCase() ?? "jpg";
        const mimeType = extension === "png" ? "image/png" : "image/jpeg";
        const fileName = `${type === "profile" ? "profile" : "cover"}-image.${extension}`;

        formData.append("file", {
          uri: asset.uri,
          type: mimeType,
          name: fileName,
        } as any);

        try {
          if (type === "profile") {
            await updateProfilePicture(formData);
          } else {
            await updateCoverImage(formData);
          }
          Alert.alert("Thành công", "Cập nhật ảnh thành công");
          await useAuthStore.getState().fetchUserInfo();
        } catch (error: any) {
          if (error.response?.data?.message) {
            Alert.alert("Lỗi", error.response.data.message);
          } else {
            Alert.alert("Lỗi", `Không thể cập nhật ảnh: ${error.message}`);
          }
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại sau.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="relative">
        {/* Cover Image */}
        {userInfo?.coverImgUrl ? (
          <Image
            source={{ uri: userInfo?.coverImgUrl }}
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
          <View className="flex-row">
            <Menu
              placement="bottom"
              selectionMode="single"
              trigger={({ ...triggerProps }) => {
                return (
                  <TouchableOpacity {...triggerProps}>
                    <Ellipsis size={32} color="white" />
                  </TouchableOpacity>
                );
              }}
              className="w-[180px]"
            >
              <MenuItem
                key="Profile"
                textValue="Profile"
                className="px-2.5 py-2"
                onPress={() => {
                  router.push("/user-info/edit-info");
                }}
              >
                <MenuItemLabel size="lg">Thông tin cá nhân</MenuItemLabel>
              </MenuItem>
              <MenuItem
                key="Avatar"
                textValue="Avatar"
                className="px-2.5 py-2"
                onPress={() => {
                  handlePickImage("profile");
                }}
              >
                <MenuItemLabel size="lg">Đổi ảnh đại diện</MenuItemLabel>
              </MenuItem>
              <MenuItem
                key="Cover"
                textValue="Cover"
                className="px-2.5 py-2"
                onPress={() => {
                  handlePickImage("cover");
                }}
              >
                <MenuItemLabel size="lg">Đổi ảnh bìa</MenuItemLabel>
              </MenuItem>
            </Menu>
          </View>
        </View>

        <View className="absolute -bottom-16 w-full items-center">
          <Avatar size="2xl">
            <AvatarFallbackText>{user?.fullName}</AvatarFallbackText>
            {userInfo?.profilePictureUrl && (
              <AvatarImage source={{ uri: userInfo.profilePictureUrl }} />
            )}
          </Avatar>
        </View>
      </View>

      {/* User Info */}
      <View className="mt-20 items-center">
        <Text className="text-2xl font-medium text-gray-800">
          {user?.fullName}
        </Text>

        {/* Bio Field */}
        <View className="mt-2 px-8">
          <Text className="text-center text-gray-600 text-sm">
            {userInfo?.bio}
            {/* Xin chào, tôi đang sử dụng ứng dụng Vodka để kết nối với bạn bè và người thân. */}
          </Text>
        </View>

        {/* Status Badge */}
        <View className="mt-3">
          <Text className="text-xs text-blue-500 px-3 py-1 bg-blue-50 rounded-full">
            Đang hoạt động
          </Text>
        </View>
      </View>

      {/* Upcoming Features Notice */}
      <View className="mx-6 mt-6 bg-blue-50 rounded-xl p-4">
        <Text className="text-sm font-medium text-blue-700 mb-2">
          Tính năng sắp ra mắt:
        </Text>
        <View>
          <Text className="text-xs text-gray-700 mb-1.5">
            • Chia sẻ bài viết lên nhật ký
          </Text>
          <Text className="text-xs text-gray-700 mb-1.5">• Call video</Text>
          <Text className="text-xs text-gray-700 mb-1.5">
            • Tùy chỉnh giao diện trang cá nhân
          </Text>
          <Text className="text-xs text-gray-700">
            • Tạo album ảnh và video
          </Text>
        </View>
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
