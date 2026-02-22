import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="Onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="infogathering" />
          <Stack.Screen name="(drawer)" />
          <Stack.Screen name="Upload" />
        </Stack>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
