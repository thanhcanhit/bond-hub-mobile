import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DiscoveryScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 items-center">
      <Text
        className="text-black text-2xl p-8 text-center font-bold "
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : 10,
        }}
      >
        Discovery Screen
      </Text>
    </View>
  );
}
