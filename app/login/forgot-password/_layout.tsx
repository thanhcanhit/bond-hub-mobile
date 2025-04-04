import { Stack } from "expo-router";

export default function ForgotPasswordLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="forgotPasswordEmailScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgotPasswordOTPScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="resetPasswordScreen"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
