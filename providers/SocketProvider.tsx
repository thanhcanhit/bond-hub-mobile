import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { Message, ReactionType } from "@/types";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { useUserStatusStore } from "@/store/userStatusStore";

// Định nghĩa context cho cả hai socket
interface SocketContextType {
  mainSocket: Socket | null;
  messageSocket: Socket | null;
  isMainConnected: boolean;
  isMessageConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  mainSocket: null,
  messageSocket: null,
  isMainConnected: false,
  isMessageConnected: false,
});

// Hook để sử dụng socket trong các component
export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [mainSocket, setMainSocket] = useState<Socket | null>(null);
  const [messageSocket, setMessageSocket] = useState<Socket | null>(null);
  const [isMainConnected, setIsMainConnected] = useState(false);
  const [isMessageConnected, setIsMessageConnected] = useState(false);
  const currentUser = useAuthStore((state) => state.user);

  // Chat store actions
  const {
    messages,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    setTypingUsers,
    removeTypingUser,
  } = useChatStore();

  // Thiết lập message socket listeners
  const setupMessageSocketListeners = (socket: Socket) => {
    // Handle new message
    socket.on(
      "newMessage",
      (data: {
        message: Message;
        type: "user" | "group";
        timestamp: string;
      }) => {
        console.log("New message received:", data);
        // Chuyển đổi cấu trúc message trước khi thêm vào store
        const normalizedMessage: Message = {
          ...data.message,
          content: {
            text: data.message.content.text || "",
            media: data.message.content.media || [],
          },
          senderId: data.message.senderId, // Cần bổ sung thông tin sender nếu cần
          receiverId: data.message.receiverId, // Cần bổ sung thông tin receiver nếu cần
          createdAt: data.message.createdAt,
          updatedAt: data.message.updatedAt,
          readBy: data.message.readBy || [],
          deletedBy: data.message.deletedBy || [],
          recalled: data.message.recalled || false,
          messageType: data.message.messageType,
          repliedTo: data.message.repliedTo,
          forwardedFrom: data.message.forwardedFrom,
        };

        addMessage(normalizedMessage);

        // Cập nhật trạng thái người gửi thành online
        const userStatusStore = useUserStatusStore.getState();
        userStatusStore.setUserStatus(
          data.message.senderId,
          "online",
          new Date(),
        );

        // Yêu cầu cập nhật trạng thái của người gửi
        requestUserStatus(socket, data.message.senderId);
      },
    );

    // Handle message update (recall)
    socket.on("messageRecalled", (data: { messageId: string }) => {
      updateMessage(data.messageId, { recalled: true });
    });

    // Handle message deletion
    socket.on("messageDeleted", (data: { messageId: string }) => {
      deleteMessage(data.messageId);
    });

    // Handle reaction updates
    socket.on(
      "messageReactionUpdated",
      (data: {
        messageId: string;
        reactions: Array<{ userId: string; reaction: string }>;
        userId: string;
        timestamp: Date;
      }) => {
        console.log("[SocketProvider] Reaction update received:", data);

        // Chỉ cần cập nhật reactions của tin nhắn
        updateMessage(data.messageId, {
          reactions: data.reactions.map((r) => ({
            userId: r.userId,
            reaction: r.reaction as ReactionType,
          })),
        });

        // Cập nhật trạng thái người dùng thêm reaction thành online
        const userStatusStore = useUserStatusStore.getState();
        userStatusStore.setUserStatus(data.userId, "online", new Date());

        // Yêu cầu cập nhật trạng thái của người dùng
        requestUserStatus(socket, data.userId);
      },
    );

    // Handle reaction removal
    socket.on(
      "messageUnReaction",
      (data: {
        messageId: string;
        reactions: Array<{ userId: string; reaction: string }>;
        userId: string;
        timestamp: Date;
      }) => {
        console.log("[SocketProvider] Reaction removal received:", data);

        // Cập nhật lại reactions của tin nhắn
        updateMessage(data.messageId, {
          reactions: data.reactions.map((r) => ({
            userId: r.userId,
            reaction: r.reaction as ReactionType,
          })),
        });

        // Cập nhật trạng thái người dùng bỏ reaction thành online
        const userStatusStore = useUserStatusStore.getState();
        userStatusStore.setUserStatus(data.userId, "online", new Date());
      },
    );

    // Handle typing status
    socket.on(
      "userTyping",
      (data: {
        userId: string;
        receiverId?: string;
        groupId?: string;
        timestamp: Date;
      }) => {
        console.log("User is typing:", data);
        setTypingUsers(data);

        // Cập nhật trạng thái người dùng đang nhập thành typing
        const userStatusStore = useUserStatusStore.getState();
        userStatusStore.setUserStatus(data.userId, "typing", new Date());
      },
    );

    // Handle typing stopped
    socket.on(
      "userTypingStopped",
      (data: { userId: string; receiverId?: string; groupId?: string }) => {
        console.log("User stopped typing:", data);
        removeTypingUser(data.userId);

        // Cập nhật trạng thái người dùng ngừng nhập thành online
        const userStatusStore = useUserStatusStore.getState();
        userStatusStore.setUserStatus(data.userId, "online", new Date());

        // Yêu cầu cập nhật trạng thái của người dùng
        requestUserStatus(socket, data.userId);
      },
    );

    // Handle user status changes
    socket.on(
      "userStatus",
      (data: {
        userId: string;
        status: "online" | "offline";
        timestamp: string | Date;
        lastActivity?: string | Date;
      }) => {
        console.log("User status changed:", data);

        // Chuyển đổi timestamp thành Date object nếu nó là string
        const timestamp =
          typeof data.timestamp === "string"
            ? new Date(data.timestamp)
            : data.timestamp;

        // Chuyển đổi lastActivity thành Date object nếu nó tồn tại và là string
        const lastActivity = data.lastActivity
          ? typeof data.lastActivity === "string"
            ? new Date(data.lastActivity)
            : data.lastActivity
          : timestamp;

        // Cập nhật trạng thái trong store
        const userStatusStore = useUserStatusStore.getState();
        userStatusStore.setUserStatus(
          data.userId,
          data.status,
          timestamp,
          lastActivity,
        );
      },
    );

    // Handle batch user status updates
    socket.on(
      "usersStatus",
      (
        data: Array<{
          userId: string;
          status: "online" | "offline";
          timestamp: string | Date;
          lastActivity?: string | Date;
        }>,
      ) => {
        console.log("Batch user status update received:", data);

        const userStatusStore = useUserStatusStore.getState();

        // Cập nhật trạng thái cho tất cả người dùng trong batch
        data.forEach((user) => {
          const timestamp =
            typeof user.timestamp === "string"
              ? new Date(user.timestamp)
              : user.timestamp;

          const lastActivity = user.lastActivity
            ? typeof user.lastActivity === "string"
              ? new Date(user.lastActivity)
              : user.lastActivity
            : timestamp;

          userStatusStore.setUserStatus(
            user.userId,
            user.status,
            timestamp,
            lastActivity,
          );
        });
      },
    );
  };

  // Hàm yêu cầu trạng thái của một người dùng cụ thể
  const requestUserStatus = (socket: Socket, userId: string) => {
    socket.emit("getUserStatus", { userId });
  };

  // Hàm yêu cầu trạng thái của nhiều người dùng
  const requestMultipleUserStatus = (socket: Socket, userIds: string[]) => {
    if (userIds.length > 0) {
      socket.emit("getUsersStatus", { userIds });
    }
  };

  // Kết nối socket khi đăng nhập thành công
  useEffect(() => {
    if (!currentUser) {
      // Đóng cả hai kết nối nếu không có user
      if (mainSocket) {
        console.log("[SocketProvider] Closing main socket connection");
        mainSocket.disconnect();
        setMainSocket(null);
        setIsMainConnected(false);
      }
      if (messageSocket) {
        console.log("[SocketProvider] Closing message socket connection");
        messageSocket.disconnect();
        setMessageSocket(null);
        setIsMessageConnected(false);
      }
      return;
    }

    const baseUrl = "https://api.bondhub.cloud";
    const socketConfig = {
      auth: { userId: currentUser.userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ["websocket"],
    };

    // Kết nối main socket
    console.log("[SocketProvider] Connecting to main socket");
    const main = io(baseUrl, socketConfig);
    setMainSocket(main);
    console.log(baseUrl);
    console.log("socketconfig", socketConfig);
    // Kết nối message socket
    console.log("[SocketProvider] Connecting to message socket");
    const message = io(`${baseUrl}/message`, socketConfig);
    setMessageSocket(message);

    // Thiết lập listeners cho main socket
    main.on("connect", () => {
      console.log("[SocketProvider] Main socket connected:", main.id);
      setIsMainConnected(true);

      // Thiết lập heartbeat cho main socket - giảm xuống 15 giây
      const mainHeartbeat = setInterval(() => {
        if (main.connected) {
          main.emit("heartbeat");
        } else {
          clearInterval(mainHeartbeat);
        }
      }, 15000);

      return () => clearInterval(mainHeartbeat);
    });

    // Thiết lập listeners cho message socket
    message.on("connect", () => {
      console.log("[SocketProvider] Message socket connected:", message.id);
      setIsMessageConnected(true);
      setupMessageSocketListeners(message);

      // Thiết lập window.messageSocket để các component khác có thể truy cập
      if (typeof window !== "undefined") {
        window.messageSocket = message;
      }

      // Thiết lập heartbeat cho message socket - giảm xuống 15 giây
      const messageHeartbeat = setInterval(() => {
        if (message.connected) {
          message.emit("heartbeat");
        } else {
          clearInterval(messageHeartbeat);
        }
      }, 15000);

      // Thiết lập cơ chế tự động cập nhật trạng thái người dùng
      const statusUpdateInterval = setInterval(() => {
        if (message.connected) {
          // Lấy danh sách người dùng cần cập nhật trạng thái
          const userStatusStore = useUserStatusStore.getState();
          const userStatuses = userStatusStore.userStatuses;

          // Lấy danh sách người dùng có trạng thái cũ hơn 1 phút
          const now = new Date();
          const userIdsToUpdate: string[] = [];

          userStatuses.forEach((status, userId) => {
            const lastUpdate = status.timestamp;
            const diffMs = now.getTime() - lastUpdate.getTime();
            const diffMinutes = diffMs / (1000 * 60);

            // Nếu trạng thái cũ hơn 1 phút, thêm vào danh sách cập nhật
            if (diffMinutes > 1) {
              userIdsToUpdate.push(userId);
            }
          });

          // Yêu cầu cập nhật trạng thái nếu có người dùng cần cập nhật
          if (userIdsToUpdate.length > 0) {
            requestMultipleUserStatus(message, userIdsToUpdate);
          }
        } else {
          clearInterval(statusUpdateInterval);
        }
      }, 60000); // Kiểm tra mỗi 1 phút

      return () => {
        clearInterval(messageHeartbeat);
        clearInterval(statusUpdateInterval);
      };
    });

    // Xử lý disconnect cho cả hai socket
    main.on("disconnect", (reason) => {
      console.log("[SocketProvider] Main socket disconnected:", reason);
      setIsMainConnected(false);
    });

    message.on("disconnect", (reason) => {
      console.log("[SocketProvider] Message socket disconnected:", reason);
      setIsMessageConnected(false);
    });

    // Xử lý lỗi kết nối
    main.on("connect_error", (error) => {
      console.error("[SocketProvider] Main socket connection error:", error);
      setIsMainConnected(false);
    });

    message.on("connect_error", (error) => {
      console.error("[SocketProvider] Message socket connection error:", error);
      setIsMessageConnected(false);
    });

    // Cleanup khi unmount
    return () => {
      console.log("[SocketProvider] Cleaning up socket connections");
      main.removeAllListeners();
      message.removeAllListeners();
      main.disconnect();
      message.disconnect();
    };
  }, [currentUser]);

  return (
    <SocketContext.Provider
      value={{
        mainSocket,
        messageSocket,
        isMainConnected,
        isMessageConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// Type declaration for window object
declare global {
  interface Window {
    mainSocket: Socket | null;
    messageSocket: Socket | null;
  }
}
