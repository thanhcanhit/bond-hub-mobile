import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync("accessToken");
        setIsAuthenticated(!!accessToken);
      } catch (error) {
        console.error("Error checking authentication status:", error);
        // If there's an error, assume not authenticated
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return isAuthenticated;
};
