import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, X } from "lucide-react-native";
import { Input, InputField } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";

export default function ForgotPasswordEmailScreen() {
  const [email, setEmail] = useState("");
  const { forgotPassword } = useAuthStore();
  const clearInput = () => {
    setEmail("");
  };

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email của bạn");
      return;
    }

    try {
      await forgotPassword(email);
      router.push("/login/forgot-password/forgotPasswordOTPScreen");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi mã OTP. Vui lòng thử lại sau.");
    }
  };

  return (
    <View className="flex-1 justify-between items-center bg-white pt-8 pb-8">
      <View className="w-full ">
        <View className="p-4 flex-row items-center bg-blue-500  w-full px-2.5">
          <TouchableOpacity
            onPress={() => router.navigate("/login/loginScreen")}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl text-white ml-4">Lấy lại mật khẩu</Text>
        </View>

        <View className="p-5 ">
          <Text className="text-gray-500 mb-6">
            Nhập email của bạn để nhận mã xác thực
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
                placeholder="Nhập email ..."
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {email.length > 0 && (
                <TouchableOpacity onPress={clearInput} className="ml-2">
                  <X size={24} color="gray" />
                </TouchableOpacity>
              )}
            </Input>
          </View>

          <TouchableOpacity
            onPress={handleSendOTP}
            className="bg-blue-500 py-4 mx-10 rounded-full items-center mt-8"
          >
            <Text className="text-white text-xl font-semibold">
              Gửi mã xác thực
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
