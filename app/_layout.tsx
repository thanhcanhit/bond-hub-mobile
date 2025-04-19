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
import { useEffect, useRef } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SocketProvider } from "@/providers/SocketProvider";
import * as Notifications from "expo-notifications";
import {
  notificationService,
  BACKGROUND_NOTIFICATION_TASK,
} from "@/services/notification-service";
import { useAuthStore } from "@/store/authStore";
import {
  registerBackgroundFetchTask,
  unregisterBackgroundFetchTask,
} from "@/tasks/background-tasks";

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

  // Reference to notification listener
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // Set up notifications
  useEffect(() => {
    // Only set up notifications if authenticated
    if (!isAuthenticated) return;

    // Register for push notifications
    const registerForNotifications = async () => {
      try {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const token =
          await notificationService.registerForPushNotificationsAsync();

        if (token) {
          // Send the token to the server
          await notificationService.sendPushTokenToServer(token, user.userId);
        }

        // Register background fetch task
        await registerBackgroundFetchTask();
      } catch (error) {
        console.error("Error registering for notifications:", error);
      }
    };

    registerForNotifications();

    // Listen for incoming notifications when the app is in the foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received in foreground:", notification);
        // You can update app state here if needed
      });

    // Listen for user interaction with notifications
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received:", response);

        const { notification } = response;
        const data = notification.request.content.data as any;

        // Handle notification tap
        if (data && data.messageId) {
          // Navigate to the appropriate chat
          if (data.messageType === "USER") {
            router.push({
              pathname: "/chat/[id]",
              params: {
                id: data.senderId,
                name: data.senderName || "Chat",
                type: "USER",
              },
            });
          } else if (data.messageType === "GROUP") {
            router.push({
              pathname: "/chat/[id]",
              params: {
                id: data.groupId,
                name: data.groupName || "Group Chat",
                type: "GROUP",
              },
            });
          }
        }
      });

    // Register the background task for notifications
    Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

    // Clean up listeners when component unmounts
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }

      // Unregister the background tasks
      Notifications.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      unregisterBackgroundFetchTask();
    };
  }, [isAuthenticated, router]);

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
