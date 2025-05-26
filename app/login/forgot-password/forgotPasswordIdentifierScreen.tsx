import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, X } from "lucide-react-native";
import { Input, InputField } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ForgotPasswordEmailScreen() {
  const [identifier, setIdentifier] = useState("");
  const [isEmail, setIsEmail] = useState(true);
  const { forgotPassword } = useAuthStore();
  const insets = useSafeAreaInsets();

  const clearInput = () => {
    setIdentifier("");
  };

  useEffect(() => {
    // Kiểm tra xem input là email hay số điện thoại
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,}$/;
    setIsEmail(emailRegex.test(identifier));
  }, [identifier]);

  const handleSendOTP = async () => {
    if (!identifier) {
      Alert.alert("Lỗi", "Vui lòng nhập email hoặc số điện thoại của bạn");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,}$/;

    if (
      !emailRegex.test(identifier) &&
      !phoneRegex.test(identifier.replace(/[\s-]/g, ""))
    ) {
      Alert.alert("Lỗi", "Vui lòng nhập email hoặc số điện thoại hợp lệ");
      return;
    }

    try {
      await forgotPassword(identifier);
      router.push("/login/forgot-password/forgotPasswordOTPScreen");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi mã OTP. Vui lòng thử lại sau.");
    }
  };

  return (
    <View className="flex-1 justify-between items-center bg-white  pb-8">
      <View className="w-full ">
        <View
          className="p-4 flex-row items-center bg-blue-500  w-full px-2.5 mt-2"
          style={{
            paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 10,
          }}
        >
          <TouchableOpacity
            onPress={() => router.navigate("/login/loginScreen")}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl text-white ml-4 ">Lấy lại mật khẩu</Text>
        </View>

        <View className="p-2.5  ">
          <Text className="text-gray-500 mb-6 text-sm text-center ">
            Nhập email hoặc số điện thoại của bạn để nhận mã xác thực
          </Text>

          <View className="flex-row items-center px-1">
            <Input
              variant="underlined"
              size="xl"
              isDisabled={false}
              isInvalid={false}
              isReadOnly={false}
              className="flex-1"
            >
              <InputField
                placeholder="Nhập email hoặc số điện thoại..."
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType={isEmail ? "email-address" : "phone-pad"}
                autoCapitalize="none"
              />
              {identifier.length > 0 && (
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
