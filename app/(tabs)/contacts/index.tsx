import {
  Platform,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Colors } from "@/constants/Colors";
import {
  Phone,
  Video,
  UserPlus,
  Users,
  Gift,
  Contact,
  Plus,
  UserRoundPlus,
  Cake,
} from "lucide-react-native";
import ListChatItem from "@/components/ListChatItem";
import { router } from "expo-router";

const mockFriends = [
  {
    id: "1",
    fullName: "Alice Johnson",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    fullName: "Bob Smith",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
  },
  // Add more mock data as needed
];

const mockGroups = [
  {
    id: "1",
    name: "Project Team",
    lastMessage: "Meeting tomorrow at 10 AM",
    lastMessageTime: "2024-01-20T10:30:00",
    isGroup: true,
    unreadCount: 2,
  },
  // Add more mock groups as needed
];

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"friends" | "groups">("friends");

  const groupedFriends = mockFriends.reduce(
    (acc, friend) => {
      const firstLetter = friend.fullName[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(friend);
      return acc;
    },
    {} as Record<string, typeof mockFriends>,
  );

  const sortedLetters = Object.keys(groupedFriends).sort();

  const FriendItem = ({ friend }: { friend: (typeof mockFriends)[0] }) => (
    <TouchableOpacity className="flex flex-row my-2 items-center justify-between px-4 py-2">
      <HStack className="items-center flex-1">
        <Avatar size="lg">
          <AvatarFallbackText>{friend.fullName}</AvatarFallbackText>
          {friend.avatarUrl && (
            <AvatarImage source={{ uri: friend.avatarUrl }} />
          )}
        </Avatar>
        <Text className="ml-4 text-lg ">{friend.fullName}</Text>
      </HStack>
      <HStack className="space-x-4">
        <TouchableOpacity className="pr-4">
          <Phone size={24} color={"gray"} strokeWidth={1.5} />
        </TouchableOpacity>
        <TouchableOpacity className="px-2.5">
          <Video size={26} color={"gray"} strokeWidth={1.5} />
        </TouchableOpacity>
      </HStack>
    </TouchableOpacity>
  );

  const FunctionButton = ({ icon, title, onPress }: any) => (
    <TouchableOpacity
      className="flex-row items-center px-4 py-4 bg-white"
      onPress={onPress}
    >
      {icon}
      <Text className="ml-4 text-lg text-gray-600">{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <HStack className=" px-4  bg-white">
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "friends" ? "border-b-2 border-blue-500" : ""}`}
          onPress={() => setActiveTab("friends")}
        >
          <Text
            className={`text-center ${activeTab === "friends" ? "text-blue-500" : "text-gray-500"}`}
          >
            Bạn bè
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "groups" ? "border-b-2 border-blue-500" : ""}`}
          onPress={() => setActiveTab("groups")}
        >
          <Text
            className={`text-center ${activeTab === "groups" ? "text-blue-500" : "text-gray-500"}`}
          >
            Nhóm
          </Text>
        </TouchableOpacity>
      </HStack>
      <View className="h-1 bg-gray-100" />
      {activeTab === "friends" ? (
        <ScrollView className="bg-white">
          <VStack className="mt-2">
            <FunctionButton
              icon={
                <UserRoundPlus
                  size={26}
                  color={Colors.light.PRIMARY_BLUE}
                  strokeWidth={1.5}
                />
              }
              title="Lời mời kết bạn"
              onPress={() => router.push("/friend-contact/friend-requests")}
            />
            <FunctionButton
              icon={
                <Contact
                  size={26}
                  color={Colors.light.PRIMARY_BLUE}
                  strokeWidth={1.5}
                />
              }
              title="Danh bạ máy"
              // onPress={() => router.push("/phone-contacts")}
            />
            <FunctionButton
              icon={
                <Cake
                  size={28}
                  color={Colors.light.PRIMARY_BLUE}
                  strokeWidth={1.5}
                />
              }
              title="Sinh nhật"
              // onPress={() => router.push("/birthdays")}
            />
          </VStack>

          <VStack className="mt-4 ">
            {sortedLetters.map((letter) => (
              <View key={letter}>
                <Text className="px-4 py-2 text-md text-gray-500 bg-gray-100">
                  {letter}
                </Text>
                {groupedFriends[letter].map((friend) => (
                  <FriendItem key={friend.id} friend={friend} />
                ))}
              </View>
            ))}
          </VStack>
        </ScrollView>
      ) : (
        <View>
          <TouchableOpacity
            className="flex-row items-center px-4 py-3  bg-white"
            onPress={() => {}}
          >
            <View className="items-center justify-center w-14 h-14 bg-blue-100 rounded-full">
              <Users size={24} color={Colors.light.PRIMARY_BLUE} />
            </View>
            <Text className="ml-4 text-md text-gray-600">Tạo nhóm mới</Text>
          </TouchableOpacity>

          <View className="mt-1 pt-4 pb-10 h-full bg-white">
            <ListChatItem data={mockGroups} />
          </View>
        </View>
      )}
    </View>
  );
}
