import { MapPin } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

export default function GardenMap({ location }) {
  return (
    <View style={styles.webPlaceholder}>
      <MapPin color="#1DB954" size={24} />
      <Text style={styles.text}>{location || 'Location view not available on web'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webPlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#252525',
    borderRadius: 15,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  text: { color: '#888', marginTop: 8, fontSize: 12 },
});
