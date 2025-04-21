import React, { useState, useEffect, useRef } from "react";
import CustomToastRed from "@/components/CustomToastRed";
import QRCode from "react-native-qrcode-svg";
import { io, Socket } from "socket.io-client";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  ArrowLeft,
  Edit2,
  UserPlus,
  LogOut,
  Trash2,
  Camera,
  Phone,
  MessageSquare,
  X,
  User,
  ShieldAlert,
  Home,
  QrCode,
  Search,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { groupService } from "@/services/group-service";
import { getFriendList, Friend } from "@/services/friend-service";
// Removed unused imports
import { Group, GroupMember } from "@/types";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Constants from "expo-constants";

export default function GroupInfoScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const groupId = params.id;
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedMember, setSelectedMember] =
    useState<ExtendedGroupMember | null>(null);
  const [showMemberInfo, setShowMemberInfo] = useState(false);
  const [showTransferLeadershipModal, setShowTransferLeadershipModal] =
    useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [addMembersLoading, setAddMembersLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Thiết lập kết nối WebSocket
  const setupWebSocket = () => {
    // Kiểm tra nếu socket đã tồn tại và đã kết nối, không cần tạo lại
    if (socketRef.current?.connected) {
      console.log("Socket already connected, reusing existing connection");
      return;
    }
    console.log("Setting up WebSocket", Constants.expoConfig?.extra?.apiUrl);
    try {
      // Lấy URL gốc từ Constants.expoConfig.extra.apiUrl hoặc trực tiếp từ biến môi trường
      let apiUrl;

      // Thử lấy từ Constants.expoConfig
      if (Constants.expoConfig?.extra?.apiUrl) {
        apiUrl = Constants.expoConfig.extra.apiUrl;
      }
      // Thử lấy trực tiếp từ biến môi trường
      else if (
        typeof process !== "undefined" &&
        process.env &&
        process.env.EXPO_PUBLIC_API_URL
      ) {
        apiUrl = process.env.EXPO_PUBLIC_API_URL;
      }
      // Sử dụng URL cứng nếu không có cách nào khác
      else {
        apiUrl = "http://bondhub.cloud:3000/api/v1";
      }

      // Log ra URL gốc để debug
      console.log("Original API URL:", apiUrl);

      // Loại bỏ "/api/v1" nếu có
      if (apiUrl.includes("/api/v1")) {
        apiUrl = apiUrl.replace("/api/v1", "");
      }

      // Nếu URL là bondhub.cloud, sử dụng trực tiếp
      if (apiUrl.includes("bondhub.cloud")) {
        // Tách URL thành các phần
        const urlParts = apiUrl.split("/");
        // Lấy phần domain và port (nếu có)
        apiUrl = urlParts[0] + "//" + urlParts[2];
      }

      console.log("Base API URL after processing:", apiUrl);
      console.log("Connecting to WebSocket at:", `${apiUrl}/groups`);
      console.log("Current user ID:", currentUser?.userId);

      // Sử dụng URL cứng để đảm bảo kết nối hoạt động

      // Sử dụng URL cứng đã được xác nhận hoạt động
      apiUrl = "http://bondhub.cloud:3000";
      console.log("Using confirmed working URL:", apiUrl);

      // Log ra thông tin để debug
      console.log("Group ID:", groupId);
      console.log("User ID:", currentUser?.userId);
      console.log("Device info:", Platform.OS, Platform.Version);

      // Tạo kết nối socket trực tiếp đến URL của server
      console.log("Final WebSocket URL:", `${apiUrl}/groups`);

      // Tạo kết nối socket
      const socket = io(`${apiUrl}/groups`, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      // Xử lý sự kiện kết nối
      socket.on("connect", () => {
        console.log("WebSocket connected, socket ID:", socket.id);
        console.log("Socket connected:", socket.connected);
        // Không sử dụng socket.nsp vì nó là thuộc tính private

        // Tham gia vào phòng nhóm
        if (currentUser?.userId) {
          console.log(`Joining group room: group:${groupId}`);

          // Tham gia vào phòng nhóm
          try {
            socket.emit("joinGroup", { userId: currentUser.userId, groupId });
            console.log("Emitted joinGroup event");
          } catch (error) {
            console.error("Error emitting joinGroup event:", error);
          }

          // Gửi ping để kiểm tra kết nối
          try {
            socket.emit(
              "ping",
              { message: "Hello from client" },
              (response: any) => {
                console.log("Ping response:", response);
              },
            );
            console.log("Emitted ping event");
          } catch (error) {
            console.error("Error emitting ping event:", error);
          }
        }
      });

      // Xử lý sự kiện ngắt kết nối
      socket.on("disconnect", (reason) => {
        console.log("WebSocket disconnected:", reason);
      });

      // Xử lý sự kiện lỗi
      socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error.message);
        console.error("Error details:", error);

        // Thử kết nối lại với URL khác
        console.log("Trying to reconnect with different URL");
        setTimeout(() => {
          // Ngắt kết nối hiện tại
          socket.disconnect();

          // Thử tạo kết nối mới với URL khác
          try {
            const newUrl = "http://bondhub.cloud";
            console.log("Creating new connection to:", newUrl);

            // Tạo kết nối mới thay vì thay đổi URL của kết nối hiện tại
            const newSocket = io(newUrl, {
              transports: ["websocket"],
              autoConnect: true,
              reconnection: true,
            });

            // Cập nhật tham chiếu socket
            socketRef.current = newSocket;

            // Xử lý sự kiện kết nối của socket mới
            newSocket.on("connect", () => {
              console.log("New socket connected successfully");
            });

            // Xử lý lỗi kết nối của socket mới
            newSocket.on("connect_error", (newError) => {
              console.error("New socket connection error:", newError.message);
            });
          } catch (reconnectError) {
            console.error("Error creating new connection:", reconnectError);
          }
        }, 2000);
      });

      // Lắng nghe sự kiện cập nhật nhóm
      socket.on("groupUpdated", (data) => {
        console.log("Group updated event received:", data);
        fetchGroupDetails(); // Cập nhật lại thông tin nhóm
      });

      // Lắng nghe sự kiện thêm thành viên
      socket.on("memberAdded", (data) => {
        console.log("Member added event received:", data);
        fetchGroupDetails(); // Cập nhật lại thông tin nhóm
      });

      // Lắng nghe sự kiện xóa thành viên
      socket.on("memberRemoved", (data) => {
        console.log("Member removed event received:", data);
        fetchGroupDetails(); // Cập nhật lại thông tin nhóm
      });

      // Lắng nghe sự kiện thay đổi vai trò
      socket.on("roleChanged", (data) => {
        console.log("Role changed event received:", data);
        fetchGroupDetails(); // Cập nhật lại thông tin nhóm
      });

      // Lắng nghe sự kiện cập nhật avatar
      socket.on("avatarUpdated", (data) => {
        console.log("Avatar updated event received:", data);
        fetchGroupDetails(); // Cập nhật lại thông tin nhóm
      });

      // Lắng nghe sự kiện bị xóa khỏi nhóm
      socket.on("removedFromGroup", (data) => {
        console.log("Removed from group event received:", data);
        if (data.groupId === groupId) {
          // Hiển thị thông báo
          setToastMessage("Bạn đã bị xóa khỏi nhóm");
          setShowToast(true);

          // Chờ 1 giây rồi chuyển hướng về màn hình chính
          setTimeout(() => {
            router.replace("/(tabs)");
          }, 1000);
        }
      });

      // Lắng nghe sự kiện nhóm bị giải tán
      socket.on("groupDissolved", (data) => {
        console.log("Group dissolved event received:", data);
        if (data.groupId === groupId) {
          // Hiển thị thông báo
          setToastMessage(`Nhóm ${data.groupName || ""} đã bị giải tán`);
          setShowToast(true);

          // Chờ 1 giây rồi chuyển hướng về màn hình chính
          setTimeout(() => {
            router.replace("/(tabs)");
          }, 1000);
        }
      });

      // Đảm bảo socket được kết nối ngay lập tức
      socket.connect();
      console.log("Socket connection initiated");

      // Thêm sự kiện để kiểm tra trạng thái kết nối
      setTimeout(() => {
        if (socket.connected) {
          console.log("Socket successfully connected after timeout");
          // Gửi ping để kiểm tra kết nối
          socket.emit(
            "ping",
            { message: "Ping after timeout" },
            (response: any) => {
              console.log("Ping after timeout response:", response);
            },
          );
        } else {
          console.log("Socket still not connected after timeout");
          // Thử kết nối lại
          socket.connect();
        }
      }, 3000);

      // Thêm sự kiện lắng nghe ping từ server
      socket.on("pong", (data) => {
        console.log("Received pong from server:", data);
      });
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
    }
  };

  // Kết nối socket ngay khi component render
  useEffect(() => {
    // Kết nối socket ngay lập tức khi component render lần đầu tiên
    if (groupId && currentUser?.userId) {
      console.log("Initializing socket connection immediately");

      // Thử kết nối socket ngay lập tức
      setupWebSocket();

      // Thử kết nối lại sau 1 giây nếu cần
      const retryTimer = setTimeout(() => {
        if (!socketRef.current?.connected) {
          console.log("Retrying socket connection after delay");
          setupWebSocket();
        }
      }, 1000);

      // Cleanup timer
      return () => {
        clearTimeout(retryTimer);
        if (socketRef.current) {
          console.log("Disconnecting socket");
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }

    // Cleanup khi component unmount
    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [groupId, currentUser?.userId]); // Dependency array includes groupId and currentUser?.userId

  // Fetch group details when groupId or currentUser changes
  useEffect(() => {
    if (groupId) {
      console.log("Fetching group details for ID:", groupId);
      fetchGroupDetails();

      // Log ra thông tin để debug
      console.log("Socket reference exists:", !!socketRef.current);
      if (socketRef.current) {
        console.log("Socket connected status:", socketRef.current.connected);
      }
    } else {
      console.error("No group ID provided");
    }
  }, [groupId, currentUser?.userId]);

  // Kiểm tra trạng thái kết nối socket định kỳ
  useEffect(() => {
    if (!groupId || !currentUser?.userId) return;

    const intervalId = setInterval(() => {
      console.log("Periodic socket check:");
      console.log("- Socket reference exists:", !!socketRef.current);
      if (socketRef.current) {
        console.log("- Socket connected status:", socketRef.current.connected);
        console.log("- Socket ID:", socketRef.current.id || "not available");
      }
    }, 10000); // Kiểm tra mỗi 10 giây

    return () => clearInterval(intervalId);
  }, [groupId, currentUser?.userId]);

  // Không cần useEffect chuyển hướng nữa vì đã chuyển hướng trực tiếp

  const fetchGroupDetails = async () => {
    setIsLoading(true);
    try {
      // Sử dụng groupService để lấy thông tin nhóm
      const groupData = await groupService.getGroupDetails(groupId);

      if (groupData) {
        setGroup(groupData);
        setNewGroupName(groupData.name);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin nhóm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroupName = async () => {
    if (!newGroupName.trim() || !group) return;

    setIsUpdating(true);
    try {
      const updatedGroup = await groupService.updateGroup(groupId, {
        name: newGroupName,
      });
      if (updatedGroup) {
        setGroup(updatedGroup);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating group name:", error);
      Alert.alert("Lỗi", "Không thể cập nhật tên nhóm");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateGroupAvatar = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Cần quyền truy cập",
        "Cần quyền truy cập thư viện ảnh để chọn ảnh đại diện nhóm",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIsUpdating(true);
      try {
        const formData = new FormData();
        formData.append("file", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "group_avatar.jpg",
        } as any);

        const updatedGroup = await groupService.updateGroupAvatar(
          groupId,
          formData,
        );
        if (updatedGroup) {
          setGroup(updatedGroup);
        }
      } catch (error) {
        console.error("Error updating group avatar:", error);
        Alert.alert("Lỗi", "Không thể cập nhật ảnh đại diện nhóm");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleLeaveGroup = () => {
    // Kiểm tra xem người dùng có phải là trưởng nhóm không
    if (isGroupLeader) {
      // Nếu là trưởng nhóm, yêu cầu chuyển quyền trước
      Alert.alert(
        "Không thể rời nhóm",
        "Bạn đang là trưởng nhóm. Vui lòng chuyển quyền trưởng nhóm cho thành viên khác trước khi rời nhóm.",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Chuyển quyền ngay",
            onPress: handleTransferLeadership,
          },
        ],
      );
      return;
    }

    // Nếu không phải trưởng nhóm, cho phép rời nhóm bình thường
    Alert.alert("Rời nhóm", "Bạn có chắc chắn muốn rời khỏi nhóm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Rời nhóm",
        style: "destructive",
        onPress: async () => {
          setIsUpdating(true);
          try {
            console.log("Bước 1: Bắt đầu quá trình rời nhóm");

            try {
              // Gọi API rời nhóm
              await groupService.leaveGroup(groupId);
              console.log("Bước 2: Rời nhóm thành công");

              // Hiển thị thông báo rời nhóm thành công
              console.log("Bước 3: Hiển thị thông báo rời nhóm thành công");
              setToastMessage("Rời nhóm thành công");
              setShowToast(true);

              // Chờ 1 giây rồi chuyển hướng về màn hình chính
              console.log(
                "Bước 4: Chờ 1 giây rồi chuyển hướng về màn hình chính",
              );
              setTimeout(() => {
                router.replace("/(tabs)");
                console.log("Bước 5: Đã gọi router.replace");
              }, 1000);

              // Cập nhật danh sách cuộc trò chuyện (không chờ kết quả)
              try {
                const conversationsStore =
                  require("@/store/conversationsStore").useConversationsStore.getState();
                conversationsStore.fetchConversations(1);
                console.log(
                  "Bước 5: Đã gọi cập nhật danh sách cuộc trò chuyện",
                );
              } catch (storeError) {
                console.error(
                  "Lỗi khi cập nhật danh sách cuộc trò chuyện:",
                  storeError,
                );
              }
            } catch (apiError: any) {
              console.error(
                "Lỗi khi gọi API rời nhóm:",
                apiError?.response?.status,
                apiError?.response?.data || apiError.message,
              );
              throw apiError; // Chuyển tiếp lỗi để xử lý ở catch bên ngoài
            }
          } catch (error: any) {
            console.error("Error leaving group:", error);

            // Kiểm tra nếu lỗi là 403 (Forbidden) - trường hợp trưởng nhóm cố gắng rời nhóm
            if (error.response && error.response.status === 403) {
              Alert.alert(
                "Không thể rời nhóm",
                "Bạn đang là trưởng nhóm. Vui lòng chuyển quyền trưởng nhóm cho thành viên khác trước khi rời nhóm.",
                [
                  { text: "Hủy", style: "cancel" },
                  {
                    text: "Chuyển quyền ngay",
                    onPress: handleTransferLeadership,
                  },
                ],
              );
            } else {
              Alert.alert("Lỗi", "Không thể rời khỏi nhóm");
            }
          } finally {
            setIsUpdating(false);
          }
        },
      },
    ]);
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      "Xóa nhóm",
      "Bạn có chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa nhóm",
          style: "destructive",
          onPress: async () => {
            setIsUpdating(true);
            try {
              console.log("Bước 1: Bắt đầu quá trình xóa nhóm");

              try {
                // Gọi API xóa nhóm
                await groupService.deleteGroup(groupId);
                console.log("Bước 2: Xóa nhóm thành công");

                // Hiển thị thông báo xóa nhóm thành công
                console.log("Bước 3: Hiển thị thông báo xóa nhóm thành công");
                setToastMessage("Xóa nhóm thành công");
                setShowToast(true);

                // Chờ 1 giây rồi chuyển hướng về màn hình chính
                console.log(
                  "Bước 4: Chờ 1 giây rồi chuyển hướng về màn hình chính",
                );
                setTimeout(() => {
                  router.replace("/(tabs)");
                  console.log("Bước 5: Đã gọi router.replace");
                }, 1000);

                // Cập nhật danh sách cuộc trò chuyện (không chờ kết quả)
                try {
                  const conversationsStore =
                    require("@/store/conversationsStore").useConversationsStore.getState();
                  conversationsStore.fetchConversations(1);
                  console.log(
                    "Bước 5: Đã gọi cập nhật danh sách cuộc trò chuyện",
                  );
                } catch (storeError) {
                  console.error(
                    "Lỗi khi cập nhật danh sách cuộc trò chuyện:",
                    storeError,
                  );
                }
              } catch (apiError: any) {
                console.error(
                  "Lỗi khi gọi API xóa nhóm:",
                  apiError?.response?.status,
                  apiError?.response?.data || apiError.message,
                );
                throw apiError; // Chuyển tiếp lỗi để xử lý ở catch bên ngoài
              }
            } catch (error) {
              console.error("Error deleting group:", error);
              Alert.alert("Lỗi", "Không thể xóa nhóm");
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ],
    );
  };

  const handleTransferLeadership = () => {
    Alert.alert(
      "Chuyển quyền trưởng nhóm",
      "Người được chọn sẽ trở thành trưởng nhóm và có mọi quyền quản lý nhóm. Bạn sẽ mất quyền quản lý nhưng vẫn là 1 thành viên của nhóm. Hành động này không thể phục hồi.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Tiếp tục",
          onPress: () => {
            // Hiển thị modal chọn thành viên
            setShowTransferLeadershipModal(true);
          },
        },
      ],
    );
  };

  const handleConfirmTransferLeadership = async (
    member: ExtendedGroupMember,
  ) => {
    setShowTransferLeadershipModal(false);

    Alert.alert(
      `Chuyển quyền trưởng nhóm cho ${member.fullName}?`,
      `${member.fullName} sẽ trở thành trưởng nhóm. Bạn sẽ trở thành 1 thành viên bình thường.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chuyển",
          onPress: async () => {
            try {
              setIsUpdating(true);
              console.log("Bước 1: Bắt đầu quá trình chuyển quyền trưởng nhóm");

              // Gọi API để cập nhật vai trò thành viên
              await groupService.updateMemberRole(
                groupId,
                member.userId,
                "LEADER",
              );
              console.log("Bước 2: Chuyển quyền trưởng nhóm thành công");

              // Hiển thị thông báo thành công
              // Hiển thị thông báo chuyển quyền thành công
              console.log("Bước 3: Hiển thị thông báo chuyển quyền thành công");
              setToastMessage(
                `Đã chuyển quyền trưởng nhóm cho ${member.fullName}`,
              );
              setShowToast(true);

              // Cập nhật lại thông tin nhóm
              console.log("Bước 4: Cập nhật lại thông tin nhóm");
              await fetchGroupDetails();

              // Hiển thị thông báo thành công
              Alert.alert(
                "Thành công",
                `Đã chuyển quyền trưởng nhóm cho ${member.fullName}.`,
                [{ text: "OK" }],
              );
            } catch (error) {
              console.error("Error transferring leadership:", error);
              Alert.alert("Lỗi", "Không thể chuyển quyền trưởng nhóm");
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ],
    );
  };

  const isGroupLeader =
    group?.members?.some(
      (member) =>
        member.userId === currentUser?.userId && member.role === "LEADER",
    ) || false;

  const isGroupCoLeader =
    group?.members?.some(
      (member) =>
        member.userId === currentUser?.userId && member.role === "CO_LEADER",
    ) || false;

  const canManageMembers = isGroupLeader || isGroupCoLeader;

  // Sử dụng type casting để phù hợp với cấu trúc dữ liệu mới
  interface ExtendedGroupMember extends GroupMember {
    fullName?: string;
    profilePictureUrl?: string;
    addedBy?: {
      id: string;
      fullName: string;
    };
  }

  const renderMemberItem = ({ item }: { item: ExtendedGroupMember }) => {
    // Trong cấu trúc dữ liệu mới, thông tin người dùng được đưa trực tiếp vào đối tượng thành viên
    const fullName = item.fullName || "Không có tên";
    const profilePictureUrl = item.profilePictureUrl;
    const addedBy = item.addedBy?.fullName || "";

    // Kiểm tra xem có phải là người dùng hiện tại không
    const isCurrentUser = item.userId === currentUser?.userId;

    return (
      <TouchableOpacity
        className="py-3 border-b border-gray-100"
        onPress={() => {
          // Chỉ hiển thị thông tin khi nhấn vào thành viên khác
          if (!isCurrentUser) {
            setSelectedMember(item);
            setShowMemberInfo(true);
          }
        }}
        disabled={isCurrentUser}
        activeOpacity={isCurrentUser ? 1 : 0.7}
      >
        <HStack className="items-center">
          <Avatar size="md">
            {profilePictureUrl ? (
              <AvatarImage source={{ uri: profilePictureUrl }} />
            ) : (
              <AvatarFallbackText>{fullName}</AvatarFallbackText>
            )}
          </Avatar>
          <VStack className="ml-3 flex-1">
            <Text className="font-medium">
              {fullName}
              {isCurrentUser ? " (Bạn)" : ""}
            </Text>
            <Text className="text-xs text-gray-500">
              {item.role === "LEADER"
                ? "Trưởng nhóm"
                : item.role === "CO_LEADER"
                  ? "Phó nhóm"
                  : "Thành viên"}
            </Text>
            {addedBy && item.role !== "LEADER" && (
              <Text className="text-xs text-gray-400">Thêm bởi: {addedBy}</Text>
            )}
          </VStack>

          {isGroupLeader && item.userId !== currentUser?.userId && (
            <TouchableOpacity
              className="p-2"
              onPress={(e) => {
                e.stopPropagation(); // Ngăn sự kiện lan tỏa đến TouchableOpacity cha
                Alert.alert(
                  "Xóa thành viên",
                  `Bạn có chắc chắn muốn xóa ${(item as ExtendedGroupMember).fullName || "thành viên này"} khỏi nhóm?`,
                  [
                    { text: "Hủy", style: "cancel" },
                    {
                      text: "Xóa",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await groupService.removeMember(groupId, item.userId);
                          fetchGroupDetails();
                        } catch (error) {
                          console.error("Error removing member:", error);
                          Alert.alert("Lỗi", "Không thể xóa thành viên");
                        }
                      },
                    },
                  ],
                );
              }}
            >
              <Trash2 size={20} color={"red"} />
            </TouchableOpacity>
          )}
        </HStack>
      </TouchableOpacity>
    );
  };

  // Không cần màn hình loading nữa vì đã chuyển hướng trực tiếp

  return (
    <View className="flex-1 bg-white">
      {showToast && (
        <CustomToastRed
          message={toastMessage}
          onHide={() => setShowToast(false)}
        />
      )}
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={["#297eff", "#228eff", "#00d4ff"]}
        style={{
          paddingTop: insets.top,
        }}
      >
        {/* Header */}
        <HStack className="p-2.5 border-b border-gray-200 justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={"white"} />
          </TouchableOpacity>
          <Text className="text-lg text-white font-semibold">
            Thông tin nhóm
          </Text>
          <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
            <Home size={24} color={"white"} />
          </TouchableOpacity>
        </HStack>
      </LinearGradient>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.light.PRIMARY_BLUE} />
        </View>
      ) : group ? (
        <ScrollView className="flex-1">
          {/* Group Info */}
          <VStack className="p-4 items-center border-b border-gray-200">
            <TouchableOpacity
              onPress={handleUpdateGroupAvatar}
              disabled={!isGroupLeader || isUpdating}
              className="relative"
            >
              <Avatar size="xl">
                {group?.avatarUrl ? (
                  <AvatarImage source={{ uri: group?.avatarUrl || "" }} />
                ) : (
                  <AvatarFallbackText>
                    {group?.name || "Nhóm"}
                  </AvatarFallbackText>
                )}
              </Avatar>
              {isGroupLeader && (
                <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                  <Camera size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>

            {isEditing ? (
              <HStack className="mt-3 items-center">
                <TextInput
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={handleUpdateGroupName}
                  disabled={isUpdating}
                  className="ml-2"
                >
                  <Text className="text-blue-500 font-medium">Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditing(false);
                    setNewGroupName(group?.name || "");
                  }}
                  className="ml-2"
                >
                  <Text className="text-gray-500">Hủy</Text>
                </TouchableOpacity>
              </HStack>
            ) : (
              <HStack className="mt-3 items-center">
                <Text className="text-xl font-semibold">
                  {group?.name || ""}
                </Text>
                {isGroupLeader && (
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    className="ml-2"
                  >
                    <Edit2 size={16} color={Colors.light.PRIMARY_BLUE} />
                  </TouchableOpacity>
                )}
              </HStack>
            )}

            <Text className="text-gray-500 mt-1">
              {group?.members?.length || 0} thành viên
            </Text>
          </VStack>

          {/* Members List */}
          <View>
            <HStack className="px-4 py-3 bg-gray-50 justify-between items-center">
              <Text className="font-semibold">Thành viên nhóm</Text>
              {canManageMembers && (
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={handleOpenAddMembersModal}
                >
                  <UserPlus size={18} color={Colors.light.PRIMARY_BLUE} />
                  <Text className="ml-1 text-blue-500">Thêm</Text>
                </TouchableOpacity>
              )}
            </HStack>

            <FlatList
              data={group?.members || []}
              keyExtractor={(item) => item.id}
              renderItem={renderMemberItem}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          </View>

          {/* Actions */}
          <VStack className="p-4 border-t border-gray-200 mt-4">
            <TouchableOpacity
              onPress={() => setShowQRModal(true)}
              className="flex-row items-center py-3"
            >
              <QrCode size={20} color={Colors.light.PRIMARY_BLUE} />
              <Text className="ml-3 text-blue-500">Mã QR nhóm</Text>
            </TouchableOpacity>

            {isGroupLeader && (
              <TouchableOpacity
                onPress={handleTransferLeadership}
                className="flex-row items-center py-3"
              >
                <User size={20} color={Colors.light.PRIMARY_BLUE} />
                <Text className="ml-3 text-blue-500">
                  Chuyển quyền trưởng nhóm
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleLeaveGroup}
              className="flex-row items-center py-3"
            >
              <LogOut size={20} color={"red"} />
              <Text className="ml-3 text-red-500">Rời khỏi nhóm</Text>
            </TouchableOpacity>

            {isGroupLeader && (
              <TouchableOpacity
                onPress={handleDeleteGroup}
                className="flex-row items-center py-3"
              >
                <Trash2 size={20} color={"red"} />
                <Text className="ml-3 text-red-500">Giải tán nhóm</Text>
              </TouchableOpacity>
            )}
          </VStack>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text>Không tìm thấy thông tin nhóm</Text>
        </View>
      )}

      {isUpdating && (
        <View className="absolute inset-0 bg-black bg-opacity-30 items-center justify-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* Modal thông tin thành viên */}
      <Modal
        visible={showMemberInfo}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMemberInfo(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{
            backgroundColor: "rgba(148, 163, 184, 0.3)",
          }} /* Màu slate-400 với độ trong suốt 30% */
          onPress={() => setShowMemberInfo(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl p-5"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="items-center mb-4">
              <View className="w-10 h-1 bg-gray-300 rounded-full mb-4" />
              <Text className="text-xl font-bold mb-2">
                Thông tin thành viên
              </Text>

              <TouchableOpacity
                className="absolute right-0 top-0"
                onPress={() => setShowMemberInfo(false)}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedMember && (
              <View className="items-center">
                <Avatar size="xl" className="mb-4">
                  {selectedMember.profilePictureUrl ? (
                    <AvatarImage
                      source={{ uri: selectedMember.profilePictureUrl }}
                    />
                  ) : (
                    <AvatarFallbackText>
                      {selectedMember.fullName || ""}
                    </AvatarFallbackText>
                  )}
                </Avatar>

                <Text className="text-xl font-bold mb-1">
                  {selectedMember.fullName}
                </Text>
                <Text className="text-gray-500 mb-4">
                  {selectedMember.role === "LEADER"
                    ? "Trưởng nhóm"
                    : selectedMember.role === "CO_LEADER"
                      ? "Phó nhóm"
                      : "Thành viên"}
                </Text>

                <View className="w-full">
                  <TouchableOpacity className="flex-row items-center py-4 border-t border-gray-200">
                    <User size={20} color={Colors.light.PRIMARY_BLUE} />
                    <Text className="ml-3 text-base">Xem trang cá nhân</Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-row items-center py-4 border-t border-gray-200">
                    <MessageSquare
                      size={20}
                      color={Colors.light.PRIMARY_BLUE}
                    />
                    <Text className="ml-3 text-base">Nhắn tin</Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-row items-center py-4 border-t border-gray-200">
                    <Phone size={20} color={Colors.light.PRIMARY_BLUE} />
                    <Text className="ml-3 text-base">Gọi điện</Text>
                  </TouchableOpacity>

                  {/* Bổ nhiệm làm phó nhóm */}
                  {isGroupLeader &&
                    selectedMember.role !== "LEADER" &&
                    selectedMember.role !== "CO_LEADER" && (
                      <TouchableOpacity
                        className="flex-row items-center py-4 border-t border-gray-200"
                        onPress={() => {
                          setShowMemberInfo(false);
                          Alert.alert(
                            "Bổ nhiệm làm phó nhóm",
                            `Bạn có muốn bổ nhiệm ${selectedMember.fullName} làm phó nhóm?`,
                            [
                              { text: "Hủy", style: "cancel" },
                              {
                                text: "Bổ nhiệm",
                                onPress: async () => {
                                  try {
                                    setIsUpdating(true);
                                    // Gọi API để cập nhật vai trò thành viên
                                    await groupService.updateMemberRole(
                                      groupId,
                                      selectedMember.userId,
                                      "CO_LEADER",
                                    );
                                    // Cập nhật lại thông tin nhóm
                                    await fetchGroupDetails();
                                    Alert.alert(
                                      "Thành công",
                                      `Đã bổ nhiệm ${selectedMember.fullName} làm phó nhóm`,
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Error updating member role:",
                                      error,
                                    );
                                    Alert.alert(
                                      "Lỗi",
                                      "Không thể bổ nhiệm phó nhóm",
                                    );
                                  } finally {
                                    setIsUpdating(false);
                                  }
                                },
                              },
                            ],
                          );
                        }}
                      >
                        <ShieldAlert
                          size={20}
                          color={Colors.light.PRIMARY_BLUE}
                        />
                        <Text className="ml-3 text-base">
                          Bổ nhiệm làm phó nhóm
                        </Text>
                      </TouchableOpacity>
                    )}

                  {/* Hạ cấp phó nhóm xuống thành viên thường */}
                  {isGroupLeader && selectedMember.role === "CO_LEADER" && (
                    <TouchableOpacity
                      className="flex-row items-center py-4 border-t border-gray-200"
                      onPress={() => {
                        setShowMemberInfo(false);
                        Alert.alert(
                          "Hạ cấp phó nhóm",
                          `Bạn có muốn hạ cấp ${selectedMember.fullName} xuống thành viên thường?`,
                          [
                            { text: "Hủy", style: "cancel" },
                            {
                              text: "Hạ cấp",
                              onPress: async () => {
                                try {
                                  setIsUpdating(true);
                                  // Gọi API để cập nhật vai trò thành viên
                                  await groupService.updateMemberRole(
                                    groupId,
                                    selectedMember.userId,
                                    "MEMBER",
                                  );
                                  // Cập nhật lại thông tin nhóm
                                  await fetchGroupDetails();
                                  Alert.alert(
                                    "Thành công",
                                    `Đã hạ cấp ${selectedMember.fullName} xuống thành viên thường`,
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error updating member role:",
                                    error,
                                  );
                                  Alert.alert(
                                    "Lỗi",
                                    "Không thể hạ cấp phó nhóm",
                                  );
                                } finally {
                                  setIsUpdating(false);
                                }
                              },
                            },
                          ],
                        );
                      }}
                    >
                      <ShieldAlert size={20} color="#6B7280" />
                      <Text className="ml-3 text-base">
                        Hạ cấp xuống thành viên
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isGroupLeader &&
                    selectedMember.userId !== currentUser?.userId && (
                      <TouchableOpacity
                        className="flex-row items-center py-4 border-t border-gray-200"
                        onPress={() => {
                          setShowMemberInfo(false);
                          Alert.alert(
                            "Xóa thành viên",
                            `Bạn có chắc chắn muốn xóa ${selectedMember.fullName || "thành viên này"} khỏi nhóm?`,
                            [
                              { text: "Hủy", style: "cancel" },
                              {
                                text: "Xóa",
                                style: "destructive",
                                onPress: async () => {
                                  try {
                                    await groupService.removeMember(
                                      groupId,
                                      selectedMember.userId,
                                    );
                                    fetchGroupDetails();
                                  } catch (error) {
                                    console.error(
                                      "Error removing member:",
                                      error,
                                    );
                                    Alert.alert(
                                      "Lỗi",
                                      "Không thể xóa thành viên",
                                    );
                                  }
                                },
                              },
                            ],
                          );
                        }}
                      >
                        <Trash2 size={20} color="red" />
                        <Text className="ml-3 text-red-500">Xóa khỏi nhóm</Text>
                      </TouchableOpacity>
                    )}
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal chọn thành viên để chuyển quyền trưởng nhóm */}
      <Modal
        visible={showTransferLeadershipModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTransferLeadershipModal(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(148, 163, 184, 0.3)" }}
          onPress={() => setShowTransferLeadershipModal(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl p-5"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="items-center mb-4">
              <View className="w-10 h-1 bg-gray-300 rounded-full mb-4" />
              <Text className="text-xl font-bold mb-2">Chọn thành viên</Text>

              <TouchableOpacity
                className="absolute right-0 top-0"
                onPress={() => setShowTransferLeadershipModal(false)}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={
                group?.members?.filter(
                  (member) =>
                    member.userId !== currentUser?.userId &&
                    member.role !== "LEADER",
                ) || []
              }
              keyExtractor={(item) => item.id}
              renderItem={({ item }: { item: ExtendedGroupMember }) => (
                <TouchableOpacity
                  className="flex-row items-center py-3 border-b border-gray-100"
                  onPress={() => handleConfirmTransferLeadership(item)}
                >
                  <Avatar size="md">
                    {item.profilePictureUrl ? (
                      <AvatarImage source={{ uri: item.profilePictureUrl }} />
                    ) : (
                      <AvatarFallbackText>
                        {item.fullName || ""}
                      </AvatarFallbackText>
                    )}
                  </Avatar>
                  <Text className="ml-3 font-medium">{item.fullName}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          activeOpacity={1}
          onPress={() => setShowQRModal(false)}
        >
          <View
            className="m-auto bg-white rounded-xl p-6 items-center"
            style={{ width: "80%" }}
          >
            <Text className="text-xl font-bold mb-4">Mã QR nhóm</Text>
            <Text className="text-sm text-gray-500 mb-4 text-center">
              Chia sẻ mã QR này để mời người khác tham gia nhóm
            </Text>
            <View className="p-3 bg-white rounded-lg shadow-sm mb-4">
              <QRCode
                value={`group-${groupId}`}
                size={200}
                color="black"
                backgroundColor="white"
              />
            </View>
            <TouchableOpacity
              className="bg-blue-500 py-3 px-6 rounded-full"
              onPress={() => setShowQRModal(false)}
            >
              <Text className="text-white font-bold">Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Members Modal */}
      <Modal
        visible={showAddMembersModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => handleCloseAddMembersModal()}
      >
        <View className="flex-1 bg-white">
          <LinearGradient
            start={{ x: 0.03, y: 0 }}
            end={{ x: 0.99, y: 2.5 }}
            colors={["#297eff", "#228eff", "#00d4ff"]}
            style={{
              paddingTop: insets.top,
            }}
          >
            <HStack className="p-2.5 border-b border-gray-200 justify-between items-center">
              <TouchableOpacity onPress={handleCloseAddMembersModal}>
                <ArrowLeft size={24} color={"white"} />
              </TouchableOpacity>
              <Text className="text-lg text-white font-semibold">
                Thêm thành viên
              </Text>
              <View style={{ width: 24 }} />
            </HStack>
          </LinearGradient>

          <View className="p-4">
            <View className="flex-row items-center p-2 bg-gray-100 rounded-lg mb-4">
              <Search size={20} color="#666" className="ml-2" />
              <TextInput
                className="flex-1 ml-2"
                placeholder="Tìm kiếm bạn bè"
                value={searchQuery}
                onChangeText={handleSearchFriends}
              />
            </View>

            {selectedFriends.size > 0 && (
              <View className="mb-4">
                <Text className="text-sm text-gray-500 mb-2">
                  Đã chọn {selectedFriends.size} người
                </Text>
              </View>
            )}

            {isLoadingFriends ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator
                  size="large"
                  color={Colors.light.PRIMARY_BLUE}
                />
              </View>
            ) : filteredFriends.length > 0 ? (
              <FlatList
                data={filteredFriends}
                keyExtractor={(item) => item.friendshipId}
                renderItem={({ item }) => {
                  const userId = item.friend.id;
                  const isSelected = selectedFriends.has(userId);
                  const fullName =
                    item.friend.userInfo?.fullName || "Không có tên";
                  const profilePictureUrl =
                    item.friend.userInfo?.profilePictureUrl;

                  return (
                    <TouchableOpacity
                      className="flex-row items-center p-3 border-b border-gray-100"
                      onPress={() => toggleFriendSelection(userId)}
                    >
                      <View
                        className="mr-3 w-6 h-6 border border-gray-300 rounded-full items-center justify-center"
                        style={
                          isSelected
                            ? {
                                backgroundColor: Colors.light.PRIMARY_BLUE,
                                borderColor: Colors.light.PRIMARY_BLUE,
                              }
                            : {}
                        }
                      >
                        {isSelected && (
                          <View className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </View>
                      <Avatar size="md">
                        {profilePictureUrl ? (
                          <AvatarImage source={{ uri: profilePictureUrl }} />
                        ) : (
                          <AvatarFallbackText>{fullName}</AvatarFallbackText>
                        )}
                      </Avatar>
                      <Text className="ml-3 font-medium">{fullName}</Text>
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            ) : (
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-gray-500 text-center">
                  {searchQuery.length > 0
                    ? "Không tìm thấy bạn bè phù hợp"
                    : "Không có bạn bè nào để thêm vào nhóm"}
                </Text>
              </View>
            )}
          </View>

          {selectedFriends.size > 0 && (
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
              <TouchableOpacity
                className="bg-blue-500 py-3 rounded-lg items-center"
                onPress={handleAddMembers}
                disabled={addMembersLoading}
              >
                <Text className="text-white font-bold">
                  {addMembersLoading
                    ? "Đang thêm..."
                    : `Thêm ${selectedFriends.size} người`}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );

  // Function to handle opening the add members modal
  function handleOpenAddMembersModal() {
    setSelectedFriends(new Set());
    setSearchQuery("");
    fetchFriends();
    setShowAddMembersModal(true);
  }

  // Function to handle closing the add members modal
  function handleCloseAddMembersModal() {
    setShowAddMembersModal(false);
    setSelectedFriends(new Set());
    setSearchQuery("");
  }

  // Function to fetch friends
  async function fetchFriends() {
    try {
      setIsLoadingFriends(true);
      const response = await getFriendList();

      // Filter out friends who are already in the group
      const existingMemberIds = new Set(
        group?.members.map((member) => member.userId) || [],
      );
      const availableFriends = response.filter(
        (friend) => !existingMemberIds.has(friend.friend.id),
      );

      setFriends(availableFriends);
      setFilteredFriends(availableFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách bạn bè");
    } finally {
      setIsLoadingFriends(false);
    }
  }

  // Function to handle search friends
  function handleSearchFriends(text: string) {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredFriends(friends);
    } else {
      const filtered = friends.filter((friend) => {
        const fullName = friend.friend.userInfo?.fullName?.toLowerCase() || "";
        return fullName.includes(text.toLowerCase());
      });
      setFilteredFriends(filtered);
    }
  }

  // Function to toggle friend selection
  function toggleFriendSelection(friendId: string) {
    const newSelection = new Set(selectedFriends);
    if (newSelection.has(friendId)) {
      newSelection.delete(friendId);
    } else {
      newSelection.add(friendId);
    }
    setSelectedFriends(newSelection);
  }

  // Function to add selected members to the group
  async function handleAddMembers() {
    if (selectedFriends.size === 0) return;

    try {
      setAddMembersLoading(true);
      const memberIds = Array.from(selectedFriends);
      await groupService.addMembersToGroup(groupId, memberIds);

      // Show success message
      setToastMessage(`Đã thêm ${selectedFriends.size} thành viên vào nhóm`);
      setShowToast(true);

      // Close modal and refresh group details
      handleCloseAddMembersModal();
      await fetchGroupDetails();
    } catch (error) {
      console.error("Error adding members to group:", error);
      Alert.alert("Lỗi", "Không thể thêm thành viên vào nhóm");
    } finally {
      setAddMembersLoading(false);
    }
  }
}
