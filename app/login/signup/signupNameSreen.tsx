import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Input, InputField } from "@/components/ui/input";

const SignUpNameScreen = () => {
  const { phoneNumber, password } = useLocalSearchParams(); // Lấy số điện thoại và mật khẩu từ màn hình trước
  const [fullName, setFullName] = useState("");

  const handleNext = async () => {
    if (!fullName) {
      Alert.alert("Lỗi", "Vui lòng nhập tên của bạn");
      return;
    }
    router.navigate({
      pathname: "/login/signup/signupInfoScreen",
      params: { phoneNumber, password, fullName },
    });
  };
  return (
    <View className="flex-1  items-center  bg-white pt-8 pb-8 px-4">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-8 left-4"
      >
        <ArrowLeft size={24} color={"black"} />
      </TouchableOpacity>
      <Text className="text-2xl font-bold mb-4 mt-10">
        NHẬP TÊN ZALO CỦA BẠN
      </Text>
      <Text className="text-gray-500  text-center ">
        Sử dụng tên thật của bạn để dễ dàng kết nối hơn
      </Text>
      <Input
        variant="outline"
        size="md"
        isDisabled={false}
        isInvalid={false}
        isReadOnly={false}
        className="m-2 my-8 h-16"
      >
        <InputField
          placeholder="Nguyễn Văn A ..."
          value={fullName}
          onChangeText={setFullName}
        />
      </Input>
      <Text className="text-gray-500 text-left w-full pl-6 pt-2">
        • Độ dài: 2 đến 40 ký tự
      </Text>
      <Text className="text-gray-500 text-left w-full pl-6 pt-2">
        • Không có số
      </Text>
      <Text className="text-gray-500 text-left w-full pl-6 pt-2">
        • Tuân thủ <Text>Zalo's naming policy</Text>
      </Text>
      <TouchableOpacity
        onPress={handleNext}
        className="bg-blue-500 py-4 rounded-full items-center mt-12 w-full"
      >
        <Text className="text-white text-xl font-semibold">Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpNameScreen;
