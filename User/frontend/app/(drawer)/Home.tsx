import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Camera, ChevronRight, Leaf, LogOut, MapPin, Sprout, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

function Home() {
  const { isLoaded, isSignedIn, signOut, getToken } = useAuth();
  const { user } = useUser(); // Get user details like name
  const router = useRouter();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadSummary();
    }
  }, [isLoaded, isSignedIn]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch('http://localhost:5001/api/users/profile-summary', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.log('Summary fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.username}>{user?.firstName || 'Gardener'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileCircle}
            onPress={() => router.push('/(drawer)/profile')}
          >
            <User color="#1DB954" size={24} />
          </TouchableOpacity>
        </View>

        {/* Profile Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            S<Text style={styles.cardTitle}>Garden Overview</Text>
            <TouchableOpacity onPress={() => router.push('/infogathering')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MapPin color="#1DB954" size={20} />
              <Text style={styles.statLabel}>{summary?.location || 'Global'}</Text>
            </View>
            <View style={styles.statItem}>
              <Sprout color="#1DB954" size={20} />
              <Text style={styles.statLabel}>{summary?.special_plants?.length || 0} Crops</Text>
            </View>
          </View>

          <View style={styles.chipContainer}>
            {summary?.plant_phases?.map((phase, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{phase}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.mainActionBtn} onPress={() => router.push('/Upload')}>
          <View style={styles.actionIconWrapper}>
            <Camera color="black" size={28} />
          </View>
          <View style={styles.actionTextWrapper}>
            <Text style={styles.actionTitle}>Scan Plant</Text>
            <Text style={styles.actionSubtitle}>Identify disease in seconds</Text>
          </View>
          <ChevronRight color="#555" size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => router.push('/history')}>
          <View style={[styles.actionIconWrapper, { backgroundColor: '#333' }]}>
            <Leaf color="#1DB954" size={24} />
          </View>
          <View style={styles.actionTextWrapper}>
            <Text style={styles.actionTitle}>Treatment History</Text>
            <Text style={styles.actionSubtitle}>View past detections</Text>
          </View>
          <ChevronRight color="#555" size={20} />
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={() => signOut(() => router.replace('/(auth)/register'))}
          style={styles.signOutBtn}
        >
          <LogOut color="#ff4d4f" size={20} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  scrollContent: { padding: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: { color: '#888', fontSize: 16, fontWeight: '500' },
  username: { color: 'white', fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },

  summaryCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  editLink: { color: '#1DB954', fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statLabel: { color: '#ccc', fontSize: 14 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { color: '#1DB954', fontSize: 12, fontWeight: 'bold' },

  sectionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  mainActionBtn: {
    backgroundColor: '#1DB954',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryActionBtn: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextWrapper: { flex: 1, marginLeft: 16 },
  actionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  actionSubtitle: { color: '#888', fontSize: 13 },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 40,
    padding: 15,
  },
  signOutText: { color: '#ff4d4f', fontSize: 16, fontWeight: '600' },
});

export default Home;
