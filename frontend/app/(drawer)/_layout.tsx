import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="index" options={{ title: 'Home' }} />
      <Drawer.Screen name="profile" />
      <Drawer.Screen name="settings" />
      <Drawer.Screen name="notifications" />
      <Drawer.Screen name="model-stats" />
    </Drawer>
  );
}
