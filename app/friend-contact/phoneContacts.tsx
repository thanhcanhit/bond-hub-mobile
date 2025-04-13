import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { ArrowLeft, RefreshCw, Search } from "lucide-react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import * as Contacts from "expo-contacts";
import {
  ContactItem as ContactItemType,
  getContacts,
  syncContacts,
} from "@/services/friend-service";

// Interface cho contact item hiển thị trên UI
interface DisplayContact {
  id: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string | null;
  isFriend: boolean;
  friendshipId?: string;
}

const ContactItem = ({
  contact,
  showAddButton = false,
}: {
  contact: DisplayContact;
  showAddButton?: boolean;
}) => {
  const handleAddFriend = () => {
    console.log("Send friend request to:", contact.id);
  };

  const handleViewProfile = () => {
    router.push({
      pathname: "/user-info/[id]",
      params: { id: contact.id },
    });
  };

  return (
    <HStack className="items-center justify-between px-4 py-4 bg-white">
      <TouchableOpacity onPress={handleViewProfile} className="flex-1">
        <HStack className="items-center">
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
      </TouchableOpacity>
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
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "notFriends">("all");
  const [contacts, setContacts] = useState<DisplayContact[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách liên hệ khi component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // Lấy danh sách liên hệ từ API
  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getContacts();

      // Chuyển đổi dữ liệu từ API sang định dạng DisplayContact
      const formattedContacts = response.map((item) => ({
        id: item.contactUserId,
        fullName:
          item.contactUser.userInfo?.fullName ||
          item.nickname ||
          "Không có tên",
        phoneNumber: item.contactUser.phoneNumber,
        avatarUrl: item.contactUser.userInfo?.profilePictureUrl || null,
        isFriend: item.relationship?.status === "FRIEND",
        friendshipId: item.relationship?.friendshipId,
      }));

      setContacts(formattedContacts);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setError("Không thể tải danh sách liên hệ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Đồng bộ danh bạ điện thoại
  const handleUpdateContacts = async () => {
    try {
      setIsUpdating(true);
      setError(null);

      // Yêu cầu quyền truy cập danh bạ
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền truy cập", "Cần quyền truy cập danh bạ để đồng bộ");
        setIsUpdating(false);
        return;
      }

      // Lấy danh bạ từ thiết bị
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      if (data.length === 0) {
        Alert.alert("Thông báo", "Không tìm thấy liên hệ nào trong danh bạ");
        setIsUpdating(false);
        return;
      }

      // Chuyển đổi dữ liệu sang định dạng API yêu cầu
      const contactsToSync: ContactItemType[] = data
        .filter(
          (contact) =>
            contact.name &&
            contact.phoneNumbers &&
            contact.phoneNumbers.length > 0,
        )
        .map((contact) => ({
          name: contact.name || "",
          phone:
            contact.phoneNumbers &&
            contact.phoneNumbers[0] &&
            contact.phoneNumbers[0].number
              ? contact.phoneNumbers[0].number.replace(/\s+/g, "")
              : "",
        }));

      // Gọi API đồng bộ
      const result = await syncContacts(contactsToSync);
      console.log("Sync result:", result);

      // Tải lại danh sách liên hệ
      await fetchContacts();

      // Hiển thị thông báo thành công
      Alert.alert(
        "Thành công",
        `${result.message}\nĐã thêm: ${result.created}\nĐã xóa: ${result.deleted}`,
      );
    } catch (err) {
      console.error("Failed to sync contacts:", err);
      Alert.alert("Lỗi", "Không thể đồng bộ danh bạ. Vui lòng thử lại sau.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumber.includes(searchQuery);
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "notFriends" && !contact.isFriend);
    return matchesSearch && matchesFilter;
  });

  const totalContacts = contacts.length;
  const notFriendsCount = contacts.filter(
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
            paddingTop: Platform.OS === "ios" ? insets.top : insets.top,
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
        <VStack className="p-4 bg-white">
          {/* Search and sync container */}
          <HStack className="items-center justify-between space-x-3">
            {/* Search bar */}
            <View className="flex-row items-center px-4 py-3 bg-gray-100 rounded-full flex-1">
              <Search size={22} color="gray" />
              <TextInput
                className="flex-1 ml-2.5 text-base"
                placeholder="Tìm kiếm"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Sync button */}
            <TouchableOpacity
              onPress={handleUpdateContacts}
              disabled={isUpdating}
              className={`items-center justify-center p-3 rounded-full ${isUpdating ? "bg-gray-100" : "bg-blue-50"}`}
              style={{ width: 48, height: 48 }}
            >
              <RefreshCw
                size={22}
                className={isUpdating ? "animate-spin" : ""}
                color={Colors.light.PRIMARY_BLUE}
              />
            </TouchableOpacity>
          </HStack>

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
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator size="large" color={Colors.light.PRIMARY_BLUE} />
            <Text className="text-gray-500 mt-2">Đang tải danh bạ...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-red-500">{error}</Text>
            <TouchableOpacity
              onPress={fetchContacts}
              className="mt-4 bg-blue-50 px-4 py-2 rounded-full"
            >
              <Text className="text-blue-500">Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
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
                <Text className="text-gray-500">
                  Không tìm thấy liên hệ nào
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
