import { TouchableOpacity, Text, View, Alert } from "react-native";

import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function HomeScreen() {
  const { logout } = useAuthStore();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await SecureStore.getItemAsync("user");

      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    fetchUser();
  }, []);
  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", onPress: logout },
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
