import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';

export default function History() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [state, setState] = useState({
    history: [],
    stats: null,
    loading: true,
    refreshing: false,
  });

  // FIX 3: Stable callback with NO dependency on getToken
  // This prevents the function from being recreated on every auth state change
  const loadHistory = useCallback(async (isRefreshing = false) => {
    try {
      // FIX 1: Standard token retrieval (Clerk handles freshness)
      const token = await getToken();
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        const cleaned = (data.history || []).map(item => ({
          ...item,
          predictionObj: item.prediction ? JSON.parse(item.prediction) : null,
          createdAtText: new Date(item.created_at).toLocaleString(),
        }));

        // FIX 4: Atomic state update (Batching loading/data/refreshing)
        setState(prev => ({
          ...prev,
          history: cleaned,
          stats: data.stats || null,
          loading: false,
          refreshing: false,
        }));
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setState(prev => ({ ...prev, loading: false, refreshing: false }));
    }
  }, []);

  // FIX 2: Prevent double-loading and cleanup on unmount
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchData = async () => {
        if (isMounted) await loadHistory();
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    }, [loadHistory])
  );

  const onRefresh = useCallback(() => {
    setState(prev => ({ ...prev, refreshing: true }));
    loadHistory(true);
  }, [loadHistory]);

  if (state.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#121212', '#000000']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerText}>History</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={state.history}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/results',
                  params: {
                    prediction: JSON.stringify(item.predictionObj),
                    imageUri: item.image_url,
                  },
                })
              }
            >
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Text>🌿</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.disease_detected}</Text>
                  <Text style={styles.date}>{item.createdAtText}</Text>
                </View>
                <ChevronRight color="#555" size={20} />
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl
              refreshing={state.refreshing}
              onRefresh={onRefresh}
              tintColor="#1DB954"
            />
          }
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerText: { color: 'white', fontSize: 20, fontWeight: '700' },
  card: {
    backgroundColor: '#181818',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { color: 'white', fontSize: 16, fontWeight: '600' },
  date: { color: '#666', fontSize: 12, marginTop: 2 },
});
