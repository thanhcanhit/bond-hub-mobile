import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import * as SecureStore from "expo-secure-store";

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public async connect() {
    if (!this.socket) {
      const token = await SecureStore.getItemAsync("accessToken");
      const deviceId = await SecureStore.getItemAsync("deviceId");

      // Sửa 1: Sử dụng định dạng URL đúng cho Socket.IO
      // URL không nên bao gồm tiền tố API vì điều đó được xử lý bởi server
      this.socket = io("http://192.168.111.78:3000", {
        auth: {
          token,
          deviceId,
        },
        // Sửa 2: Thêm các tùy chọn transport phù hợp
        transports: ["websocket", "polling"],
        // Sửa 3: Thêm đường dẫn phù hợp để khớp với tiền tố toàn cục của NestJS
        path: "/api/v1/socket.io",
        // Sửa 4: Thêm các tùy chọn kết nối bổ sung
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      this.setupEventListeners();
    }
    return this.socket;
  }

  private setupEventListeners() {
    console.log("Socket connecting...");
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server initiated disconnect, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      // Thêm ghi log chi tiết hơn
      console.error("Connection error details:", JSON.stringify(error));
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Attempting reconnection:", attemptNumber);
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Failed to reconnect to socket server");
    });

    this.socket.on("forceLogout", async () => {
      const { logout } = useAuthStore.getState();
      await logout();
      this.disconnect();
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    this.socket.io.on("ping", () => {
      console.log("Socket ping");
    });

    this.socket.io.engine.on("pong", () => {
      console.log("Socket pong");
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  // Thêm phương thức để kết nối đến namespace cụ thể
  public async connectToNamespace(namespace: string) {
    if (!this.socket) {
      await this.connect();
    }

    const token = await SecureStore.getItemAsync("accessToken");
    const deviceId = await SecureStore.getItemAsync("deviceId");

    const namespaceSocket = io(`http://192.168.111.78:3000/${namespace}`, {
      auth: {
        token,
        deviceId,
      },
      transports: ["websocket", "polling"],
      path: "/api/v1/socket.io",
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    return namespaceSocket;
  }
}

export const socketManager = SocketManager.getInstance();
