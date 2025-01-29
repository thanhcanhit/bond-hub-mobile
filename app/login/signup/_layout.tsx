import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import "@/global.css";
import { Stack } from "expo-router";
import "react-native-reanimated";

export default function LoginLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack
        screenOptions={{
          headerShown: false, // Tắt header mặc định cho tất cả màn hình trong Stack
        }}
        initialRouteName="signupScreen1"
      >
        <Stack.Screen
          name="signupScreen1"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signupScreen2"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signupScreen3"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signupScreen4"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signupScreen5"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
