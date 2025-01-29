import { ArrowLeft, CircleHelp } from "lucide-react-native";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";

const SignupScreen5 = () => {
  const handleNext = (isUpdate: boolean) => {
    if (isUpdate) router.navigate("/(tabs)");
    else router.navigate("/(tabs)");
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
        onPress={() => handleNext(true)}
        className="bg-blue-500 py-4 rounded-full items-center mt-12 w-full"
      >
        <Text className="text-white text-xl font-semibold">Cập nhật</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleNext(false)}
        className="bg-gray-100 py-4  rounded-full items-center mt-2.5 w-full"
      >
        <Text className="text-black text-xl font-semibold">Bỏ qua</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen5;
