import React, { useState } from "react";
import { View, Alert, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input, InputField } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { LinearGradient } from "expo-linear-gradient";
import { initiatePhoneUpdate } from "@/services/user-service";

export default function ChangePhoneScreen() {
  const insets = useSafeAreaInsets();
  const [newPhone, setNewPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = useAuthStore();
  console.log("User data:", userData);

  const handleInitiatePhoneUpdate = async () => {
    if (!newPhone) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại mới");
      return;
    }

    // Kiểm tra định dạng số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(newPhone)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    // Kiểm tra nếu số điện thoại mới trùng với số điện thoại hiện tại
    if (userData?.phoneNumber === newPhone) {
      Alert.alert(
        "Lỗi",
        "Số điện thoại mới không được trùng với số điện thoại hiện tại",
      );
      return;
    }

    try {
      setIsLoading(true);
      await initiatePhoneUpdate(newPhone);

      // Chuyển đến màn hình xác thực OTP
      router.push({
        pathname: "/settings/account-security/verify-otp",
        params: {
          type: "phone",
          newValue: newPhone,
        },
      });
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message ||
          "Không thể khởi tạo quá trình đổi số điện thoại",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={["#297eff", "#228eff", "#00d4ff"]}
      >
        <View
          className="flex-row items-center p-4"
          style={{ paddingTop: insets.top }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={"white"} />
          </TouchableOpacity>
          <Text className="text-lg text-white font-medium ml-4">
            Đổi số điện thoại
          </Text>
        </View>
      </LinearGradient>

      <View className="p-4 flex-1">
        {userData?.phoneNumber && (
          <View className="mb-6">
            <Text className="text-gray-500 mb-2">Số điện thoại hiện tại</Text>
            <Text className="text-gray-700 font-medium">
              {userData?.phoneNumber}
            </Text>
          </View>
        )}

        <View className="flex-row items-center mb-8 mt-4">
          <Input
            variant="underlined"
            size="xl"
            isDisabled={isLoading}
            isInvalid={false}
            isReadOnly={false}
            className="flex-1"
          >
            <InputField
              placeholder="Nhập số điện thoại mới..."
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
            />
          </Input>
        </View>

        <TouchableOpacity
          className="bg-blue-500 py-4 rounded-full items-center mx-14"
          onPress={handleInitiatePhoneUpdate}
          disabled={isLoading}
        >
          <Text className="text-white text-lg font-semibold">
            {isLoading ? "Đang xử lý..." : "Tiếp tục"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
