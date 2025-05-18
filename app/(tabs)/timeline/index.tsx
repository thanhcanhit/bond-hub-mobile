import { Platform, Text, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Construction } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 items-center justify-center bg-white px-6"
      style={{
        paddingTop: insets.top > 0 ? 0 : 20,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="items-center">
        <Construction
          size={80}
          color={Colors.light.PRIMARY_BLUE}
          strokeWidth={1.5}
        />

        <Text className="text-2xl font-bold mt-6 text-center text-gray-800">
          Tính năng đang phát triển
        </Text>

        <Text className="text-base text-gray-600 mt-4 text-center leading-6">
          Chúng tôi đang tích cực phát triển tính năng khám phá. Bạn sẽ sớm có
          thể tìm kiếm và kết nối với những người dùng mới!
        </Text>

        <View className="bg-blue-50 rounded-xl p-4 mt-8 w-full">
          <Text className="text-sm text-blue-700 font-medium">Sắp ra mắt:</Text>
          <View className="mt-2">
            <Text className="text-gray-700 mb-1.5">• Tìm kiếm người dùng</Text>
            <Text className="text-gray-700 mb-1.5">
              • Khám phá nhóm chat phổ biến
            </Text>
            <Text className="text-gray-700 mb-1.5">
              • Gợi ý bạn bè theo sở thích
            </Text>
            <Text className="text-gray-700">• Tạo nhóm chat theo chủ đề</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
