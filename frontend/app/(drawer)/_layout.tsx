// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { Drawer } from "expo-router/drawer";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// export default function DrawerLayout() {
//   const router = useRouter();

//   const CustomDrawerContent = (props: any) => {
//     return (
//       <View style={styles.drawerContainer}>
//         {/* Drawer Header */}
//         <View style={styles.drawerHeader}>
//           <View style={styles.userAvatar}>
//             <Text style={styles.userAvatarText}>JD</Text>
//           </View>
//           <View style={styles.userInfo}>
//             <Text style={styles.userName}>John Doe</Text>
//             <Text style={styles.userEmail}>john@example.com</Text>
//             <View style={styles.userBadge}>
//               <Text style={styles.userBadgeText}>Premium User</Text>
//             </View>
//           </View>
//         </View>

//         {/* Drawer Items */}
//         <View style={styles.drawerItems}>
//           <TouchableOpacity
//             style={styles.drawerItem}
//             onPress={() => {
//               props.navigation.navigate("(drawer)/index");
//             }}
//           >
//             <Ionicons name="home-outline" size={22} color="#374151" />
//             <Text style={styles.drawerItemText}>Dashboard</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.drawerItem}
//             onPress={() => {
//               props.navigation.navigate("(drawer)/model-stats");
//             }}
//           >
//             <Ionicons name="stats-chart-outline" size={22} color="#374151" />
//             <Text style={styles.drawerItemText}>Model Statistics</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.drawerItem}
//             onPress={() => {
//               props.navigation.navigate("(drawer)/notifications");
//             }}
//           >
//             <Ionicons name="notifications-outline" size={22} color="#374151" />
//             <Text style={styles.drawerItemText}>Notifications</Text>
//             <View style={styles.notificationBadge}>
//               <Text style={styles.notificationBadgeText}>3</Text>
//             </View>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.drawerItem}
//             onPress={() => {
//               props.navigation.navigate("(drawer)/profile");
//             }}
//           >
//             <Ionicons name="person-outline" size={22} color="#374151" />
//             <Text style={styles.drawerItemText}>Profile</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.drawerItem}
//             onPress={() => {
//               props.navigation.navigate("(drawer)/settings");
//             }}
//           >
//             <Ionicons name="settings-outline" size={22} color="#374151" />
//             <Text style={styles.drawerItemText}>Settings</Text>
//           </TouchableOpacity>

//           <View style={styles.drawerDivider} />

//           <TouchableOpacity
//             style={styles.drawerItem}
//             onPress={() => router.push("/history")}
//           >
//             <Ionicons name="time-outline" size={22} color="#374151" />
//             <Text style={styles.drawerItemText}>History</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.drawerItem}
//             onPress={() => router.push("/result")}
//           >
//             <Ionicons name="document-text-outline" size={22} color="#374151" />
//             <Text style={styles.drawerItemText}>Results</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Drawer Footer */}
//         <View style={styles.drawerFooter}>
//           <TouchableOpacity style={styles.logoutButton}>
//             <Ionicons name="log-out-outline" size={22} color="#DC2626" />
//             <Text style={styles.logoutText}>Sign Out</Text>
//           </TouchableOpacity>
//           <Text style={styles.versionText}>Version 1.0.0</Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <Drawer
//       drawerContent={CustomDrawerContent}
//       screenOptions={{
//         headerShown: true,
//         headerStyle: {
//           backgroundColor: "#FFFFFF",
//           borderBottomWidth: 1,
//           borderBottomColor: "#E5E7EB",
//         },
//         headerTintColor: "#111827",
//         headerTitleStyle: {
//           fontWeight: "600",
//           fontSize: 18,
//         },
//         drawerStyle: {
//           backgroundColor: "#FFFFFF",
//           width: 300,
//         },
//         drawerActiveTintColor: "#111827",
//         drawerInactiveTintColor: "#6B7280",
//         drawerLabelStyle: {
//           marginLeft: -16,
//           fontSize: 14,
//           fontWeight: "500",
//         },
//       }}
//     >
//       <Drawer.Screen
//         name="index"
//         options={{
//           title: "Dashboard",
//           drawerIcon: ({ size, color }) => (
//             <Ionicons name="home-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Drawer.Screen
//         name="model-stats"
//         options={{
//           title: "Model Statistics",
//           drawerIcon: ({ size, color }) => (
//             <Ionicons name="stats-chart-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Drawer.Screen
//         name="notifications"
//         options={{
//           title: "Notifications",
//           drawerIcon: ({ size, color }) => (
//             <Ionicons name="notifications-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Drawer.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           drawerIcon: ({ size, color }) => (
//             <Ionicons name="person-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Drawer.Screen
//         name="settings"
//         options={{
//           title: "Settings",
//           drawerIcon: ({ size, color }) => (
//             <Ionicons name="settings-outline" size={size} color={color} />
//           ),
//         }}
//       />
//     </Drawer>
//   );
// }

// const styles = StyleSheet.create({
//   drawerContainer: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   drawerHeader: {
//     paddingTop: 60,
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     backgroundColor: "#F9FAFB",
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//   },
//   userAvatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#3B82F6",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 12,
//   },
//   userAvatarText: {
//     color: "#FFFFFF",
//     fontSize: 24,
//     fontWeight: "600",
//   },
//   userInfo: {
//     gap: 4,
//   },
//   userName: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   userEmail: {
//     fontSize: 14,
//     color: "#6B7280",
//   },
//   userBadge: {
//     alignSelf: "flex-start",
//     backgroundColor: "#10B981",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     marginTop: 4,
//   },
//   userBadgeText: {
//     color: "#FFFFFF",
//     fontSize: 10,
//     fontWeight: "600",
//   },
//   drawerItems: {
//     flex: 1,
//     paddingTop: 20,
//     paddingHorizontal: 16,
//   },
//   drawerItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 14,
//     paddingHorizontal: 12,
//     borderRadius: 10,
//     marginBottom: 4,
//     position: "relative",
//   },
//   drawerItemText: {
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#374151",
//     marginLeft: 16,
//   },
//   notificationBadge: {
//     position: "absolute",
//     right: 12,
//     backgroundColor: "#EF4444",
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   notificationBadgeText: {
//     color: "#FFFFFF",
//     fontSize: 10,
//     fontWeight: "600",
//   },
//   drawerDivider: {
//     height: 1,
//     backgroundColor: "#E5E7EB",
//     marginVertical: 16,
//     marginHorizontal: 12,
//   },
//   drawerFooter: {
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: "#E5E7EB",
//     gap: 16,
//   },
//   logoutButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     backgroundColor: "#FEF2F2",
//   },
//   logoutText: {
//     color: "#DC2626",
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   versionText: {
//     textAlign: "center",
//     color: "#9CA3AF",
//     fontSize: 12,
//   },
// });
