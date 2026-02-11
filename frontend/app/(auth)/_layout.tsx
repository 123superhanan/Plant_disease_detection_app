import { Stack, useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function AuthLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTintColor: "#111827",
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginLeft: 16 }}
          >
            <Text style={{ fontSize: 20, color: "#374151" }}>←</Text>
          </TouchableOpacity>
        ),
        contentStyle: { backgroundColor: "#F9FAFB" },
      }}
    >
      <Stack.Screen
        name="welcomeScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Sign In",
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Create Account",
          headerTitle: "",
        }}
      />
    </Stack>
  );
}
