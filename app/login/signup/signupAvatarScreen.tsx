import { ArrowLeft, CircleHelp } from "lucide-react-native";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { register } from "@/services/authService";

const SignUpAvataScreen = () => {
  const { phoneNumber, password, fullName } = useLocalSearchParams();
  const handleNext = async () => {
    console.log("User", phoneNumber, password, fullName);
    try {
      await register(
        phoneNumber as string,
        password as string,
        fullName as string,
      );
      Alert.alert("", "Đăng ký thành công.");
      router.replace("/login/loginScreen");
    } catch (error) {
      Alert.alert("Lỗi", "Đăng ký thất bại. Vui lòng thử lại.");
      console.error("Registration error:", error);
    }
  };
  return (
    <View className="flex-1  items-center justify-between bg-white pt-8 pb-8 px-4">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-8 left-4"
      >
        <ArrowLeft size={24} color={"black"} />
      </TouchableOpacity>
      <View className="flex-1 w-full items-center h-full">
        <Text className="text-2xl font-bold mb-4 mt-10">
          CẬP NHẬT ẢNH ĐẠI DIỆN
        </Text>
        <Text className="text-gray-500 text-center px-2">
          Thêm ảnh đại diện giúp bạn dễ dàng được nhận diện hơn
        </Text>
        <Avatar className="mt-20 h-44 w-44">
          {/* <AvatarFallbackText></AvatarFallbackText> */}
          <AvatarImage
            source={{
              uri: "https://res.cloudinary.com/dxxsudprj/image/upload/v1733839978/Anime_Characters_cnkjji.jpg",
            }}
          />
          {/* <AvatarBadge /> */}
        </Avatar>
      </View>

      <TouchableOpacity
        onPress={handleNext}
        className="bg-blue-500 py-4 rounded-full items-center mt-12 w-full"
      >
        <Text className="text-white text-xl font-semibold">Cập nhật</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleNext}
        className="bg-gray-100 py-4  rounded-full items-center mt-2.5 w-full"
      >
        <Text className="text-black text-xl font-semibold">Bỏ qua</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpAvataScreen;
