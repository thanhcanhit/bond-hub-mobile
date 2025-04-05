import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

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

  private connectionAttempts = 0;
  private maxConnectionAttempts = 5;
  private baseUrl = "http://192.168.111.65:3000";

  public async connect() {
    if (this.socket && this.socket.connected) {
      console.log("Socket already connected");
      return this.socket;
    }

    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const deviceId = await SecureStore.getItemAsync("deviceId");

      if (!token) {
        console.error("No access token available for socket connection");
        return null;
      }

      console.log(
        "Connecting to socket with token",
        token ? "[token available]" : "[no token]",
      );

      // Create socket connection
      this.socket = io(this.baseUrl, {
        auth: {
          token,
          deviceId,
        },
        transports: ["websocket", "polling"],
        path: "/socket.io", // Remove the API prefix as it's handled by the server
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
      });

      this.setupEventListeners();

      // Return a promise that resolves when connected or rejects on error
      return new Promise((resolve, reject) => {
        if (!this.socket) return reject("Socket not initialized");

        const connectTimeout = setTimeout(() => {
          reject("Socket connection timeout");
        }, 10000);

        this.socket.on("connect", () => {
          clearTimeout(connectTimeout);
          this.connectionAttempts = 0;
          resolve(this.socket);
        });

        this.socket.on("connect_error", (error) => {
          clearTimeout(connectTimeout);
          this.connectionAttempts++;
          console.error(
            `Socket connection error (attempt ${this.connectionAttempts}):`,
            error.message,
          );

          if (this.connectionAttempts >= this.maxConnectionAttempts) {
            reject(
              `Failed to connect after ${this.maxConnectionAttempts} attempts: ${error.message}`,
            );
          } else {
            // Will auto-reconnect due to socket.io settings
          }
        });
      });
    } catch (error) {
      console.error("Error in socket connect:", error);
      return null;
    }
  }

  private setupEventListeners() {
    console.log("Setting up socket event listeners...");
    if (!this.socket) return;

    // Clear any existing listeners to prevent duplicates
    this.socket.removeAllListeners();

    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect" || reason === "transport close") {
        // Server initiated disconnect or transport closed, try to reconnect
        console.log("Attempting to reconnect...");
        setTimeout(() => {
          this.socket?.connect();
        }, 1000);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      // Add more detailed logging
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
      // Try to create a new connection after reconnection fails
      setTimeout(() => this.connect(), 2000);
    });

    this.socket.on("forceLogout", async () => {
      console.log("Received force logout event");
      const { logout } = useAuthStore.getState();
      await logout();
      this.disconnect();
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Debug events
    if (__DEV__) {
      this.socket.io.on("ping", () => {
        console.log("Socket ping");
      });

      this.socket.io.engine.on("pong", () => {
        console.log("Socket pong");
      });
    }
  }

  public disconnect() {
    if (this.socket) {
      console.log("Disconnecting socket");
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  // Method to connect to a specific namespace
  public async connectToNamespace(namespace: string) {
    try {
      // Ensure base connection exists
      if (!this.socket) {
        await this.connect();
      }

      const token = await SecureStore.getItemAsync("accessToken");
      const deviceId = await SecureStore.getItemAsync("deviceId");

      if (!token) {
        console.error("No access token available for namespace connection");
        return null;
      }

      console.log(`Connecting to namespace: ${namespace}`);
      const namespaceSocket = io(`${this.baseUrl}/${namespace}`, {
        auth: {
          token,
          deviceId,
        },
        transports: ["websocket", "polling"],
        path: "/socket.io", // Remove the API prefix
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
      });

      // Setup basic event listeners for the namespace socket
      namespaceSocket.on("connect", () => {
        console.log(`Connected to namespace: ${namespace}`);
      });

      namespaceSocket.on("connect_error", (error) => {
        console.error(
          `Namespace ${namespace} connection error:`,
          error.message,
        );
      });

      namespaceSocket.on("disconnect", (reason) => {
        console.log(`Namespace ${namespace} disconnected:`, reason);
      });

      return namespaceSocket;
    } catch (error) {
      console.error(`Error connecting to namespace ${namespace}:`, error);
      return null;
    }
  }
}

export const socketManager = SocketManager.getInstance();
