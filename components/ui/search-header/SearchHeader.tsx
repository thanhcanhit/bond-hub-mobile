import React from "react";
import { View, TouchableOpacity, Platform, Text } from "react-native";
import { Colors } from "@/constants/Colors";
import {
  Search,
  Plus,
  Settings,
  UserPlus,
  ImagePlus,
  QrCode,
} from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
type SearchHeaderProps = {
  screenName: "index" | "contacts" | "discovery" | "timeline" | "info";
  onSearch?: (text: string) => void;
  onActionPress?: () => void;
};

export default function SearchHeader({
  screenName,
  onSearch,
  onActionPress,
}: SearchHeaderProps) {
  const insets = useSafeAreaInsets();

  const renderActionIcons = () => {
    switch (screenName) {
      case "index":
        return (
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.push("/login/qr-login")}
              className="mr-4"
            >
              <QrCode size={25} stroke={"white"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onActionPress} className="mr-4">
              <Plus size={28} color="white" />
            </TouchableOpacity>
          </View>
        );
      case "contacts":
        return (
          <TouchableOpacity
            onPress={() => router.push("/friend-contact/search-user")}
            className="mr-4"
          >
            <UserPlus size={25} color="white" />
          </TouchableOpacity>
        );
      case "discovery":
        return (
          <TouchableOpacity onPress={onActionPress} className="mr-4">
            <QrCode size={25} stroke="white" />
          </TouchableOpacity>
        );
      case "timeline":
        return (
          <TouchableOpacity onPress={onActionPress} className="mr-4">
            <ImagePlus size={25} color="white" />
          </TouchableOpacity>
        );
      case "info":
        return (
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            className="mr-4"
          >
            <Settings size={25} color="white" />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      start={{ x: 0.03, y: 0 }}
      end={{ x: 0.99, y: 2.5 }}
      colors={["#297eff", "#228eff", "#00d4ff"]}
    >
      <View
        className="flex-row items-center justify-between "
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : 20,
        }}
      >
        <View className="flex-1">
          <TouchableOpacity
            onPress={() => {}}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Search size={23} color="white" />
            <Text className="pl-6 text-xl text-white opacity-60">Tìm kiếm</Text>
          </TouchableOpacity>
        </View>
        {renderActionIcons()}
      </View>
    </LinearGradient>
  );
}
