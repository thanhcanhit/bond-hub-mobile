import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input, InputField } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectItem,
} from "@/components/ui/select";
import DateTimePicker from "@react-native-community/datetimepicker";
import { updateBasicInfo } from "@/services/user-service";

export default function EditInfoScreen() {
  const insets = useSafeAreaInsets();
  const { userInfo, user } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("MALE");
  const [bio, setBio] = useState(userInfo?.bio || "");

  const handleUpdateInfo = async () => {
    try {
      const formattedDate = dateOfBirth.toISOString().split("T")[0];
      const updateData = {
        fullName,
        dateOfBirth: formattedDate,
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

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View
        className="w-full flex-row items-center p-4 bg-white"
        style={{ paddingTop: insets.top }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-medium ml-4">Chỉnh sửa thông tin</Text>
      </View>

      <View className="p-4 space-y-4">
        <View>
          <Text className="text-gray-600 mb-2">Họ và tên</Text>
          <Input>
            <InputField
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
            />
          </Input>
        </View>

        <View>
          <Text className="text-gray-600 mb-2">Ngày sinh</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="border border-gray-300 rounded-lg p-3"
          >
            <Text>{dateOfBirth.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>

        <View>
          <Text className="text-gray-600 mb-2">Giới tính</Text>
          <Select selectedValue={gender} onValueChange={setGender}>
            <SelectTrigger>
              <SelectInput placeholder="Chọn giới tính" />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicator />
                <SelectItem label="Nam" value="MALE" />
                <SelectItem label="Nữ" value="FEMALE" />
                <SelectItem label="Khác" value="OTHER" />
              </SelectContent>
            </SelectPortal>
          </Select>
        </View>

        <View>
          <Text className="text-gray-600 mb-2">Giới thiệu bản thân</Text>
          <Input>
            <InputField
              value={bio}
              onChangeText={setBio}
              placeholder="Nhập giới thiệu bản thân"
              multiline
              numberOfLines={4}
            />
          </Input>
        </View>

        <TouchableOpacity
          onPress={handleUpdateInfo}
          className="bg-blue-500 py-4 rounded-full items-center mt-8"
        >
          <Text className="text-white text-xl font-semibold">Lưu thay đổi</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
