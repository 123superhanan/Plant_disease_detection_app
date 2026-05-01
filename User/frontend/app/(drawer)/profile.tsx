import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Calendar,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Sprout,
  User,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const { getToken, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalScans: 0, totalDiseases: 0 });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/users/profile-summary-public');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = await getToken();
      if (token) {
        const response = await fetch('http://localhost:5001/api/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalScans: data.history?.length || 0,
            totalDiseases: data.stats?.diseased_scans || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FF66" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#00FF6610', 'transparent']} style={styles.headerGradient} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0) || 'U'}
              {user?.lastName?.charAt(0) || ''}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.fullName || user?.firstName || 'Gardener'}</Text>
          <Text style={styles.userEmail}>
            {user?.emailAddresses?.[0]?.emailAddress || 'No email'}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalScans}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalDiseases}</Text>
            <Text style={styles.statLabel}>Diseases Found</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.special_plants?.length || 0}</Text>
            <Text style={styles.statLabel}>Crops</Text>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MapPin color="#00FF66" size={18} />
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{profile?.location || 'Not set'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Sprout color="#00FF66" size={18} />
              <Text style={styles.infoLabel}>Your Crops</Text>
              <Text style={styles.infoValue}>
                {profile?.special_plants?.length > 0
                  ? profile.special_plants.join(', ')
                  : 'No crops selected'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Calendar color="#00FF66" size={18} />
              <Text style={styles.infoLabel}>Growth Phases</Text>
              <Text style={styles.infoValue}>
                {profile?.plant_phases?.length > 0
                  ? profile.plant_phases.join(' • ')
                  : 'Not specified'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Mail color="#00FF66" size={18} />
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {user?.emailAddresses?.[0]?.emailAddress || 'Not available'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/infogathering')}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
            <LogOut color="#ff4d4f" size={18} />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>AgriVision AI v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 1 },

  scrollContent: { paddingBottom: 40 },

  avatarSection: { alignItems: 'center', marginTop: 20, marginBottom: 24 },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00FF6620',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00FF66',
    marginBottom: 12,
  },
  avatarText: { color: '#00FF66', fontSize: 36, fontWeight: 'bold' },
  userName: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { color: '#888', fontSize: 14 },

  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  statValue: { color: '#00FF66', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: '#888', fontSize: 12 },

  infoSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  infoCard: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
    gap: 16,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  infoLabel: { color: '#888', fontSize: 13, width: 80, marginLeft: 8 },
  infoValue: { color: 'white', fontSize: 13, flex: 1, textAlign: 'right' },

  actionsSection: { paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  editBtn: {
    backgroundColor: '#00FF66',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  editBtnText: { color: 'black', fontSize: 16, fontWeight: 'bold' },
  logoutBtn: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ff4d4f30',
  },
  logoutBtnText: { color: '#ff4d4f', fontSize: 16, fontWeight: '600' },

  versionText: { textAlign: 'center', color: '#444', fontSize: 11, marginTop: 20 },
});
