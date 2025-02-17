import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      setIsAuthenticated(!!accessToken);
    };

    checkAuth();
  }, []);

  return isAuthenticated;
};
