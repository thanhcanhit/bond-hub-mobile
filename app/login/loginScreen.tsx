import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, ArrowRight, Eye, EyeOff, X } from "lucide-react-native";
import { Input, InputField } from "@/components/ui/input";
import { Fab } from "@/components/ui/fab";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = "http://localhost:3000/auth/login";

export const login = async (phoneNumber: string, password: string) => {
  try {
    const response = await axios.post(API_URL, {
      phoneNumber,
      password,
    });

    await SecureStore.setItemAsync("accessToken", response.data.accessToken);
    await SecureStore.setItemAsync("refreshToken", response.data.refreshToken);
    await SecureStore.setItemAsync("user", JSON.stringify(response.data.user));

    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export default function LoginScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const clearInput = () => {
    setPhoneNumber("");
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    try {
      const response = await login(phoneNumber, password);
      console.log("Login success:", response);
      router.navigate("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Đăng nhập thất bại",
        "Số điện thoại hoặc mật khẩu không đúng.",
      );
    } finally {
      toggleModal();
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      {/* Màn hình chính */}
      <Text className="text-5xl font-bold mb-4 text-blue-500">Zalo</Text>
      <Text className="text-xl mb-2 font-bold">Gọi video ổn định</Text>
      <Text className="text-md mb-8 text-gray-400 text-center px-10">
        Trò chuyện thật đã với chất lượng video ổn định mọi lúc, mọi nơi
      </Text>

      <TouchableOpacity
        onPress={toggleModal}
        className="bg-blue-500 py-4 rounded-full w-60 items-center"
      >
        <Text className="text-white font-semibold text-xl">ĐĂNG NHẬP</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.navigate("/login/signup/signupScreen1")}
        className="bg-gray-100 py-4 rounded-full w-60 items-center mt-3"
      >
        <Text className="text-black font-semibold text-xl">ĐĂNG KÝ</Text>
      </TouchableOpacity>

      {/* Modal đăng nhập */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleModal}
      >
        <View className="bg-white rounded h-full">
          <View className="bg-blue-500 flex-row items-center mt-8 p-4">
            <TouchableOpacity onPress={toggleModal}>
              <ArrowLeft size={24} color={"white"} />
            </TouchableOpacity>
            <Text className="text-xl font-bold pl-4 text-white">Đăng nhập</Text>
          </View>

          <Text className="p-2.5 bg-gray-100 text-gray-700">
            Vui lòng nhập số điện thoại và mật khẩu để đăng nhập
          </Text>
          <View className="p-4">
            <View className="flex-row items-center">
              <Input
                variant="underlined"
                size="xl"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
                className="mt-2 pl-2 flex-1"
              >
                <InputField
                  placeholder="Nhập số điện thoại ..."
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
                {phoneNumber.length > 0 && (
                  <TouchableOpacity onPress={clearInput} className="ml-2">
                    <X size={24} color={"gray"} />
                  </TouchableOpacity>
                )}
              </Input>
            </View>
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu ..."
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={toggleShowPassword}
                  className="ml-2 items-center "
                >
                  {showPassword ? (
                    <Eye size={24} color="gray" />
                  ) : (
                    <EyeOff size={24} color="gray" />
                  )}
                </TouchableOpacity>
              </Input>
            </View>
            <TouchableOpacity className="m-2.5 mt-6 w-full items-start">
              <Text className="text-blue-500 text-center">
                Lấy lại mật khẩu
              </Text>
            </TouchableOpacity>
          </View>
          <Fab
            placement="bottom right"
            isHovered={false}
            isDisabled={false}
            onPress={handleLogin}
            isPressed={true}
            className="bg-blue-500 w-16 h-16 rounded-full mb-10 "
          >
            <ArrowRight size={28} color={"white"} />
          </Fab>
        </View>
      </Modal>
    </View>
  );
}
