// app/login/signup/SignUpPasswordScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Input, InputField } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";

const SignUpPasswordScreen = () => {
  const { phoneNumber } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleNext = () => {
    if (!password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mật khẩu và xác nhận mật khẩu");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu và xác nhận mật khẩu không khớp");
      return;
    }

    router.navigate({
      pathname: "/login/signup/signupNameSreen",
      params: { phoneNumber, password },
    });
  };

  return (
    <View className="flex-1 justify-between items-center bg-white pt-8 pb-8">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-8 left-4"
      >
        <ArrowLeft size={24} color={"black"} />
      </TouchableOpacity>
      <View className="w-full p-2.5">
        <Text className="text-[20px] font-semibold text-gray-700 text-center mt-12 mb-2">
          NHẬP MẬT KHẨU CỦA BẠN
        </Text>
        <View className="flex-row items-center">
          <Input
            variant="underlined"
            size="xl"
            isDisabled={false}
            isInvalid={false}
            isReadOnly={false}
            className="mt-5 pl-2 flex-1"
          >
            <InputField
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu ..."
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={toggleShowPassword}
              className="ml-2 items-center"
            >
              {showPassword ? (
                <Eye size={24} color="gray" />
              ) : (
                <EyeOff size={24} color="gray" />
              )}
            </TouchableOpacity>
          </Input>
        </View>
        <View className="flex-row items-center">
          <Input
            variant="underlined"
            size="xl"
            isDisabled={false}
            isInvalid={false}
            isReadOnly={false}
            className="mt-5 pl-2 flex-1"
          >
            <InputField
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu ..."
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={toggleShowConfirmPassword}
              className="ml-2 items-center"
            >
              {showConfirmPassword ? (
                <Eye size={24} color="gray" />
              ) : (
                <EyeOff size={24} color="gray" />
              )}
            </TouchableOpacity>
          </Input>
        </View>
        <TouchableOpacity
          onPress={handleNext}
          className="bg-blue-500 py-4 rounded-full items-center mt-12"
        >
          <Text className="text-white text-xl font-semibold">Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUpPasswordScreen;
