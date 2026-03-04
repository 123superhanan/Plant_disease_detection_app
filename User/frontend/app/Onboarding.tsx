import { LinearGradient } from 'expo-linear-gradient'; // Add this for the premium feel
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Scan Your Plant',
    description: 'Capture or upload a leaf image to detect plant diseases using AI.',
   
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6',
  },
  {
    id: '2',
    title: 'AI Disease Detection',
    description: 'Our deep learning model analyzes leaf patterns and predicts disease instantly.',
   
    image:
      'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Smart Treatment Advice',
    description: 'Get actionable recommendations to protect your crops and improve yield.',
   
    image:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop',
  },
];

export default function Onboarding() {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.replace('/(auth)/register');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/register');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skip} onPress={handleSkip}>
        <Text style={styles.skipText}>SKIP</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onMomentumScrollEnd={event => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <LinearGradient colors={['transparent', '#121212']} style={styles.imageGradient} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index ? styles.activeDot : styles.inactiveDot]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'START DETECTION' : 'NEXT'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Deep black theme
  },
  skip: {
    position: 'absolute',
    top: 60,
    right: 25,
    zIndex: 10,
  },
  skipText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  slide: {
    width,
    alignItems: 'center',
  },
  imageContainer: {
    width: width,
    height: height * 0.55,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 150,
  },
  textContainer: {
    paddingHorizontal: 40,
    marginTop: -20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 30,
    paddingBottom: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#333',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#1DB954', // Spotify Green
    shadowColor: '#1DB954',
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
  button: {
    backgroundColor: '#1DB954',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1DB954',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  image: {
    width: width, // Use Dimensions.get('window').width
    height: height * 0.5, // Explicitly set a height
    backgroundColor: '#1e1e1e', // Add this to see if the box is there
  }
});
