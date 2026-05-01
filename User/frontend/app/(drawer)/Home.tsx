import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  Activity,
  AlertCircle,
  Calendar,
  Camera,
  ChevronRight,
  Droplet,
  Leaf,
  LogOut,
  MapPin,
  Sprout,
  Sun,
  TrendingUp,
  User,
} from 'lucide-react-native';
import { useCallback, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// 🚀 Cached data - loads instantly from memory
let cachedSummary = null;
let cachedRecommendation = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

function Home() {
  const { isLoaded, isSignedIn, signOut, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // 🚀 State with initial cached values
  const [summary, setSummary] = useState(cachedSummary);
  const [recommendation, setRecommendation] = useState(cachedRecommendation);
  const [loading, setLoading] = useState(!cachedSummary);
  const [refreshing, setRefreshing] = useState(false);

  // 🚀 Load data ONCE when screen focuses
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        // Use cache if fresh
        const now = Date.now();
        if (cachedSummary && now - lastFetchTime < CACHE_DURATION) {
          setSummary(cachedSummary);
          setRecommendation(cachedRecommendation);
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          const token = await getToken();
          if (!token) {
            setLoading(false);
            return;
          }

          // 🚀 PARALLEL fetch - MUCH faster
          const [summaryRes, recommendationRes] = await Promise.allSettled([
            fetch('http://localhost:5001/api/users/profile-summary', {
              headers: { Authorization: `Bearer ${token}` },
            }).then(r => (r.ok ? r.json() : null)),
            fetchRecommendation(token),
          ]);

          if (summaryRes.status === 'fulfilled' && summaryRes.value) {
            cachedSummary = summaryRes.value;
            setSummary(summaryRes.value);
          }

          if (recommendationRes.status === 'fulfilled' && recommendationRes.value) {
            cachedRecommendation = recommendationRes.value;
            setRecommendation(recommendationRes.value);
          }

          lastFetchTime = Date.now();
        } catch (err) {
          console.error('Load error:', err);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      };

      loadData();
    }, [isSignedIn])
  );

  const fetchRecommendation = async token => {
    try {
      const primaryCrop = cachedSummary?.special_plants?.[0] || 'Tomato';
      const growthStage = cachedSummary?.plant_phases?.[0] || 'Flowering';
      const location = cachedSummary?.location || 'Faisalabad';

      const month = new Date().getMonth();
      let season = 'Spring';
      if (month >= 2 && month <= 4) season = 'Spring';
      else if (month >= 5 && month <= 7) season = 'Summer';
      else if (month >= 8 && month <= 10) season = 'Autumn';
      else season = 'Winter';

      // ⏱️ 3 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('http://localhost:5001/api/recommendation/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ location, crop: primaryCrop, growth_stage: growthStage, season }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch (err) {
      // Silent fail
    }
    return null;
  };

  const onRefresh = () => {
    setRefreshing(true);
    cachedSummary = null;
    lastFetchTime = 0;
    // Trigger reload via useFocusEffect
  };

  // 🚀 Show UI IMMEDIATELY (even while loading)
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header - Always shows instantly */}
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1DB954" />
        }
      >
        {/* Welcome - Always visible */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greetingText}>Hello, {user?.firstName || 'Gardener'} 👋</Text>
          <Text style={styles.subGreeting}>Your garden is active today.</Text>
        </View>

        {/* Stats Grid - Shows cached or placeholder */}
        <View style={styles.gridContainer}>
          <View style={[styles.gridItem, { width: '100%' }]}>
            <View style={styles.itemHeader}>
              <MapPin color="#1DB954" size={18} />
              <Text style={styles.itemTitle}>Location</Text>
            </View>
            <Text style={styles.itemValue}>
              {loading ? 'Loading...' : summary?.location || 'Set Location'}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.itemHeader}>
              <Sprout color="#1DB954" size={18} />
              <Text style={styles.itemTitle}>Crops</Text>
            </View>
            <Text style={styles.itemValue}>
              {loading ? '...' : summary?.special_plants?.length || 0}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.itemHeader}>
              <Activity color="#1DB954" size={18} />
              <Text style={styles.itemTitle}>Status</Text>
            </View>
            <Text style={[styles.itemValue, { color: '#1DB954' }]}>Healthy</Text>
          </View>
        </View>

        {/* AI Recommendation - Shows cached or loading */}
        <View style={styles.recommendationSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌱 AI Recommendation</Text>
          </View>

          {recommendation ? (
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <TrendingUp color="#1DB954" size={20} />
                <Text style={styles.recommendationTitle}>Suggested Action</Text>
              </View>
              <Text style={styles.recommendationText}>{recommendation.recommendation}</Text>
              <View style={styles.recommendationDetails}>
                <View style={styles.detailRow}>
                  <Droplet color="#888" size={14} />
                  <Text style={styles.detailText}>
                    Based on: {summary?.location || 'Faisalabad'} •{' '}
                    {summary?.special_plants?.[0] || 'Tomato'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptyRecommendationCard}
              onPress={() => router.push('/infogathering')}
            >
              <AlertCircle color="#444" size={20} />
              <Text style={styles.emptyRecommendationText}>
                {loading
                  ? 'Loading recommendation...'
                  : 'Complete your profile to get AI recommendations'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Current Phases */}
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

        {/* Actions */}
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
  container: { flex: 1, backgroundColor: '#0A0A0A' },
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
  recommendationSection: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  manageText: { color: '#1DB954', fontSize: 14, fontWeight: '600' },
  recommendationCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  recommendationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  recommendationTitle: { color: '#1DB954', fontSize: 16, fontWeight: '700' },
  recommendationText: { color: 'white', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  recommendationDetails: {
    backgroundColor: '#0F0F0F',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  detailText: { color: '#AAA', fontSize: 12 },
  emptyRecommendationCard: {
    backgroundColor: '#161616',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyRecommendationText: { color: '#555', fontSize: 14, textAlign: 'center' },
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
