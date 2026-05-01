import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Camera, Droplet, History, LayoutGrid, MapPin, Sprout, User } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

function Home() {
  const { isLoaded, signOut, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // Simplified state for the demo
  const [loading, setLoading] = useState(false);
  const [summary] = useState({ location: 'Faisalabad', cropCount: 3 });

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FF66" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. TOP BAR: Clean & Focused */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Salaam, {user?.firstName || 'Gardener'}</Text>
            <View style={styles.locationBadge}>
              <MapPin size={12} color="#888" />
              <Text style={styles.locationText}>{summary.location}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push('/(drawer)/profile')}
          >
            <User color="white" size={20} />
          </TouchableOpacity>
        </View>

        {/* 2. MAIN STATUS CARD: High Visual Impact */}
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Garden Status / حال</Text>
            <Text style={styles.statusValue}>SABZ (Healthy)</Text>
          </View>
          <View style={styles.statusCircle}>
            <Sprout color="#00FF66" size={32} />
          </View>
        </View>

        {/* 3. PRIMARY ACTION: The "Everything" Button */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/Upload')}
          activeOpacity={0.8}
        >
          <View style={styles.scanIconCircle}>
            <Camera color="black" size={30} />
          </View>
          <View>
            <Text style={styles.scanTitle}>Check Plant Disease</Text>
            <Text style={styles.scanSub}>بیماری چیک کریں</Text>
          </View>
        </TouchableOpacity>

        {/* 4. QUICK STATS: Simplified Visuals */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <LayoutGrid color="#00FF66" size={24} />
            <Text style={styles.statNum}>{summary.cropCount}</Text>
            <Text style={styles.statLabel}>Crops</Text>
          </View>
          <View style={styles.statBox}>
            <Droplet color="#3498db" size={24} />
            <Text style={styles.statNum}>Today</Text>
            <Text style={styles.statLabel}>Watering</Text>
          </View>
        </View>

        {/* 5. RECOMMENDATION: Card Style */}
        <Text style={styles.sectionTitle}>AI Advice / مشورہ</Text>
        <TouchableOpacity style={styles.adviceCard}>
          <Text style={styles.adviceEmoji}>💡</Text>
          <Text style={styles.adviceText}>
            It's getting hot in {summary.location}. Water your Tomatoes after sunset tonight.
          </Text>
        </TouchableOpacity>

        {/* 6. BOTTOM NAVIGATION: Large Targets */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/history')}>
            <History color="#888" size={24} />
            <Text style={styles.navText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => signOut()}>
            <Text style={[styles.navText, { color: '#ff4d4f' }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greeting: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { color: '#888', fontSize: 14 },
  profileBtn: { backgroundColor: '#1A1A1A', padding: 10, borderRadius: 12 },

  // Status Card
  statusCard: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 20,
  },
  statusLabel: { color: '#888', fontSize: 12, fontWeight: '600' },
  statusValue: { color: '#00FF66', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  statusCircle: { backgroundColor: 'rgba(0, 255, 102, 0.1)', padding: 15, borderRadius: 50 },

  // Scan Button (High Importance)
  scanButton: {
    backgroundColor: '#00FF66',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 25,
    // Add a slight glow
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  scanIconCircle: { backgroundColor: 'white', padding: 12, borderRadius: 16 },
  scanTitle: { color: 'black', fontSize: 18, fontWeight: '800' },
  scanSub: { color: 'rgba(0,0,0,0.6)', fontSize: 14, fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  statBox: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  statNum: { color: 'white', fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  statLabel: { color: '#666', fontSize: 12 },

  // Advice
  sectionTitle: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 10 },
  adviceCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  adviceEmoji: { fontSize: 24 },
  adviceText: { color: '#BBB', flex: 1, fontSize: 14, lineHeight: 20 },

  // Footer
  footerRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, opacity: 0.7 },
  navItem: { alignItems: 'center' },
  navText: { color: '#888', fontSize: 12, marginTop: 4 },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
