import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DiscoveryScreen() {
  const insets = useSafeAreaInsets();
  return <View className="flex-1 items-center"></View>;
}
