import React from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, KeyRound, Mail, Phone } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FunctionButton } from "@/components/ui/function-button";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

export default function AccountSecurityScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={["#297eff", "#228eff", "#00d4ff"]}
      >
        <View
          className="flex-row bg-transparent items-center p-4"
          style={{ paddingTop: insets.top }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={"white"} />
          </TouchableOpacity>
          <Text className="text-lg text-white font-medium ml-4">
            Tài khoản và bảo mật
          </Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1">
        <FunctionButton
          icon={
            <KeyRound
              size={26}
              color={Colors.light.PRIMARY_BLUE}
              strokeWidth={1.5}
            />
          }
          title="Đổi mật khẩu"
          onPress={() =>
            router.push("/settings/account-security/change-password")
          }
          showBottomBorder={true}
        />

        <FunctionButton
          icon={
            <Mail
              size={26}
              color={Colors.light.PRIMARY_BLUE}
              strokeWidth={1.5}
            />
          }
          title="Đổi email"
          onPress={() => router.push("/settings/account-security/change-email")}
          showBottomBorder={true}
        />

        <FunctionButton
          icon={
            <Phone
              size={26}
              color={Colors.light.PRIMARY_BLUE}
              strokeWidth={1.5}
            />
          }
          title="Đổi số điện thoại"
          onPress={() => router.push("/settings/account-security/change-phone")}
        />
      </ScrollView>
    </View>
  );
}
