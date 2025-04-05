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
import { Button, ButtonText } from "@/components/ui/button";
import {
  updateCoverImage,
  updateProfilePicture,
} from "@/services/user-service";

export default function UserInfoScreen() {
  const insets = useSafeAreaInsets();
  const { userInfo, user } = useAuthStore();
  const posts: any[] = [];
  const [showMenu, setShowMenu] = useState(false);

  const handlePickImage = async (type: "profile" | "cover") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === "profile" ? [1, 1] : [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
          Alert.alert("Lỗi", "Kích thước ảnh không được vượt quá 10MB");
          return;
        }

        const formData = new FormData();
        const file = {
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          name: asset.fileName || "image.jpg",
          size: asset.fileSize,
        };
        formData.append("file", file as any);

        try {
          if (type === "profile") {
            await updateProfilePicture(formData);
          } else {
            await updateCoverImage(formData);
          }
          Alert.alert("Thành công", "Cập nhật ảnh thành công");
        } catch (error: any) {
          if (error.response?.data?.message) {
            Alert.alert("Lỗi", error.response.data.message);
          } else {
            Alert.alert("Lỗi", "Không thể cập nhật ảnh. Vui lòng thử lại sau.");
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
            <Menu
              placement="bottom"
              selectionMode="single"
              trigger={({ ...triggerProps }) => {
                return (
                  <TouchableOpacity {...triggerProps}>
                    <Ellipsis size={28} color="white" />
                  </TouchableOpacity>
                );
              }}
            >
              <MenuSeparator />
              <MenuItem
                key="Profile"
                textValue="Profile"
                className="p-2"
                onPress={() => {
                  setShowMenu(false);
                  router.push("/user-info/edit-info");
                }}
              >
                <MenuItemLabel size="sm">Thông tin cá nhân</MenuItemLabel>
              </MenuItem>
              <MenuItem
                key="Avatar"
                textValue="Avatar"
                className="p-2"
                onPress={() => {
                  setShowMenu(false);
                  handlePickImage("profile");
                }}
              >
                <MenuItemLabel size="sm">Đổi ảnh đại diện</MenuItemLabel>
              </MenuItem>
              <MenuItem
                key="Cover"
                textValue="Cover"
                className="p-2"
                onPress={() => {
                  setShowMenu(false);
                  handlePickImage("cover");
                }}
              >
                <MenuItemLabel size="sm">Đổi ảnh bìa</MenuItemLabel>
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                key="Help Center"
                textValue="Help Center"
                className="p-2"
              >
                <MenuItemLabel size="sm">Help Center</MenuItemLabel>
              </MenuItem>
              <MenuItem key="Logout" textValue="Logout" className="p-2">
                <MenuItemLabel size="sm">Logout</MenuItemLabel>
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
