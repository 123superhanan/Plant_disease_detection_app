import { useAuth } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Download,
  Share2,
  Trash2,
  TrendingUp,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function History() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load history data
  const loadHistory = async () => {
    try {
      const token = await getToken();

      const response = await fetch('http://localhost:5001/api/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setHistory(data.history || []);
        setStats(data.stats);
      } else {
        console.error('Error loading history:', data.error);
      }
    } catch (error) {
      console.error('Network error:', error);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete a single detection
  const deleteDetection = async id => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this detection?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            const response = await fetch(`http://localhost:5001/api/history/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
              loadHistory(); // Refresh the list
              Alert.alert('Success', 'Detection deleted');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  // Share detection result
  const shareResult = async item => {
    const message = `
🌿 Plant Diagnosis Report
━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date: ${new Date(item.created_at).toLocaleDateString()}
🦠 Disease: ${item.disease_detected}
📊 Confidence: ${(item.confidence * 100).toFixed(1)}%
💚 Health Score: ${item.health_score || 'N/A'}

💊 Treatment: ${item.prediction?.recommendations?.treatment || 'N/A'}
🛡️ Prevention: ${item.prediction?.recommendations?.prevention || 'N/A'}

Powered by AgriVision AI 🌱
    `;

    try {
      await Share.share({ message, title: 'Plant Diagnosis Report' });
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
    }
  };

  // Refresh on focus
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

  const getDiseaseIcon = disease => {
    if (disease === 'Healthy') return '✅';
    if (disease === 'Powdery') return '💧';
    if (disease === 'Rust') return '⚠️';
    return '🔍';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1DB95420', 'transparent']} style={styles.headerGradient} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HISTORY</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1DB954" />
        }
      >
        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <TrendingUp color="#1DB954" size={20} />
              <Text style={styles.statValue}>{stats.total_scans || 0}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>
            <View style={styles.statCard}>
              <AlertCircle color="#F44336" size={20} />
              <Text style={styles.statValue}>{stats.diseased_scans || 0}</Text>
              <Text style={styles.statLabel}>Issues Found</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar color="#1DB954" size={20} />
              <Text style={styles.statValue}>
                {stats.avg_confidence ? Math.round(stats.avg_confidence * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>Avg Accuracy</Text>
            </View>
          </View>
        )}

        {/* History List */}
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptyText}>Upload a plant photo to get started</Text>
            <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/Upload')}>
              <Text style={styles.scanBtnText}>Scan a Plant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          history.map((item, index) => (
            <View key={item.id || index} style={styles.historyCard}>
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => {
                  router.push({
                    pathname: '/results',
                    params: {
                      prediction: JSON.stringify(
                        item.prediction || {
                          disease: item.disease_detected,
                          confidence: item.confidence,
                          recommendations: {
                            treatment: 'Consult local expert',
                            prevention: 'Regular monitoring',
                            severity: 'Unknown',
                          },
                        }
                      ),
                      imageUri: item.image_url,
                    },
                  });
                }}
              >
                <View style={styles.cardLeft}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: getDiseaseColor(item.disease_detected) + '20' },
                    ]}
                  >
                    <Text style={styles.iconEmoji}>{getDiseaseIcon(item.disease_detected)}</Text>
                  </View>
                </View>

                <View style={styles.cardCenter}>
                  <Text
                    style={[styles.diseaseText, { color: getDiseaseColor(item.disease_detected) }]}
                  >
                    {item.disease_detected}
                  </Text>
                  <Text style={styles.confidenceText}>
                    {(item.confidence * 100).toFixed(1)}% confidence
                  </Text>
                  <Text style={styles.dateText}>
                    {new Date(item.created_at).toLocaleDateString()} at{' '}
                    {new Date(item.created_at).toLocaleTimeString()}
                  </Text>
                </View>

                <View style={styles.cardRight}>
                  <ChevronRight color="#555" size={20} />
                </View>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => shareResult(item)}>
                  <Share2 color="#1DB954" size={16} />
                  <Text style={styles.actionBtnText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => deleteDetection(item.id)}
                >
                  <Trash2 color="#F44336" size={16} />
                  <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Download Data Button */}
        {history.length > 0 && (
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() => Alert.alert('Export', 'Export to CSV feature coming soon!')}
          >
            <Download color="black" size={20} />
            <Text style={styles.downloadBtnText}>Export All Data</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
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
  scrollContent: { paddingBottom: 40 },

  // Stats
  statsContainer: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  statValue: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },

  // Empty State
  emptyContainer: { alignItems: 'center', paddingTop: 100 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: '#888', fontSize: 14, marginBottom: 24, textAlign: 'center' },
  scanBtn: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  scanBtnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },

  // History Cards
  historyCard: {
    backgroundColor: '#161616',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
  },
  cardContent: { flexDirection: 'row', padding: 16 },
  cardLeft: { marginRight: 12 },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: { fontSize: 24 },
  cardCenter: { flex: 1, justifyContent: 'center' },
  diseaseText: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  confidenceText: { color: '#AAA', fontSize: 12, marginBottom: 2 },
  dateText: { color: '#666', fontSize: 11 },
  cardRight: { justifyContent: 'center' },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
  },
  actionBtnText: { color: '#1DB954', fontSize: 12, fontWeight: '500' },
  deleteBtn: { backgroundColor: '#2A1A1A' },
  deleteBtnText: { color: '#F44336' },

  // Download Button
  downloadBtn: {
    backgroundColor: '#1DB954',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadBtnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});
