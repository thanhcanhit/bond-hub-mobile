import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SocketProvider } from "@/providers/SocketProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const isAuthenticated = useAuth();
  const router = useRouter();

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle navigation based on authentication status
  useEffect(() => {
    // Wait until fonts are loaded and auth status is determined
    if (!loaded || isAuthenticated === null) {
      return;
    }

    if (isAuthenticated) {
      // Navigate to tabs if authenticated
      router.replace("/(tabs)");
    } else {
      // Navigate to login if not authenticated
      router.replace("/login/loginScreen");
    }
  }, [loaded, isAuthenticated, router]);

  return (
    <ErrorBoundary>
      <GluestackUIProvider mode="light">
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <SocketProvider>
            <Stack initialRouteName="login">
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
              <Stack.Screen name="user-info" options={{ headerShown: false }} />
              <Stack.Screen name="chat" options={{ headerShown: false }} />
              <Stack.Screen name="group" options={{ headerShown: false }} />
              <Stack.Screen
                name="friend-contact"
                options={{ headerShown: false }}
              />
            </Stack>
            <StatusBar style="auto" />
          </SocketProvider>
        </ThemeProvider>
      </GluestackUIProvider>
    </ErrorBoundary>
  );
}
