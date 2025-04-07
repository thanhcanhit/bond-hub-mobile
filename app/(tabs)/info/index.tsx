import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { FunctionButton } from "@/components/ui/function-button";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import {
  CircleFadingArrowUp,
  Cloudy,
  LockKeyhole,
  ShieldCheck,
  Wallet,
} from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";
import UserChange from "@/assets/svgs/userChange.svg";
import { router } from "expo-router";
export default function InfoScreen() {
  const user = useAuthStore((state) => state.user);
  const userInfo = useAuthStore((state) => state.userInfo);

  return (
    <ScrollView className="flex-1  bg-gray-100">
      {user && (
        <FunctionButton
          avatar={
            <Avatar size="md">
              <AvatarFallbackText>{user.fullName}</AvatarFallbackText>
              {userInfo?.profilePictureUrl && (
                <AvatarImage source={{ uri: userInfo.profilePictureUrl }} />
              )}
            </Avatar>
          }
          title={user.fullName}
          description={"Xem trang cá nhân"}
          onPress={function (): void {
            router.push("/user-info");
          }}
          rightButton={
            <TouchableOpacity>
              <UserChange
                width={30}
                height={30}
                stroke={Colors.light.PRIMARY_BLUE}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          }
          size={"lg"}
        />
      )}
      <View className="h-2.5 w-full"></View>
      <FunctionButton
        icon={<Cloudy size={23} color={Colors.light.PRIMARY_BLUE} />}
        title={"Cloud của tôi"}
        description={"Lưu các tin nhắn quan trọng"}
        onPress={() => {}}
        showBottomBorder={true}
      />
      <FunctionButton
        icon={
          <CircleFadingArrowUp size={23} color={Colors.light.PRIMARY_BLUE} />
        }
        title={"Dữ liệu trên máy"}
        description={"Quản lý dữ liệu Vodka của bạn"}
        onPress={() => {}}
        showBottomBorder={true}
      />
      <FunctionButton
        icon={<Wallet size={23} color={Colors.light.PRIMARY_BLUE} />}
        title={"Ví QR"}
        description={"Lưu trữ và xuất trình các mã QR quan trọng"}
        onPress={() => {}}
      />
      <View className="h-2.5 w-full"></View>
      <FunctionButton
        icon={<ShieldCheck size={23} color={Colors.light.PRIMARY_BLUE} />}
        title={"Tài khoản và bảo mật"}
        onPress={() => {}}
        showBottomBorder={true}
      />
      <FunctionButton
        icon={<LockKeyhole size={23} color={Colors.light.PRIMARY_BLUE} />}
        title={"Quyền riêng tư"}
        onPress={() => {}}
      />
    </ScrollView>
  );
}
