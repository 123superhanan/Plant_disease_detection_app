import { useAuth } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, Trash2, XCircle } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function History() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = 'http://192.168.10.5:5001'; // CHANGE THIS TO YOUR IP

  const loadHistory = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        setHistory(data.history || []);
        setStats(data.stats);
      } else {
        console.log('No history found');
        setHistory([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const deleteDetection = async id => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            await fetch(`${API_BASE}/api/history/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            loadHistory();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const getDiseaseColor = disease => {
    if (disease === 'Healthy') return '#4CAF50';
    if (disease === 'Powdery') return '#FF9800';
    if (disease === 'Rust') return '#F44336';
    return '#888';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1DB95420', 'transparent']} style={styles.headerGradient} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HISTORY</Text>
        <View style={{ width: 40 }} />
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <XCircle color="#555" size={60} />
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptyText}>Upload a plant photo to get started</Text>
          <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/Upload')}>
            <Text style={styles.scanBtnText}>Scan a Plant</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1DB954" />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                router.push({
                  pathname: '/results',
                  params: { prediction: JSON.stringify(item.prediction), imageUri: item.image_url },
                });
              }}
            >
              {item.image_url && (
                <Image source={{ uri: `${API_BASE}${item.image_url}` }} style={styles.image} />
              )}
              <View style={styles.cardContent}>
                <Text style={[styles.disease, { color: getDiseaseColor(item.disease_detected) }]}>
                  {item.disease_detected}
                </Text>
                <Text style={styles.confidence}>
                  {(item.confidence * 100).toFixed(1)}% confidence
                </Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteDetection(item.id)} style={styles.deleteBtn}>
                <Trash2 color="#F44336" size={20} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 150 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  image: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  cardContent: { flex: 1 },
  disease: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  confidence: { color: '#AAA', fontSize: 12, marginBottom: 2 },
  date: { color: '#666', fontSize: 11 },
  deleteBtn: { padding: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  emptyText: { color: '#888', fontSize: 14, marginTop: 8, textAlign: 'center' },
  scanBtn: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  scanBtnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});
