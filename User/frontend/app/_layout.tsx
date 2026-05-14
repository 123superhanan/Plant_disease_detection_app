import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="Onboarding" />
          <Stack.Screen name="Register" />
          <Stack.Screen name="infogathering" />
          <Stack.Screen name="(drawer)" />
          <Stack.Screen name="Upload" />
        </Stack>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
