import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";

// Mock data for received friend requests
const mockReceivedRequests = [
  {
    id: "1",
    sender: {
      id: "user1",
      fullName: "John Doe",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
    },
    description:
      "Xin chào, tôi là bạn của Alice. Rất vui được kết bạn với bạn!",
    sentAt: "2024-01-20T10:30:00",
  },
  {
    id: "2",
    sender: {
      id: "user2",
      fullName: "Jane Smith",
      avatarUrl: "https://i.pravatar.cc/150?img=2",
    },
    description: "Chúng ta đã gặp nhau tại sự kiện Tech Conference tuần trước.",
    sentAt: "2024-01-19T15:45:00",
  },
];

// Mock data for sent friend requests
const mockSentRequests = [
  {
    id: "3",
    receiver: {
      id: "user3",
      fullName: "Mike Johnson",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
    },
    description: "Chào bạn, tôi là đồng nghiệp của Bob tại công ty ABC.",
    sentAt: "2024-01-18T14:20:00",
  },
  {
    id: "4",
    receiver: {
      id: "user4",
      fullName: "Sarah Williams",
      avatarUrl: "https://i.pravatar.cc/150?img=4",
    },
    description: "Rất vui được gặp bạn tại buổi workshop hôm qua.",
    sentAt: "2024-01-17T09:15:00",
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "Hôm qua";
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};

const ReceivedRequestItem = ({
  request,
}: {
  request: (typeof mockReceivedRequests)[0];
}) => {
  const handleAccept = () => {
    console.log("Accept friend request:", request.id);
  };

  const handleReject = () => {
    console.log("Reject friend request:", request.id);
  };

  return (
    <VStack className="bg-white p-4 mb-2">
      <HStack className="items-center mb-2">
        <HStack className="items-start flex-1">
          <Avatar size="lg">
            <AvatarFallbackText>{request.sender.fullName}</AvatarFallbackText>
            {request.sender.avatarUrl && (
              <AvatarImage source={{ uri: request.sender.avatarUrl }} />
            )}
          </Avatar>
          <VStack className="ml-4 flex-1">
            <Text className="font-semibold text-lg">
              {request.sender.fullName}
            </Text>
            <Text className="text-gray-500 text-sm">
              {formatDate(request.sentAt)}
            </Text>
            <Text className="text-gray-600 my-3 border rounded-lg border-gray-300 p-2.5 py-3">
              {request.description}
            </Text>

            <HStack className="space-x-2">
              <TouchableOpacity
                onPress={handleReject}
                className="flex-1 bg-gray-100 py-2 rounded-full items-center mr-2"
              >
                <Text className="text-gray-600 font-medium">TỪ CHỐI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAccept}
                className="flex-1 bg-blue-100 py-2 rounded-full items-center ml-2"
              >
                <Text className="text-blue-500 font-medium">ĐỒNG Ý</Text>
              </TouchableOpacity>
            </HStack>
          </VStack>
        </HStack>
      </HStack>
    </VStack>
  );
};

const SentRequestItem = ({
  request,
}: {
  request: (typeof mockSentRequests)[0];
}) => {
  const handleCancel = () => {
    console.log("Cancel friend request:", request.id);
  };

  return (
    <VStack className="bg-white p-4 mb-2">
      <HStack className="items-center mb-2">
        <HStack className="items-start flex-1">
          <Avatar size="lg">
            <AvatarFallbackText>{request.receiver.fullName}</AvatarFallbackText>
            {request.receiver.avatarUrl && (
              <AvatarImage source={{ uri: request.receiver.avatarUrl }} />
            )}
          </Avatar>
          <VStack className="ml-4 flex-1">
            <Text className="font-semibold text-lg">
              {request.receiver.fullName}
            </Text>
            <Text className="text-gray-500 text-sm">
              {formatDate(request.sentAt)}
            </Text>
            <Text className="text-gray-600 my-3 border rounded-lg border-gray-300 p-2.5 py-3">
              {request.description}
            </Text>

            <TouchableOpacity
              onPress={handleCancel}
              className="bg-gray-100 py-2 rounded-full items-center ml-32"
            >
              <Text className="text-gray-600 font-medium ">HỦY LỜI MỜI</Text>
            </TouchableOpacity>
          </VStack>
        </HStack>
      </HStack>
    </VStack>
  );
};

export default function FriendRequestsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <HStack
        className="bg-blue-500 flex-row items-center p-4"
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : 14,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={26} color="white" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-white">
          Lời mời kết bạn
        </Text>
      </HStack>

      {/* Tabs */}
      <HStack className="bg-white">
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "received" ? "border-b-2 border-blue-500" : ""}`}
          onPress={() => setActiveTab("received")}
        >
          <Text
            className={`text-center ${activeTab === "received" ? "text-blue-500" : "text-gray-500"}`}
          >
            Đã nhận ({mockReceivedRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "sent" ? "border-b-2 border-blue-500" : ""}`}
          onPress={() => setActiveTab("sent")}
        >
          <Text
            className={`text-center ${activeTab === "sent" ? "text-blue-500" : "text-gray-500"}`}
          >
            Đã gửi ({mockSentRequests.length})
          </Text>
        </TouchableOpacity>
      </HStack>

      {/* Request Lists */}
      <ScrollView className="flex-1 pt-2">
        {activeTab === "received" ? (
          mockReceivedRequests.length > 0 ? (
            mockReceivedRequests.map((request) => (
              <ReceivedRequestItem key={request.id} request={request} />
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-gray-500">
                Không có lời mời kết bạn nào
              </Text>
            </View>
          )
        ) : mockSentRequests.length > 0 ? (
          mockSentRequests.map((request) => (
            <SentRequestItem key={request.id} request={request} />
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500">Chưa gửi lời mời kết bạn nào</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
