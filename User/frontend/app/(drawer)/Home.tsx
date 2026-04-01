import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import {
  Camera,
  ChevronRight,
  Leaf,
  LogOut,
  MapPin,
  Sprout,
  User,
  Activity,
  Calendar,
  AlertCircle,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

function Home() {
  const { isLoaded, isSignedIn, signOut, getToken } = useAuth();
  const { user } = useUser();
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
      console.error(err);
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

      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandText}>
            AgriVision <Text style={styles.aiText}>AI</Text>
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileCircle}
          onPress={() => router.push('/(drawer)/profile')}
        >
          <User color="#1DB954" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greetingText}>Hello, {user?.firstName || 'Gardener'}</Text>
          <Text style={styles.subGreeting}>Your garden is active today.</Text>
        </View>

        {/* Bento Grid Stats */}
        <View style={styles.gridContainer}>
          <View style={[styles.gridItem, { width: '100%' }]}>
            <View style={styles.itemHeader}>
              <MapPin color="#1DB954" size={18} />
              <Text style={styles.itemTitle}>Location</Text>
            </View>
            <Text style={styles.itemValue}>{summary?.location || 'Set Location'}</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.itemHeader}>
              <Sprout color="#1DB954" size={18} />
              <Text style={styles.itemTitle}>Crops</Text>
            </View>
            <Text style={styles.itemValue}>{summary?.special_plants?.length || 0}</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.itemHeader}>
              <Activity color="#1DB954" size={18} />
              <Text style={styles.itemTitle}>Status</Text>
            </View>
            <Text style={[styles.itemValue, { color: '#1DB954' }]}>Healthy</Text>
          </View>
        </View>

        {/* Dynamic Phases List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Phases</Text>
          <TouchableOpacity onPress={() => router.push('/infogathering')}>
            <Text style={styles.manageText}>Update</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.phaseContainer}>
          {summary?.plant_phases?.length > 0 ? (
            summary.plant_phases.map((phase, i) => (
              <View key={i} style={styles.phaseCard}>
                <Calendar color="#888" size={16} />
                <Text style={styles.phaseText}>{phase}</Text>
              </View>
            ))
          ) : (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => router.push('/infogathering')}
            >
              <AlertCircle color="#444" size={20} />
              <Text style={styles.emptyText}>Add your current growth stages</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Primary Functional Actions */}
        <TouchableOpacity style={styles.primaryScanBtn} onPress={() => router.push('/Upload')}>
          <Camera color="black" size={24} />
          <Text style={styles.primaryBtnText}>Start AI Diagnosis</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/history')}>
            <Leaf color="#1DB954" size={22} />
            <Text style={styles.actionCardText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => signOut()}>
            <LogOut color="#ff4d4f" size={22} />
            <Text style={styles.actionCardText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' }, // Deeper black for utility feel
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  brandText: { color: 'white', fontSize: 20, fontWeight: '800' },
  aiText: { color: '#1DB954' },
  dateText: { color: '#555', fontSize: 12, marginTop: 2, fontWeight: '600' },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: { padding: 24, paddingBottom: 40 },
  welcomeSection: { marginBottom: 24 },
  greetingText: { color: 'white', fontSize: 24, fontWeight: '700' },
  subGreeting: { color: '#888', fontSize: 14, marginTop: 4 },

  // Bento Grid
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  gridItem: {
    backgroundColor: '#161616',
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  itemTitle: { color: '#888', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  itemValue: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  manageText: { color: '#1DB954', fontSize: 14, fontWeight: '600' },

  phaseContainer: { marginBottom: 32 },
  phaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 10,
  },
  phaseText: { color: '#CCC', fontSize: 14, fontWeight: '500' },
  emptyCard: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#333',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: { color: '#555', fontSize: 14 },

  // Actions
  primaryScanBtn: {
    backgroundColor: '#1DB954',
    flexDirection: 'row',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  primaryBtnText: { color: 'black', fontSize: 16, fontWeight: '800' },
  secondaryActions: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: '#161616',
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  actionCardText: { color: 'white', fontSize: 14, fontWeight: '600' },
});

export default Home;
