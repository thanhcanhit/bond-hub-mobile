import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  ArrowLeft,
  MessageCircle,
  UserPlus,
  UserCheck,
  Ellipsis,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import * as userService from "@/services/user-service";
import * as friendService from "@/services/friend-service";
import { HStack } from "@/components/ui/hstack";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/select/select-actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id, introduce, refresh } = useLocalSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isPendingSent, setIsPendingSent] = useState(false);
  const [isPendingReceived, setIsPendingReceived] = useState(false);
  const [friendRequestId, setFriendRequestId] = useState<string | null>(null);
  const [notRelated, setNotRelated] = useState(false);
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);

  // Connect to the friends namespace for real-time updates
  const { socket, isConnected, error: socketError } = useSocket("friends");

  // Log socket connection status changes
  useEffect(() => {
    if (isConnected) {
      console.log(`Socket connected to friends namespace for user ${id}`);
    } else if (socketError) {
      console.error(`Socket connection error for user ${id}:`, socketError);
    }
  }, [isConnected, socketError, id]);

  useEffect(() => {
    fetchUserInfo("mount");
  }, [id]);

  // Listen for reload events from the WebSocket server
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log(`Connected to friends socket for user ${id}`);

    // Listen for reload events
    const handleReload = () => {
      console.log("Received reload event from server, refreshing profile");
      fetchUserInfo("websocket");
    };

    socket.on("reload", handleReload);

    // Cleanup listener when component unmounts or socket changes
    return () => {
      console.log(`Removing reload listener for user ${id}`);
      socket.off("reload", handleReload);
    };
  }, [socket, isConnected, id]);

  // Cập nhật dữ liệu khi tham số refresh thay đổi
  useEffect(() => {
    if (refresh === "true") {
      console.log("Refreshing user profile due to refresh parameter");
      fetchUserInfo("refresh-param");
    }
  }, [refresh]);

  // Kiểm tra biến toàn cục khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      // @ts-ignore - Bỏ qua cảnh báo TypeScript về biến toàn cục
      const friendRequestSent = global.FRIEND_REQUEST_SENT;

      if (friendRequestSent && friendRequestSent.userId === id) {
        console.log("Detected friend request sent, refreshing profile");
        fetchUserInfo("focus");
        // Xóa biến toàn cục sau khi đã sử dụng
        // @ts-ignore
        global.FRIEND_REQUEST_SENT = null;
      }

      return () => {};
    }, [id]),
  );

  const fetchUserInfo = async (source: string = "manual") => {
    if (!id || typeof id !== "string") {
      setError("ID người dùng không hợp lệ");
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Fetching user profile for ID: ${id} (source: ${source})`);
      setIsLoading(true);
      setError(null);
      const userData = await userService.getUserProfile(id);
      setUserProfile(userData);

      // Kiểm tra trạng thái bạn bè và lời mời kết bạn từ dữ liệu API in ra đúng cấu trúc json format

      console.log("User profile data:", JSON.stringify(userData, null, 2));

      // console.log("User profile data:", JSON.stringify(userData));

      // Kiểm tra các trạng thái mối quan hệ
      setIsFriend(userData.relationship?.status === "FRIEND");
      setIsPendingSent(userData.relationship?.status === "PENDING_SENT");
      setIsPendingReceived(
        userData.relationship?.status === "PENDING_RECEIVED",
      );
      setNotRelated(userData.relationship?.status === "NONE");

      // Lưu friendRequestId nếu có
      if (userData.relationship?.friendshipId) {
        setFriendRequestId(userData.relationship.friendshipId);
      } else {
        setFriendRequestId(null);
      }

      // Xóa tham số refresh khỏi URL sau khi đã cập nhật dữ liệu
      if (refresh === "true") {
        // Sử dụng router.replace để thay thế URL hiện tại mà không thêm vào lịch sử
        router.setParams({ refresh: undefined });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (userProfile?.id) {
      router.push({
        pathname: "/chat/[id]",
        params: { id: userProfile.id },
      });
    }
  };

  const handleAddFriend = () => {
    if (!userProfile?.id) return;

    // Điều hướng đến màn hình gửi lời mời kết bạn
    router.push({
      pathname: "/friend-contact/friend-request/[id]",
      params: {
        id: userProfile.id,
        // Sử dụng introduce từ params nếu có, nếu không thì dùng mặc định
        introduce: introduce || "Xin chào, mình muốn kết bạn với bạn.",
      },
    });
  };

  const handleCancelFriendRequest = async () => {
    if (!friendRequestId) return;

    try {
      setIsLoading(true);
      await friendService.cancelFriendRequest(friendRequestId);
      // Cập nhật trạng thái
      setIsPendingSent(false);
      setFriendRequestId(null);
    } catch (error) {
      console.error("Error canceling friend request:", error);
      Alert.alert(
        "Lỗi",
        "Không thể hủy lời mời kết bạn. Vui lòng thử lại sau.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!userProfile?.id) return;

    try {
      setIsLoading(true);
      await friendService.unfriend(userProfile.id);
      // Cập nhật trạng thái
      setIsFriend(false);
      setNotRelated(true);
      setShowUnfriendConfirm(false);
      Alert.alert("Thành công", "Đã hủy kết bạn thành công");
    } catch (error) {
      console.error("Error unfriending:", error);
      Alert.alert("Lỗi", "Không thể hủy kết bạn. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToFriendRequest = async (
    status: "ACCEPTED" | "DECLINED",
  ) => {
    if (!friendRequestId) return;

    try {
      setIsLoading(true);
      await friendService.respondToFriendRequest(friendRequestId, status);

      // Cập nhật trạng thái
      if (status === "ACCEPTED") {
        setIsFriend(true);
      }
      setIsPendingReceived(false);
      setFriendRequestId(null);
    } catch (error) {
      console.error(
        `Error ${status === "ACCEPTED" ? "accepting" : "rejecting"} friend request:`,
        error,
      );
      Alert.alert(
        "Lỗi",
        `Không thể ${status === "ACCEPTED" ? "đồng ý" : "từ chối"} lời mời kết bạn. Vui lòng thử lại sau.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ScrollView className="flex-1 bg-white">
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={Colors.light.PRIMARY_BLUE} />
            <Text className="text-gray-500 mt-2">Đang tải thông tin...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-red-500">{error}</Text>
            <TouchableOpacity
              onPress={() => fetchUserInfo("retry")}
              style={{
                marginTop: 16, // mt-4
                backgroundColor: "#EBF5FF", // bg-blue-50 equivalent
                paddingHorizontal: 16, // px-4
                paddingVertical: 8, // py-2
                borderRadius: 9999, // rounded-full
              }}
            >
              <Text style={{ color: "#3B82F6" }}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="relative">
              {/* Cover Image */}
              {userProfile?.userInfo?.coverImgUrl ? (
                <Image
                  source={{ uri: userProfile.userInfo.coverImgUrl }}
                  className="w-full h-[280px]"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-[280px] bg-gray-300" />
              )}

              {/* Header with transparent background */}
              <View
                className="absolute w-full flex-row justify-between p-4"
                style={{ paddingTop: insets.top }}
              >
                {/* WebSocket connection status indicator */}
                {/* {isConnected && (
                  <View
                    style={{
                      position: 'absolute',
                      top: insets.top + 4,
                      right: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      zIndex: 10
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#4CAF50',
                        marginRight: 4
                      }}
                    />
                    <Text style={{ color: 'white', fontSize: 10 }}>Live</Text>
                  </View>
                )} */}
                <TouchableOpacity onPress={() => router.back()}>
                  <ArrowLeft size={28} color="white" />
                </TouchableOpacity>
                {isFriend && (
                  <Menu
                    placement="bottom"
                    selectionMode="single"
                    trigger={({ ...triggerProps }) => {
                      return (
                        <TouchableOpacity {...triggerProps}>
                          <Ellipsis size={32} color="white" />
                        </TouchableOpacity>
                      );
                    }}
                    className="w-[180px]"
                  >
                    <MenuItem
                      key="Unfriend"
                      textValue="Unfriend"
                      className="px-2.5 py-2"
                      onPress={() => {
                        setShowUnfriendConfirm(true);
                      }}
                    >
                      <MenuItemLabel size="lg">Hủy kết bạn</MenuItemLabel>
                    </MenuItem>
                  </Menu>
                )}
              </View>

              <View className="absolute -bottom-16 w-full items-center">
                <Avatar size="2xl">
                  <AvatarFallbackText>
                    {userProfile?.userInfo?.fullName || "User"}
                  </AvatarFallbackText>
                  {userProfile?.userInfo?.profilePictureUrl && (
                    <AvatarImage
                      source={{ uri: userProfile.userInfo.profilePictureUrl }}
                    />
                  )}
                </Avatar>
              </View>
            </View>

            {/* User Info */}
            <View className="mt-20 items-center">
              <Text className="text-2xl font-medium text-gray-800">
                {userProfile?.userInfo?.fullName || "Người dùng"}
              </Text>
              {userProfile?.userInfo?.bio && (
                <Text className="text-gray-500 mt-2 px-4 text-center">
                  {userProfile.userInfo.bio}
                </Text>
              )}
            </View>

            {/* Status message */}
            <View className="mt-4 items-center">
              {isPendingSent ? (
                <Text className="text-gray-500 text-center px-8">
                  Lời mời kết bạn đã được gửi đi. Hãy để lại tin nhắn cho{" "}
                  {userProfile?.userInfo?.fullName || "người dùng này"} trong
                  lúc chờ đợi nhé!
                </Text>
              ) : isPendingReceived ? (
                <Text className="text-gray-500 text-center px-8">
                  {userProfile?.userInfo?.fullName || "Người dùng này"} đã gửi
                  cho bạn lời mời kết bạn
                </Text>
              ) : notRelated ? (
                <Text className="text-gray-500 text-center px-8">
                  Bạn chưa thể xem nhật ký của{" "}
                  {userProfile?.userInfo?.fullName || "người dùng này"} khi chưa
                  là bạn bè
                </Text>
              ) : null}
            </View>

            {/* Action Buttons */}
            <HStack className="mt-6 px-4 justify-center space-x-4">
              {isFriend ? (
                <TouchableOpacity
                  className="flex-1 bg-blue-500 py-2.5 rounded-full items-center"
                  onPress={handleSendMessage}
                >
                  <HStack className="items-center" space="xs">
                    <MessageCircle size={24} color="white" />
                    <Text className="text-white font-medium">Nhắn tin</Text>
                  </HStack>
                </TouchableOpacity>
              ) : isPendingSent ? (
                <TouchableOpacity
                  className="flex-1 bg-gray-200 py-2.5 rounded-full items-center"
                  onPress={handleCancelFriendRequest}
                >
                  <HStack className="items-center space-x-2" space="xs">
                    <UserCheck size={24} color="gray" />
                    <Text className="text-gray-500 font-medium">
                      Hủy lời mời kết bạn
                    </Text>
                  </HStack>
                </TouchableOpacity>
              ) : isPendingReceived ? (
                <HStack className="w-full justify-center space-x-2" space="xs">
                  {/* Nút đồng ý */}
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    className="bg-blue-500 py-2.5 rounded-full items-center justify-center"
                    onPress={() => handleRespondToFriendRequest("ACCEPTED")}
                  >
                    <Text className="text-white font-medium">Đồng ý</Text>
                  </TouchableOpacity>

                  {/* Nút từ chối */}
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    className="bg-gray-200 py-2.5 rounded-full items-center justify-center"
                    onPress={() => handleRespondToFriendRequest("DECLINED")}
                  >
                    <Text className="text-gray-500 font-medium">Từ chối</Text>
                  </TouchableOpacity>
                </HStack>
              ) : (
                <HStack className="w-full justify-center space-x-2" space="xs">
                  {/* Nút nhắn tin - chiếm 8 phần */}
                  <TouchableOpacity
                    style={{ flex: 9 }}
                    className="bg-blue-100 py-2.5 rounded-full items-center justify-center"
                    onPress={handleSendMessage}
                  >
                    <HStack className="items-center" space="xs">
                      <MessageCircle size={24} color="#3B82F6" />
                      <Text className="text-blue-500 font-medium">
                        Nhắn tin
                      </Text>
                    </HStack>
                  </TouchableOpacity>

                  {/* Nút kết bạn - chiếm 2 phần */}
                  <TouchableOpacity
                    style={{ flex: 2 }}
                    className="bg-blue-50 ml-1 py-2.5 rounded-full items-center justify-center"
                    onPress={handleAddFriend}
                  >
                    <HStack className="items-center space-x-2">
                      <UserPlus size={24} color="black" />
                    </HStack>
                  </TouchableOpacity>
                </HStack>
              )}
            </HStack>

            {/* Suggested Friends Section */}
            <View className="mt-8 px-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-medium">Có thể bạn quen</Text>
                <TouchableOpacity>
                  <Text className="text-blue-500">Xem thêm</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[1, 2, 3, 4].map((item) => (
                  <View key={item} className="mr-4 items-center w-24">
                    <TouchableOpacity className="relative">
                      <Avatar size="lg">
                        <AvatarFallbackText>User {item}</AvatarFallbackText>
                      </Avatar>
                      <TouchableOpacity className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                        <Text className="text-gray-500">×</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                    <Text
                      className="text-center mt-2 text-sm"
                      numberOfLines={2}
                    >
                      Nguyễn Thị {item}
                    </Text>
                    <TouchableOpacity className="mt-2 bg-blue-100 px-3 py-1 rounded-full">
                      <Text className="text-blue-500 text-xs">Kết bạn</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>

      {/* Unfriend Confirmation ActionSheet */}
      {userProfile && (
        <Actionsheet
          isOpen={showUnfriendConfirm}
          onClose={() => setShowUnfriendConfirm(false)}
        >
          <ActionsheetBackdrop />
          <ActionsheetContent className="px-4 pb-6">
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>

            <View className="items-center w-full mt-2 mb-6">
              <Text className="mb-4 text-xl font-bold text-center">
                Xác nhận hủy kết bạn
              </Text>
              <Text className="mb-6 text-base text-center text-gray-600">
                Bạn có chắc chắn muốn hủy kết bạn với{" "}
                {userProfile?.userInfo?.fullName || "người dùng này"} không?
              </Text>

              <View className="flex-row justify-between w-full gap-4">
                <Button
                  action="negative"
                  variant="outline"
                  onPress={() => setShowUnfriendConfirm(false)}
                  className="flex-1 rounded-full"
                >
                  <ButtonText className="text-red-500">Hủy bỏ</ButtonText>
                </Button>
                <Button
                  action="primary"
                  onPress={handleUnfriend}
                  className="flex-1 bg-red-500 rounded-full"
                >
                  <ButtonText>Xác nhận</ButtonText>
                </Button>
              </View>
            </View>
          </ActionsheetContent>
        </Actionsheet>
      )}
    </>
  );
}
