import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(drawer)" />
      <Stack.Screen name="history" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
