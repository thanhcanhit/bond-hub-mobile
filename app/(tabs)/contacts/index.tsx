import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 items-center "
      style={{
        paddingTop: Platform.OS === "ios" ? insets.top : 10,
      }}
    ></View>
  );
}
