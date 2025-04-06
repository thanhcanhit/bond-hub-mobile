import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, PencilLine } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input, InputField } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";

import { updateBasicInfo } from "@/services/user-service";
import DateInput from "@/components/DateInput";

export default function EditInfoScreen() {
  const insets = useSafeAreaInsets();
  const { userInfo, user } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [gender, setGender] = useState("MALE");
  const [bio, setBio] = useState(userInfo?.bio || "");

  const handleUpdateInfo = async () => {
    try {
      const updateData = {
        fullName,
        dateOfBirth: dateOfBirth.toString(),
        gender,
        bio,
      };

      await updateBasicInfo(updateData);
      Alert.alert("Thành công", "Cập nhật thông tin thành công");
      router.back();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    }
  };

  const onDateChange = (selectedDate?: string) => {
    if (selectedDate) {
      setDateOfBirth(new Date(selectedDate));
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View
        className="w-full flex-row items-center p-4 bg-blue-500"
        style={{ paddingTop: insets.top }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-medium ml-4 text-white">
          Chỉnh sửa thông tin
        </Text>
      </View>

      <View className="p-4 space-y-4">
        <View className="">
          <Text className="text-gray-600 mb-2.5 text-xl">Họ và tên</Text>
          <Input className="border-0 border-b h-14">
            <InputField
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
              className="text-lg p-1 text-gray-600"
            />
            <PencilLine size={20} color="gray" />
          </Input>
        </View>

        <View className="py-2">
          <Text className="text-gray-600 my-2.5 text-xl ">Ngày sinh</Text>
          <DateInput
            value={userInfo?.dateOfBirth || dateOfBirth.toString()}
            onChange={onDateChange}
          />
        </View>

        <View className="py-2">
          <Text className="text-gray-600 my-2 text-xl">Giới tính</Text>
          <View className="flex-row space-x-6 mt-2">
            <TouchableOpacity
              onPress={() => setGender("MALE")}
              className="flex-row items-center pr-5"
            >
              <View
                className={`w-6 h-6 rounded-full border-2 ${gender === "MALE" ? "border-blue-500" : "border-gray-300"} justify-center items-center`}
              >
                {gender === "MALE" && (
                  <View className="w-4 h-4 rounded-full bg-blue-500" />
                )}
              </View>
              <Text className="ml-2.5 text-xl text-gray-700">Nam</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setGender("FEMALE")}
              className="flex-row items-center pr-5"
            >
              <View
                className={`w-6 h-6 rounded-full border-2 ${gender === "FEMALE" ? "border-blue-500" : "border-gray-300"} justify-center items-center`}
              >
                {gender === "FEMALE" && (
                  <View className="w-4 h-4 rounded-full bg-blue-500" />
                )}
              </View>
              <Text className="ml-2.5 text-xl text-gray-700">Nữ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setGender("OTHER")}
              className="flex-row items-center"
            >
              <View
                className={`w-6 h-6 rounded-full border-2 ${gender === "OTHER" ? "border-blue-500" : "border-gray-300"} justify-center items-center`}
              >
                {gender === "OTHER" && (
                  <View className="w-4 h-4 rounded-full bg-blue-500" />
                )}
              </View>
              <Text className="ml-2.5 text-xl text-gray-700">Khác</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="py-2">
          <Text className="text-gray-600 my-2.5 text-xl">
            Giới thiệu bản thân
          </Text>
          <Input className="h-32">
            <InputField
              value={bio}
              onChangeText={setBio}
              placeholder="Nhập giới thiệu bản thân"
              multiline
              numberOfLines={4}
              className="text-lg p-4"
            />
          </Input>
        </View>

        <TouchableOpacity
          onPress={handleUpdateInfo}
          className="bg-blue-500 py-4 rounded-full items-center mt-8 mx-20"
        >
          <Text className="text-white text-xl font-semibold">Lưu thay đổi</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
