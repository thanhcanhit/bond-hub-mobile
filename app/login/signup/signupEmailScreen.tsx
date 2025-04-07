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
import { useAuthStore } from "@/store/authStore";

const SignUpEmailScreen = () => {
  const [inputValue, setInputValue] = useState("");
  const [isEmail, setIsEmail] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [socialTermsAccepted, setSocialTermsAccepted] = useState(false);
  const { initiateRegistration } = useAuthStore();

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = async () => {
    if (!inputValue) {
      alert(isEmail ? "Vui lòng nhập email" : "Vui lòng nhập số điện thoại");
      return;
    }

    if (isEmail && !validateEmail(inputValue)) {
      alert("Email không hợp lệ");
      return;
    }

    if (!isEmail && !validatePhoneNumber(inputValue)) {
      alert("Số điện thoại không hợp lệ");
      return;
    }

    if (!termsAccepted || !socialTermsAccepted) {
      alert("Vui lòng đồng ý với các điều khoản dịch vụ");
      return;
    }

    try {
      await initiateRegistration(
        isEmail ? inputValue : undefined,
        !isEmail ? inputValue : undefined,
      );
      router.navigate({
        pathname: "/login/signup/signupOTPScreen",
        params: { [isEmail ? "email" : "phoneNumber"]: inputValue },
      });
    } catch (error: any) {
      alert(error.response?.data?.message || "Đã có lỗi xảy ra");
    }
  };

  return (
    <View className="flex-1 justify-between items-center bg-white pt-8 pb-8">
      <View>
        <Text className="text-[20px] font-semibold text-gray-700 text-center mt-12 mb-2">
          {isEmail ? "NHẬP EMAIL CỦA BẠN" : "NHẬP SỐ ĐIỆN THOẠI CỦA BẠN"}
        </Text>
        <TouchableOpacity onPress={() => setIsEmail(!isEmail)} className="mb-4">
          <Text className="text-blue-500 text-center">
            {isEmail ? "Đăng ký bằng số điện thoại" : "Đăng ký bằng email"}
          </Text>
        </TouchableOpacity>
        <Input
          variant="outline"
          size="xl"
          isDisabled={false}
          isInvalid={false}
          isReadOnly={false}
          className="rounded-[10px] my-4 h-16"
        >
          <InputField
            placeholder={isEmail ? "Email ..." : "Số điện thoại ..."}
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType={isEmail ? "email-address" : "phone-pad"}
            autoCapitalize="none"
          />
        </Input>
        <Checkbox
          size="lg"
          isInvalid={false}
          isDisabled={false}
          value={termsAccepted.toString()}
          isHovered={true}
          className="my-2 ml-2 "
          onChange={setTermsAccepted}
        >
          <CheckboxIndicator>
            <CheckboxIcon as={CheckIcon} className="bg-blue-500" />
          </CheckboxIndicator>
          <CheckboxLabel>
            I agree to{" "}
            <Text className="text-blue-500 font-semibold">
              Vodka Terms Of Service
            </Text>
          </CheckboxLabel>
        </Checkbox>
        <Checkbox
          size="lg"
          isInvalid={false}
          isDisabled={false}
          value={socialTermsAccepted.toString()}
          isHovered={true}
          className="my-2 ml-2 bg-transparent"
          onChange={setSocialTermsAccepted}
        >
          <CheckboxIndicator className="bg-transparent">
            <CheckboxIcon as={CheckIcon} className="bg-blue-500 " />
          </CheckboxIndicator>
          <CheckboxLabel>
            I agree to{" "}
            <Text className="text-blue-500 font-semibold">
              Vodka's Social Terms Of Service
            </Text>
          </CheckboxLabel>
        </Checkbox>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!termsAccepted || !socialTermsAccepted}
          className={`py-4 rounded-full items-center mt-12 ${!termsAccepted || !socialTermsAccepted ? "bg-gray-400" : "bg-blue-500"}`}
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
export default SignUpEmailScreen;
