import { ArrowLeft, CircleHelp } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SignUpOTPScreen = () => {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const { email } = useLocalSearchParams();
  const { verifyRegistration } = useAuthStore();

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

  const inputsRef = React.useRef<Array<TextInput | null>>([]);

  const handleNext = async () => {
    try {
      const otp = code.join("");
      if (otp.length !== 6) {
        alert("Vui lòng nhập đủ mã OTP");
        return;
      }
      await verifyRegistration(otp);
      router.navigate({
        pathname: "/login/signup/signupPasswordScreen",
        params: { email },
      });
    } catch (error: any) {
      alert(error.response?.data?.message || "Mã OTP không hợp lệ");
    }
  };

  return (
    <View
      className="flex-1 justify-between items-center  bg-white pt-8 pb-8 px-4"
      style={{
        paddingTop: Platform.OS === "ios" ? insets.top : 20,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-10 left-4"
      >
        <ArrowLeft size={24} color={"black"} />
      </TouchableOpacity>
      <View className="w-full justify-center items-center mt-20">
        <Text className="text-2xl font-bold mb-4">Nhập mã xác thực</Text>

        <Text className="text-center font-semibold mb-2 text-gray-700 px-4">
          Nhập mã gồm 6 số được gửi đến email của bạn
        </Text>

        <Text className="text-lg font-semibold mb-4">{email}</Text>

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
          onPress={handleNext}
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
};

export default SignUpOTPScreen;
