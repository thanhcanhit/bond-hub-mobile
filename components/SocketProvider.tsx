import React, { createContext, useContext, useEffect, useState } from "react";
import { socketManager } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { Socket } from "socket.io-client";

interface SocketContextType {
  mainSocket: Socket | null;
  messageSocket: Socket | null;
  isConnected: boolean;
  connectToNamespace: (namespace: string) => Promise<Socket | null>;
}

const SocketContext = createContext<SocketContextType>({
  mainSocket: null,
  messageSocket: null,
  isConnected: false,
  connectToNamespace: async () => null,
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mainSocket, setMainSocket] = useState<Socket | null>(null);
  const [messageSocket, setMessageSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Connect to main socket when authenticated
  useEffect(() => {
    let isMounted = true;

    const connectSockets = async () => {
      if (!isAuthenticated) {
        setMainSocket(null);
        setMessageSocket(null);
        setIsConnected(false);
        return;
      }

      try {
        console.log("Connecting to main socket...");
        const socket = await socketManager.connect();

        if (socket && isMounted) {
          setMainSocket(socket as Socket);
          setIsConnected(socket.connected);

          // Connect to messages namespace only if main connection is successful
          if (socket.connected) {
            const msgSocket =
              await socketManager.connectToNamespace("messages");
            if (msgSocket && isMounted) {
              setMessageSocket(msgSocket);
            }
          }
        }
      } catch (error) {
        console.error("Failed to connect to sockets:", error);
        if (isMounted) {
          setMainSocket(null);
          setMessageSocket(null);
          setIsConnected(false);
        }
      }
    };

    connectSockets();

    return () => {
      isMounted = false;
      socketManager.disconnect();
    };
  }, [isAuthenticated]);

  // Setup event listeners for main socket
  useEffect(() => {
    if (!mainSocket) return;

    const onConnect = () => {
      console.log("Main socket connected");
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log("Main socket disconnected");
      setIsConnected(false);
    };

    mainSocket.on("connect", onConnect);
    mainSocket.on("disconnect", onDisconnect);

    return () => {
      mainSocket.off("connect", onConnect);
      mainSocket.off("disconnect", onDisconnect);
    };
  }, [mainSocket]);

  // Connect to a specific namespace
  const connectToNamespace = async (namespace: string) => {
    try {
      return await socketManager.connectToNamespace(namespace);
    } catch (error) {
      console.error(`Failed to connect to namespace ${namespace}:`, error);
      return null;
    }
  };

  return (
    <SocketContext.Provider
      value={{ mainSocket, messageSocket, isConnected, connectToNamespace }}
    >
      {children}
    </SocketContext.Provider>
  );
};
