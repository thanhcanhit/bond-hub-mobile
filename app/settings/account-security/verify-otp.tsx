import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CircleHelp } from "lucide-react-native";
import { verifyEmailUpdate, verifyPhoneUpdate } from "@/services/user-service";
import { Colors } from "@/constants/Colors";

const VerifyOTPScreen = () => {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const { updateId, type, newValue } = useLocalSearchParams();

  const inputsRef = useRef<Array<TextInput | null>>([]);

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

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      const otp = code.join("");

      if (otp.length !== 6) {
        Alert.alert("Lỗi", "Vui lòng nhập đủ mã OTP");
        return;
      }

      if (type === "email") {
        await verifyEmailUpdate(otp, updateId as string);
        Alert.alert("Thành công", "Email đã được cập nhật thành công", [
          {
            text: "OK",
            onPress: () => router.navigate("/settings/account-security"),
          },
        ]);
      } else if (type === "phone") {
        await verifyPhoneUpdate(otp, updateId as string);
        Alert.alert("Thành công", "Số điện thoại đã được cập nhật thành công", [
          {
            text: "OK",
            onPress: () => router.navigate("/settings/account-security"),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Mã OTP không hợp lệ",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (type === "email") {
      return "Xác thực đổi email";
    } else if (type === "phone") {
      return "Xác thực đổi số điện thoại";
    }
    return "Xác thực";
  };

  const getMessage = () => {
    if (type === "email") {
      return `Nhập mã gồm 6 số được gửi đến email ${newValue}`;
    } else if (type === "phone") {
      return `Nhập mã gồm 6 số được gửi đến số điện thoại ${newValue}`;
    }
    return "Nhập mã xác thực gồm 6 số";
  };

  return (
    <View
      className="flex-1 justify-between items-center bg-white pt-8 pb-8 px-4"
      style={{
        paddingTop: Platform.OS === "ios" ? insets.top : 20,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-8 left-4"
        style={{
          top: Platform.OS === "ios" ? insets.top : 20,
        }}
      >
        <ArrowLeft size={24} color={"black"} />
      </TouchableOpacity>

      <View className="w-full justify-center items-center mt-20">
        <Text className="text-2xl font-bold mb-4">{getTitle()}</Text>

        <Text className="text-center font-semibold mb-2 text-gray-700 px-4">
          {getMessage()}
        </Text>

        <Text className="text-lg font-semibold mb-4">{newValue}</Text>

        <View className="flex-row justify-between mb-4">
          {code.map((value, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputsRef.current[index] = ref)}
              className="w-12 h-14 border border-gray-300 text-center text-lg rounded-[10px] mx-2 mt-2.5"
              value={value}
              onChangeText={(text) => handleChangeText(text, index)}
              keyboardType="numeric"
              maxLength={1}
              autoFocus={index === 0}
              editable={!isLoading}
            />
          ))}
        </View>

        <TouchableOpacity
          className="px-4 rounded mb-4 w-full items-center"
          onPress={handleClearCode}
          disabled={isLoading}
        >
          <Text className="text-gray-700 text-lg">Xóa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleVerify}
          className="bg-blue-500 py-4 rounded-full items-center mt-8 w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-xl font-semibold">Xác nhận</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="flex-row items-center">
        <CircleHelp size={14} color={Colors.light.PRIMARY_BLUE} />
        <Text className="text-blue-500 text-center pl-2">
          Tôi cần trợ giúp với mã xác thực
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyOTPScreen;
