import { Link } from 'expo-router';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6',
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>AgroVision</Text>
          <Text style={styles.subtitle}>AI Powered Plant Disease Detection</Text>
        </View>
        {/* <View style={styles.overlay}>
          <View>
            <Text style={styles.title}>To the drawer</Text>
            <Link href="/(drawer)/profile">Profile</Link>
          </View>
        </View> */}
        <View style={styles.bottomContainer}>
          <Link href="/Onboarding" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryText}>Get Started</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Dont have an account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'space-between',
    padding: 30,
  },
  content: {
    marginTop: 120,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#e0f2f1',
  },
  bottomContainer: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#2e7d32',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    alignItems: 'center',
  },
  secondaryText: {
    color: '#ffffff',
    fontSize: 14,
  },
});
