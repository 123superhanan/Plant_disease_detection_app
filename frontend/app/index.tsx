import { Link } from 'expo-router';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Ensure this is installed


const { width, height } = Dimensions.get('window');

export default function Index() {
  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6',
      }}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Darker, Spotify-style gradient overlay */}
      <LinearGradient
        colors={['rgba(18, 18, 18, 0.4)', 'rgba(18, 18, 18, 0.95)']}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>BEYOND GARDENING</Text>
          </View>
          <Text style={styles.title}>AgroVision</Text>
          <View style={styles.line} />
          <Text style={styles.subtitle}>AI Powered Plant Disease{'\n'}Detection & Support</Text>
        </View>

        <View style={styles.bottomContainer}>
          <Link href="/Onboarding" asChild>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
              <Text style={styles.primaryText}>GET STARTED</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>
                New here? <Text style={styles.greenText}>Create an account</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 30,
  },
  content: {
    marginTop: height * 0.15,
  },
  badge: {
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  badgeText: {
    color: '#1DB954',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    // Adds a subtle glow to the text
    textShadowColor: 'rgba(29, 185, 84, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  line: {
    width: 40,
    height: 4,
    backgroundColor: '#1DB954',
    marginVertical: 15,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    color: '#888',
    fontWeight: '500',
  },
  bottomContainer: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#1DB954',
    padding: 20,
    borderRadius: 35, // More rounded like Spotify
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#1DB954',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  secondaryButton: {
    alignItems: 'center',
    padding: 10,
  },
  secondaryText: {
    color: '#888',
    fontSize: 14,
  },
  greenText: {
    color: '#1DB954',
    fontWeight: '600',
  },
  image: {
    width: width, // Use Dimensions.get('window').width
    height: height * 0.5, // Explicitly set a height
    backgroundColor: '#1e1e1e', // Add this to see if the box is there
  },
});
