import { useAuthStore } from "@/store/authStore";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function InfoScreen() {
  const { user, userInfo, logout } = useAuthStore();
  const insets = useSafeAreaInsets();
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
      {user && (
        <View className="p-8 justify-center items-center">
          <Text className="text-black text-lg">{user.fullName}</Text>
          <Text className="text-black text-lg">{user.email}</Text>
          <Text className="text-black text-lg">{userInfo?.dateOfBirth}</Text>
          <Text className="text-black text-lg">{userInfo?.gender}</Text>
        </View>
      )}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-blue-500 rounded-xl h-16 w-32 items-center justify-center mt-10"
      >
        <Text className="text-white font-bold ">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
