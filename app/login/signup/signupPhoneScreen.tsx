import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Input, InputField } from "@/components/ui/input";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import { CheckIcon } from "@/components/ui/icon";

const SignUpPhoneScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleNext = () => {
    if (!phoneNumber) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }
    router.navigate({
      pathname: "/login/signup/signupOTPScreen",
      params: { phoneNumber },
    });
  };
  return (
    <View className="flex-1 justify-between items-center bg-white pt-8 pb-8">
      <View>
        <Text className="text-[20px] font-semibold text-gray-700 text-center mt-12 mb-2">
          NHẬP SỐ ĐIỆN THOẠI CỦA BẠN
        </Text>
        <Input
          variant="outline"
          size="xl"
          isDisabled={false}
          isInvalid={false}
          isReadOnly={false}
          className="rounded-[10px] my-4 h-16"
        >
          <InputField
            placeholder="Số điện thoại ..."
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </Input>
        <Checkbox
          size="lg"
          isInvalid={false}
          isDisabled={false}
          value=""
          isHovered={true}
          className="my-2 ml-2"
        >
          <CheckboxIndicator>
            <CheckboxIcon as={CheckIcon} />
          </CheckboxIndicator>
          <CheckboxLabel>
            I agree to{" "}
            <Text className="text-blue-500 font-semibold">
              Zalo Terms Of Service
            </Text>
          </CheckboxLabel>
        </Checkbox>
        <Checkbox
          size="lg"
          isInvalid={false}
          isDisabled={false}
          value=""
          isHovered={true}
          className="my-2 ml-2"
        >
          <CheckboxIndicator>
            <CheckboxIcon as={CheckIcon} />
          </CheckboxIndicator>
          <CheckboxLabel>
            I agree to{" "}
            <Text className="text-blue-500 font-semibold">
              Zalo's Social Terms Of Service
            </Text>
          </CheckboxLabel>
        </Checkbox>
        <TouchableOpacity
          onPress={handleNext}
          className="bg-blue-500 py-4 rounded-full items-center mt-12"
        >
          <Text className="text-white text-xl font-semibold">Tiếp tục</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center">
        <Text className="text-gray-700 text-lg ">Bạn đã có tài khoản?</Text>
        <TouchableOpacity
          className="items-center"
          onPress={() => router.navigate("/login/loginScreen")}
        >
          <Text className="text-blue-500 font-semibold text-lg text-center pl-2">
            Đăng nhập
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default SignUpPhoneScreen;
