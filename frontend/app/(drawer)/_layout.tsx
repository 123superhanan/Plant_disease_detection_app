import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function CustomDrawerContent(props: any) {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={styles.headerSection}>
        <Image source={{ uri: user?.imageUrl }} style={styles.profileImage} />
        <View>
          <Text style={styles.userName}>{user?.fullName || 'Planter'}</Text>
          <Text style={styles.userStatus}>Premium Expert</Text>
        </View>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View style={styles.navSection}>
          <DrawerItemList
            {...props}
            activeTintColor="#1DB954"
            inactiveTintColor="#b3b3b3"
            labelStyle={styles.drawerLabel}
          />
        </View>
      </DrawerContentScrollView>

      {/* 2. Footer - Clean Sign Out */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={20} color="black" style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerStyle: {
          backgroundColor: '#000',
          width: 280,
        },

        drawerActiveTintColor: '#1DB954', // Green when active
        drawerInactiveTintColor: '#FFFFFF', // Pure white when inactive (visible!)
        drawerActiveBackgroundColor: '#282828',
        drawerType: 'slide',
      }}
    >
      <Drawer.Screen
        name="Home"
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color }) => <Ionicons name="leaf" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="history"
        options={{
          title: 'Diagnosis History',
          drawerIcon: ({ color }) => <Ionicons name="time" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="model-stats"
        options={{
          title: 'Model Insights',
          drawerIcon: ({ color }) => <Ionicons name="analytics" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
          drawerIcon: ({ color }) => <Ionicons name="person" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerIcon: ({ color }) => <Ionicons name="settings" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          drawerIcon: ({ color }) => <Ionicons name="notifications" size={20} color={color} />,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  userStatus: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  navSection: {
    marginTop: 10,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: -10,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 0.5,
    borderColor: '#222',
  },
  signOutBtn: {
    backgroundColor: '#1DB954',
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 30, // Pill shaped
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    color: 'black',
    fontWeight: '800',
    fontSize: 15,
  },
});
