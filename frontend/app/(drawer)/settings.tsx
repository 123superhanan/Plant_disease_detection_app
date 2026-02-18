import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: boolean;
  onValueChange?: (val: boolean) => void;
  type: 'switch' | 'link';
}

const SettingItem = ({ icon, title, subtitle, value, onValueChange, type }: SettingItemProps) => (
  <TouchableOpacity style={styles.item} activeOpacity={type === 'link' ? 0.7 : 1}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={22} color="#1DB954" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.itemTitle}>{title}</Text>
      {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
    </View>
    {type === 'switch' ? (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3E3E3E', true: '#1DB954' }}
        thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
      />
    ) : (
      <Ionicons name="chevron-forward" size={20} color="#555" />
    )}
  </TouchableOpacity>
);

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [highAccuracy, setHighAccuracy] = useState(true); // ML specific setting

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* SECTION: AI & ML CONFIG */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Engine</Text>
        <SettingItem
          icon="hardware-chip-outline"
          title="High-Accuracy Mode"
          subtitle="Uses latest model (Vision-v4)"
          type="switch"
          value={highAccuracy}
          onValueChange={setHighAccuracy}
        />
        <SettingItem
          icon="cloud-upload-outline"
          title="Auto-Sync Context"
          subtitle="Upload weather & humidity data"
          type="switch"
          value={true}
        />
      </View>

      {/* SECTION: PREFERENCES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingItem
          icon="notifications-outline"
          title="Push Notifications"
          subtitle="Alerts on diagnosis completion"
          type="switch"
          value={notifications}
          onValueChange={setNotifications}
        />
        <SettingItem
          icon="map-outline"
          title="Location Access"
          subtitle="For regional disease tracking"
          type="link"
        />
      </View>

      {/* SECTION: ACCOUNT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem
          icon="person-outline"
          title="Subscription"
          subtitle="Premium Researcher"
          type="link"
        />
        <SettingItem icon="shield-checkmark-outline" title="Privacy & Data" type="link" />
      </View>

      {/* VERSION INFO */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>AgriVison AI v1.0.0</Text>
        <Text style={styles.footerCredit}>FYP Project • 2026</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // True black for OLED screens
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212', // Dark grey cards
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  itemSubtitle: {
    color: '#B3B3B3',
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    marginTop: 40,
    marginBottom: 60,
    alignItems: 'center',
  },
  versionText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
  },
  footerCredit: {
    color: '#333',
    fontSize: 10,
    marginTop: 4,
  },
});
