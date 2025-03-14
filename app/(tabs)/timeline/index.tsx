import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 items-center ">
      <Text
        className="text-black text-2xl p-8 text-center font-bold"
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : 10,
        }}
      >
        Timeline Screen
      </Text>
    </View>
  );
}
