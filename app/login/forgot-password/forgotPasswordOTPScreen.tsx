import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, TextInput } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, CircleHelp } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";

export default function ForgotPasswordOTPScreen() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));

  const inputsRef = React.useRef<Array<TextInput | null>>([]);
  const handleChangeText = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      const nextInput = inputsRef.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleClearCode = () => {
    setCode(Array(6).fill(""));
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  };
  const { verifyForgotPassword } = useAuthStore();
  const handleVerifyOTP = async () => {
    if (!code || code.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP 6 số");
      return;
    }

    try {
      await verifyForgotPassword(code.join(""));
      router.push("/login/forgot-password/resetPasswordScreen");
    } catch (error) {
      Alert.alert(
        "Lỗi",
        "Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.",
      );
    }
  };

  return (
    <View className="flex-1 justify-between items-center  bg-white pt-8 pb-8 px-4">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-10 left-5"
      >
        <ArrowLeft size={24} color={"black"} />
      </TouchableOpacity>
      <View className="w-full justify-center items-center mt-20">
        <Text className="text-2xl font-bold mb-4">Nhập mã xác thực</Text>

        <Text className="text-center font-semibold mb-2 text-gray-700 px-4">
          Nhập mã gồm 6 số được gửi đến email của bạn
        </Text>

        <View className="flex-row justify-between mb-4">
          {code.map((value, index) => (
            <TextInput
              key={index}
              ref={(ref: TextInput | null): void => {
                inputsRef.current[index] = ref;
              }}
              className="w-12 h-14 border border-gray-300 text-center text-lg rounded-[10px] mx-2 mt-2.5"
              value={value}
              onChangeText={(text) => handleChangeText(text, index)}
              keyboardType="numeric"
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </View>
        <TouchableOpacity
          className=" px-4  rounded mb-4 w-full items-center"
          onPress={handleClearCode}
        >
          <Text className="text-gray-700 text-lg">Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleVerifyOTP}
          className="bg-blue-500 py-4 rounded-full items-center mt-8 w-full"
        >
          <Text className="text-white text-xl font-semibold">Tiếp tục</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity className="flex-row items-center">
        <CircleHelp size={14} color={"blue"} />
        <Text className="text-blue-500 text-center pl-2">
          I still need help with verification codes
        </Text>
      </TouchableOpacity>
    </View>
  );
}
