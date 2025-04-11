import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { ArrowLeft, RefreshCw, Search, UserPlus } from "lucide-react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

const mockPhoneContacts = [
  {
    id: "1",
    fullName: "John Doe",
    phoneNumber: "+84 123 456 789",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    isFriend: true,
  },
  {
    id: "2",
    fullName: "Jane Smith",
    phoneNumber: "+84 987 654 321",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
    isFriend: false,
  },
  {
    id: "3",
    fullName: "Mike Johnson",
    phoneNumber: "+84 555 666 777",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    isFriend: true,
  },
  {
    id: "4",
    fullName: "Sarah Williams",
    phoneNumber: "+84 333 444 555",
    avatarUrl: "https://i.pravatar.cc/150?img=4",
    isFriend: false,
  },
];

const ContactItem = ({
  contact,
  showAddButton = false,
}: {
  contact: (typeof mockPhoneContacts)[0];
  showAddButton?: boolean;
}) => {
  const handleAddFriend = () => {
    console.log("Send friend request to:", contact.id);
  };

  return (
    <HStack className="items-center justify-between px-4 py-4 bg-white">
      <HStack className="items-center flex-1">
        <Avatar size="md">
          <AvatarFallbackText>{contact.fullName}</AvatarFallbackText>
          {contact.avatarUrl && (
            <AvatarImage source={{ uri: contact.avatarUrl }} />
          )}
        </Avatar>
        <VStack className="ml-3 flex-1">
          <Text className="text-base font-medium">{contact.fullName}</Text>
          <Text className="text-sm text-gray-500">{contact.phoneNumber}</Text>
        </VStack>
      </HStack>
      {showAddButton && !contact.isFriend ? (
        <TouchableOpacity
          onPress={handleAddFriend}
          className="bg-blue-500 px-4 py-1.5 rounded-full"
        >
          <Text className="text-white font-medium">Kết bạn</Text>
        </TouchableOpacity>
      ) : contact.isFriend ? (
        <Text className="text-gray-500 text-sm">Đã kết bạn</Text>
      ) : null}
    </HStack>
  );
};

export default function PhoneContactsScreen() {
  const insets = useSafeAreaInsets();
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "notFriends">("all");

  const handleUpdateContacts = async () => {
    setIsUpdating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsUpdating(false);
  };

  const filteredContacts = mockPhoneContacts.filter((contact) => {
    const matchesSearch =
      contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumber.includes(searchQuery);
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "notFriends" && !contact.isFriend);
    return matchesSearch && matchesFilter;
  });
  const totalContacts = mockPhoneContacts.length;
  const notFriendsCount = mockPhoneContacts.filter(
    (contact) => !contact.isFriend,
  ).length;
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={["#297eff", "#228eff", "#00d4ff"]}
      >
        <HStack
          className="bg-transparent items-center p-4"
          style={{
            paddingTop: Platform.OS === "ios" ? insets.top : 14,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={26} color="white" />
          </TouchableOpacity>
          <Text className="ml-4 text-lg font-semibold text-white">
            Danh bạ máy
          </Text>
        </HStack>
      </LinearGradient>

      {/* Contact list */}
      <ScrollView className="flex-1" stickyHeaderIndices={[1]}>
        <TouchableOpacity
          onPress={handleUpdateContacts}
          disabled={isUpdating}
          className={`flex-row items-center justify-center py-4 rounded-full mx-20 mt-4 ${
            isUpdating ? "bg-gray-100" : "bg-blue-50"
          }`}
        >
          <Text className="mr-2 font-medium text-blue-500">
            {isUpdating ? "Đang cập nhật..." : "Cập nhật danh bạ"}
          </Text>
          <RefreshCw
            size={20}
            className={isUpdating ? "animate-spin" : ""}
            color={Colors.light.PRIMARY_BLUE}
          />
        </TouchableOpacity>
        <VStack className="p-4 bg-white">
          {/* Sync button */}

          {/* Search bar */}
          <View className="flex-row items-center px-4  py-4 bg-gray-100 rounded-full ">
            <Search size={22} color="gray" />
            <TextInput
              className="flex-1 ml-2.5 text-base "
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter tabs */}
          <HStack className="py-4 flex-row justify-start items-start border-gray-200 border-b-[1px]">
            <TouchableOpacity
              className={`py-2 rounded-full mr-2 w-24 ${
                activeFilter === "all" ? "bg-gray-200" : "bg-gray-100"
              }`}
              onPress={() => setActiveFilter("all")}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  activeFilter === "all" ? "text-black" : "text-gray-600"
                }`}
              >
                Tất cả ({totalContacts})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`py-2 rounded-full  w-32 ${
                activeFilter === "notFriends" ? "bg-gray-200" : "bg-gray-100"
              }`}
              onPress={() => setActiveFilter("notFriends")}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  activeFilter === "notFriends" ? "text-black" : "text-gray-600"
                }`}
              >
                Chưa kết bạn ({notFriendsCount})
              </Text>
            </TouchableOpacity>
          </HStack>
        </VStack>
        <View className="mt-2">
          {filteredContacts.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              showAddButton={activeFilter === "notFriends"}
            />
          ))}
        </View>
        {filteredContacts.length === 0 && (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500">Không tìm thấy liên hệ nào</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
