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
        initialRouteName="signupEmailScreen"
      >
        <Stack.Screen
          name="signupEmailScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signupOTPScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signupPasswordScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signupNameScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signupInfoScreen"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
