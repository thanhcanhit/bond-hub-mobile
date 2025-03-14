import { TouchableOpacity, Text, View, Alert } from "react-native";

import { useAuthStore } from "@/store/authStore";

export default function HomeScreen() {
  const { user, logout } = useAuthStore();
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
    <View className="flex-1 items-center ">
      <Text className="text-black text-2xl p-8 text-center font-bold pt-10">
        Home Screen
      </Text>
      {user && (
        <View className="p-8 justify-center items-center">
          <Text className="text-black text-lg">{user.fullName}</Text>
          <Text className="text-black text-lg">{user.email}</Text>
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
