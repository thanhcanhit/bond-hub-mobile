import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="submitLogin"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
