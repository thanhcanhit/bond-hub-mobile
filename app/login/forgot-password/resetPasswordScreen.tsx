import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { Input, InputField } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { resetPassword } = useAuthStore();
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mật khẩu và xác nhận mật khẩu");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu và xác nhận mật khẩu không khớp");
      return;
    }

    try {
      await resetPassword(password);
      Alert.alert("Thành công", "Mật khẩu đã được đặt lại thành công", [
        {
          text: "Đăng nhập",
          onPress: () => router.replace("/login/loginScreen"),
        },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.");
    }
  };

  return (
    <View className="flex-1 justify-between items-center bg-white pb-8">
      <View className="w-full ">
        <View
          className="p-4 flex-row items-center bg-blue-500  w-full px-2.5"
          style={{ paddingTop: insets.top }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl text-white ml-4">Đặt lại mật khẩu</Text>
        </View>

        <View className="p-4">
          <Text className="text-gray-600 mb-6">
            Nhập mật khẩu mới cho tài khoản của bạn
          </Text>

          <View className="flex-row items-center">
            <Input
              variant="underlined"
              size="xl"
              isDisabled={false}
              isInvalid={false}
              isReadOnly={false}
              className="flex-1"
            >
              <InputField
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới ..."
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

          <View className="flex-row items-center mt-4">
            <Input
              variant="underlined"
              size="xl"
              isDisabled={false}
              isInvalid={false}
              isReadOnly={false}
              className="flex-1"
            >
              <InputField
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới ..."
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
            onPress={handleResetPassword}
            className="bg-blue-500 py-4 rounded-full items-center mt-8 mx-10"
          >
            <Text className="text-white text-xl font-semibold">Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
