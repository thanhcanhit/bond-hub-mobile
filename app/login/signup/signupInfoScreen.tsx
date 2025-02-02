import { ArrowLeft, CircleHelp } from "lucide-react-native";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
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

const SignUpInfoScreen = () => {
  const { phoneNumber, password, fullName } = useLocalSearchParams();
  const handleNext = () => {
    router.navigate({
      pathname: "/login/signup/signupAvatarScreen",
      params: { phoneNumber, password, fullName },
    });
  };
  return (
    <View className="flex-1  items-center  bg-white pt-8 pb-8 px-4">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-8 left-4"
      >
        <ArrowLeft size={24} color={"black"} />
      </TouchableOpacity>
      <Text className="text-2xl font-bold mb-4 mt-10">
        THÊM THÔNG TIN CÁ NHÂN
      </Text>

      <DateInput />
      <Select className="w-full mt-5">
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
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            <SelectItem label="Nam" value="nam" />
            <SelectItem label="Nữ" value="nu" />
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
