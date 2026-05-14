import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('https://their-api.com/api/notifications?recipients=all_users');
      const data = await response.json();

      // Transform their data to match your UI
      const formatted = data.data.map(notif => ({
        id: notif._id,
        title: notif.title,
        message: notif.message,
        time: new Date(notif.sentAt).toLocaleTimeString(),
        icon: getIconByType(notif.type),
        color: getColorByType(notif.type),
        isRead: notif.isRead,
      }));

      setNotifications(formatted);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconByType = type => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      default:
        return 'notifications';
    }
  };

  const getColorByType = type => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#1DB954';
    }
  };

  const markAsRead = async id => {
    await fetch(`https://their-api.com/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
    fetchNotifications(); // Refresh
  };

  const markAllAsRead = async () => {
    await fetch('https://their-api.com/api/notifications/mark-all-read', {
      method: 'POST',
    });
    fetchNotifications();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.markRead}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.isRead && styles.unreadCard]}
            onPress={() => markAsRead(item.id)}
          >
            <View style={[styles.iconBadge, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.content}>
              <View style={styles.headerRow}>
                <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.message} numberOfLines={2}>
                {item.message}
              </Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
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
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  markRead: { color: '#1DB954', fontSize: 14, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingTop: 10 },
  card: {
    backgroundColor: '#121212',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  unreadCard: { backgroundColor: '#1A2A1A' },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  content: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  title: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  unreadTitle: { color: '#1DB954' },
  time: { color: '#555', fontSize: 12 },
  message: { color: '#B3B3B3', fontSize: 14, lineHeight: 20 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1DB954', marginLeft: 10 },
  emptyState: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#555', fontSize: 18, marginTop: 10 },
});
