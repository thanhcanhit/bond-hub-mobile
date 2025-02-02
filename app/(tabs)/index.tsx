import { TouchableOpacity, Text, View, Alert } from "react-native";

import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export const logout = async () => {
  try {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("user");
    router.replace("/login/loginScreen");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
export default function HomeScreen() {
  const router = useRouter();
  interface User {
    fullName: string;
    phoneNumber: string;
  }

  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    const userString = await SecureStore.getItemAsync("user");
    if (userString) {
      setUser(JSON.parse(userString));
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);
  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          onPress: async () => {
            await logout();
          },
        },
      ],
      { cancelable: false },
    );
  };
  return (
    <View className="flex-1 items-center pt-12">
      <Text className="text-black text-2xl p-8 text-center font-bold">
        Home Screen
      </Text>
      {user && (
        <View className="p-8 justify-center items-center">
          <Text className="text-black text-lg">{user.fullName}</Text>
          <Text className="text-black text-lg">{user.phoneNumber}</Text>
        </View>
      )}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-blue-500 rounded-xl h-16 w-32 items-center justify-center"
      >
        <Text className="text-white font-bold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
