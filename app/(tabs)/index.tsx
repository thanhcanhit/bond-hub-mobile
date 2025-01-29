import { TouchableOpacity, Text, View } from "react-native";

import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View>
      <Text className="text-black p-8 font-bold">Home Screen</Text>
      <TouchableOpacity onPress={() => router.push("/login/loginScreen")}>
        <Text className="text-black p-8 font-bold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
