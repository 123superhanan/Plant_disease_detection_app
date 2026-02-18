import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'diagnosis',
    title: 'Diagnosis Complete',
    message: 'Tomato Leaf Spot detected with 98% confidence.',
    time: '2m ago',
    icon: 'checkmark-circle',
    color: '#1DB954',
  },
  {
    id: '2',
    type: 'weather',
    title: 'High Humidity Alert',
    message: '90% Humidity in your region. High risk of Fungal Rust.',
    time: '1h ago',
    icon: 'thunderstorm',
    color: '#FFA500',
  },
  {
    id: '3',
    type: 'system',
    title: 'Model Update',
    message: 'AI Engine updated to Vision-v4 for better accuracy.',
    time: 'Yesterday',
    icon: 'rocket',
    color: '#3498db',
  },
];

const NotificationItem = ({ item }: { item: (typeof MOCK_NOTIFICATIONS)[0] }) => (
  <TouchableOpacity style={styles.card}>
    <View style={[styles.iconBadge, { backgroundColor: item.color + '20' }]}>
      <Ionicons name={item.icon as any} size={24} color={item.color} />
    </View>
    <View style={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <Text style={styles.message} numberOfLines={2}>
        {item.message}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function Notifications() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markRead}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>All caught up!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  markRead: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#121212',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    color: '#555',
    fontSize: 12,
  },
  message: {
    color: '#B3B3B3',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: '#555',
    fontSize: 18,
    marginTop: 10,
  },
});
