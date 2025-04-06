import React, { useState } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import axiosInstance from "@/lib/axios";
import { Button, ButtonText } from "@/components/ui/button";
import { Laptop, Laptop2 } from "lucide-react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function SubmitLoginScreen() {
  const { qrToken } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmLogin = async () => {
    if (!qrToken) {
      Alert.alert("Lỗi", "Không tìm thấy mã QR");
      return;
    }

    try {
      setIsLoading(true);
      const result = await axiosInstance.post(`${API_URL}/qrcode/confirm`, {
        qrToken: qrToken as string,
      });

      console.log(result.data);
      router.replace("/");
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Đã có lỗi xảy ra khi đăng nhập",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelLogin = async () => {
    if (!qrToken) {
      router.replace("/");
      return;
    }

    try {
      setIsLoading(true);
      await axiosInstance.post(`${API_URL}/qrcode/cancel`, {
        qrToken: qrToken as string,
      });

      router.replace("/");
    } catch (error) {
      console.error("Error canceling login:", error);

      router.replace("/");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="items-center justify-center flex-1 bg-white">
      <View className="items-center justify-center flex-1">
        <Text className="mb-4 text-5xl font-bold text-blue-500">Vodka</Text>
        <Text className="mb-2 text-xl font-bold">Xác nhận đăng nhập</Text>
        <Text className="px-10 mb-8 text-center text-gray-600 text-md">
          Bạn có muốn đăng nhập vào thiết bị này không?
        </Text>
      </View>

      {isLoading ? (
        <View className="mb-2">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <View className="flex-col justify-between h-[120px] w-4/5 gap-2 pb-8">
          <Button
            action="primary"
            onPress={handleConfirmLogin}
            className="flex-1 bg-blue-500 rounded-full"
          >
            <ButtonText>Xác nhận</ButtonText>
          </Button>
          <Button
            action="negative"
            variant="outline"
            onPress={handleCancelLogin}
            className="flex-1 rounded-full"
          >
            <ButtonText className="text-red-500">Huỷ bỏ</ButtonText>
          </Button>
        </View>
      )}
    </View>
  );
}
