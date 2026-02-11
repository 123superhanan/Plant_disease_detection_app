import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Login() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Plant Disease Detection Ai</Text>
      <Button title="Go to Login" onPress={() => router.push("/login")} />
    </View>
  );
}
