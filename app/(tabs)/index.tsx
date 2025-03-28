import { TouchableOpacity, Text, View, Alert, Platform } from "react-native";

import { useAuthStore } from "@/store/authStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return <View className="flex-1 items-center "></View>;
}
