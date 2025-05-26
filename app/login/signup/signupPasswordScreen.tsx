// app/login/signup/SignUpPasswordScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Input, InputField } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SignUpPasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePassword = (value: string) => {
    if (value.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleNext = () => {
    if (!password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mật khẩu và xác nhận mật khẩu");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert("Lỗi", passwordError);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu và xác nhận mật khẩu không khớp");
      return;
    }

    router.navigate({
      pathname: "/login/signup/signupNameScreen",
      params: { email, password },
    });
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
        <Text className="text-[20px] font-semibold text-gray-700 text-center ">
          NHẬP MẬT KHẨU CỦA BẠN
        </Text>
      </View>
      <View className="w-full p-2.5">
        <View className="flex-row items-center">
          <Input
            variant="underlined"
            size="xl"
            isDisabled={false}
            isInvalid={!!passwordError}
            isReadOnly={false}
            className="mt-5 pl-2 flex-1"
          >
            <InputField
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu ..."
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validatePassword(text);
              }}
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
        {passwordError && (
          <Text className="text-red-500 text-sm ml-2 mt-1">
            {passwordError}
          </Text>
        )}
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
