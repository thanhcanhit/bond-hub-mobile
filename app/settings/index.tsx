import React from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
} from "react-native";
import {
  Bell,
  HelpCircle,
  Info,
  Lock,
  Palette,
  Shield,
  UserCircle,
  ChevronLeft,
  Search,
  LogOut,
  ArrowLeft,
  LogOutIcon,
  ShieldCheck,
  LockIcon,
  LockKeyhole,
  CircleFadingArrowUp,
  RefreshCcw,
  BellIcon,
  MessageCircleMore,
  Phone,
  Clock,
  BookUser,
  PaintBucket,
  InfoIcon,
  CircleHelp,
} from "lucide-react-native";
import { FunctionButton } from "@/components/ui/function-button";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import UserChange from "@/assets/svgs/userChange.svg";
const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();
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
    <View className="flex-1 bg-gray-100 ">
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={["#297eff", "#228eff", "#00d4ff"]}
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : 20,
          paddingBottom: 10,
        }}
      >
        <View className="flex-row items-center justify-between px-2.5 pt-2">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={23} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-medium">Cài đặt</Text>
          <TouchableOpacity className="">
            <Search size={23} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1">
        <FunctionButton
          icon={<ShieldCheck size={23} color={Colors.light.PRIMARY_BLUE} />}
          title="Tài khoản và bảo mật"
          onPress={() => {}}
          height={20}
          showBottomBorder={true}
        />
        <FunctionButton
          icon={<LockKeyhole size={23} color={Colors.light.PRIMARY_BLUE} />}
          title="Quyền riêng tư"
          onPress={() => {}}
          height={20}
        />
        <View className="h-2.5 w-full"></View>
        <FunctionButton
          icon={
            <CircleFadingArrowUp size={23} color={Colors.light.PRIMARY_BLUE} />
          }
          title="Dữ liệu trên máy"
          onPress={() => {}}
          height={20}
          showBottomBorder={true}
        />
        <FunctionButton
          icon={<RefreshCcw size={23} color={Colors.light.PRIMARY_BLUE} />}
          title="Sao lưu và khôi phục"
          onPress={() => {}}
          height={20}
        />
        <View className="h-2.5 w-full"></View>
        <FunctionButton
          icon={<BellIcon size={23} color={Colors.light.PRIMARY_BLUE} />}
          title="Thông báo"
          onPress={() => {}}
          height={20}
          showBottomBorder={true}
        />
        <FunctionButton
          icon={
            <MessageCircleMore size={23} color={Colors.light.PRIMARY_BLUE} />
          }
          title="Tin nhắn"
          onPress={() => {}}
          height={20}
          showBottomBorder={true}
        />
        <FunctionButton
          icon={<Phone size={23} color={Colors.light.PRIMARY_BLUE} />}
          title="Cuộc gọi"
          onPress={() => {}}
          height={20}
          showBottomBorder={true}
        />
        <FunctionButton
          icon={<Clock size={23} color={Colors.light.PRIMARY_BLUE} />}
          title="Nhật ký"
          onPress={() => {}}
          height={20}
          showBottomBorder={true}
        />
        <FunctionButton
          icon={<BookUser size={23} color={Colors.light.PRIMARY_BLUE} />}
          title="Danh bạ"
          onPress={() => {}}
          height={20}
          showBottomBorder={true}
        />
        <FunctionButton
          icon={<PaintBucket size={23} color={Colors.light.PRIMARY_BLUE} />}
          title="Giao diện và ngôn ngữ"
          onPress={() => {}}
          height={20}
          showBottomBorder={true}
        />
        <View className="h-2.5 w-full"></View>
        <FunctionButton
          icon={<InfoIcon size={23} color={Colors.light.PRIMARY_BLUE} />}
          title="Thông tin về BondHub"
          onPress={() => {}}
          height={20}
          showBottomBorder={true}
        />
        <FunctionButton
          icon={<CircleHelp size={23} color={Colors.light.PRIMARY_BLUE} />}
          title="Liên hệ hỗ trợ"
          onPress={() => {}}
          height={20}
          isExternalLink={true}
          showBottomBorder={true}
        />
        <View className="h-2.5 w-full"></View>
        <FunctionButton
          icon={
            <UserChange
              width={28}
              height={28}
              stroke={Colors.light.PRIMARY_BLUE}
              strokeWidth={1.5}
            />
          }
          title="Chuyển tài khoản"
          onPress={() => {}}
          height={20}
          showBottomBorder={true}
        />

        <TouchableOpacity
          className="flex-row justify-center mt-5 mb-5 mx-4 bg-gray-200 rounded-full py-4 items-center"
          onPress={handleLogout}
        >
          <Text className="text-black text-lg font-medium pr-2.5">
            Đăng xuất
          </Text>
          <LogOutIcon size={20} color={"black"} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
