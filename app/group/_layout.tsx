import { Stack } from "expo-router";

export default function GroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create/index" options={{ headerShown: false }} />
    </Stack>
  );
}
