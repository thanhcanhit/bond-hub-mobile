import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import "@/global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
SplashScreen.preventAutoHideAsync();

export default function LoginLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack
        screenOptions={{
          headerShown: false, // Tắt header mặc định cho tất cả màn hình trong Stack
        }}
      >
        <Stack.Screen
          name="(signup)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="loginScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(forgot-password)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
