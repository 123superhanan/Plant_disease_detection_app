import { StyleSheet } from 'react-native';
import MapView from 'react-native-maps';

export default function GardenMap({ location }) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 37.78825, // You can pass dynamic lat/lng from your summary
        longitude: -122.4324,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    />
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: 150, borderRadius: 15, marginTop: 10 },
});
