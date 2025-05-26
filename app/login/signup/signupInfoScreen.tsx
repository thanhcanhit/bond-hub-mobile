import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
} from "@/components/ui/select";
import { ChevronDownIcon } from "@/components/ui/icon";
import DateInput from "@/components/DateInput";
import { useAuthStore } from "@/store/authStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SignUpInfoScreen = () => {
  const insets = useSafeAreaInsets();
  const { email, password, fullName } = useLocalSearchParams();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const { completeRegistration } = useAuthStore();

  const handleNext = async () => {
    if (!dateOfBirth || !gender) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await completeRegistration({
        password: password as string,
        fullName: fullName as string,
        dateOfBirth,
        gender,
      });
      Alert.alert("Thành công", "Đăng ký thành công", [
        {
          text: "Đăng nhập",
          onPress: () => router.replace("/login/loginScreen"),
        },
      ]);
    } catch (error: any) {
      alert(error.response?.data?.message || "Đã có lỗi xảy ra");
    }
  };

  return (
    <View
      className="flex-1 items-center bg-white  pb-8 px-4"
      style={{
        paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 10,
      }}
    >
      <View className="flex-row items-center w-full pb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color={"black"} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold ">THÊM THÔNG TIN CÁ NHÂN</Text>
      </View>

      <DateInput value={dateOfBirth} onChange={setDateOfBirth} />
      <Select
        className="w-full mt-5 "
        selectedValue={gender}
        onValueChange={setGender}
      >
        <SelectTrigger
          variant="outline"
          size="xl"
          className="h-16 rounded-lg w-full justify-between"
        >
          <SelectInput placeholder="Giới tính" />
          <SelectIcon className="mr-3" as={ChevronDownIcon} />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent className="pb-8">
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            <SelectItem label="Nam" value="MALE" />
            <SelectItem label="Nữ" value="FEMALE" />
            <SelectItem label="Khác" value="OTHER" />
          </SelectContent>
        </SelectPortal>
      </Select>
      <TouchableOpacity
        onPress={handleNext}
        className="bg-blue-500 py-4 rounded-full items-center mt-12 w-full"
      >
        <Text className="text-white text-xl font-semibold">Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpInfoScreen;
