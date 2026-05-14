import Voice from '@react-native-voice/voice';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  AlertTriangle,
  Camera,
  Droplet,
  Edit2,
  Globe,
  History,
  LayoutGrid,
  Leaf,
  Lightbulb,
  Loader,
  MapPin,
  Mic,
  Sprout,
  User,
  Volume2,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

// Translations for UI elements
const translations = {
  en: {
    gardenStatus: 'Garden Status',
    healthy: 'Healthy',
    checkDisease: 'Check Plant Disease',
    checkDiseaseUrdu: 'بیماری چیک کریں',
    crops: 'Crops',
    watering: 'Watering',
    aiAdvice: 'AI Advice / مشورہ',
    loadingAdvice: 'Generating recommendation...',
    completeProfile: 'Complete your profile to get personalized AI recommendations',
    history: 'History',
    logOut: 'Log Out',
    generating: 'Generating recommendation...',
  },
  ur: {
    gardenStatus: 'گارڈن کی حالت',
    healthy: 'صحت مند',
    checkDisease: 'پودے کی بیماری چیک کریں',
    checkDiseaseUrdu: 'بیماری چیک کریں',
    crops: 'فصلیں',
    watering: 'پانی',
    aiAdvice: 'AI مشورہ',
    loadingAdvice: 'تجویز تیار کی جا رہی ہے...',
    completeProfile: 'ذاتی مشورے کے لیے اپنا پروفائل مکمل کریں',
    history: 'تاریخ',
    logOut: 'لاگ آؤٹ',
    generating: 'تجویز تیار کی جا رہی ہے...',
  },
};

function Home() {
  const { logout, user, getToken } = useAuth();
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [language, setLanguage] = useState('en');

  const loadProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/users/profile-summary-public?email=${encodeURIComponent(user.email)}`
      );
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLastDetection = async () => {
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:5001/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.history?.[0] || { disease: 'No scans yet' };
      }
    } catch (error) {
      console.error('Error fetching last detection:', error);
    }
    return { disease: 'No scans yet' };
  };

  const speakResponse = text => {
    Speech.speak(text, {
      language: language === 'en' ? 'en-US' : 'ur-PK',
    });
  };

  const fetchRecommendation = async (location, crop, growthStage) => {
    setRecommendationLoading(true);
    try {
      const token = await getToken();

      const month = new Date().getMonth();
      let season = 'Spring';
      if (month >= 2 && month <= 4) season = 'Spring';
      else if (month >= 5 && month <= 7) season = 'Summer';
      else if (month >= 8 && month <= 10) season = 'Autumn';
      else season = 'Winter';

      const response = await fetch('http://localhost:5001/api/recommendation/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location: location,
          crop: crop,
          growth_stage: growthStage,
          season: season,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendation(data);
      }
    } catch (error) {
      console.error('Recommendation error:', error);
    } finally {
      setRecommendationLoading(false);
    }
  };

  const speakAdvice = () => {
    if (recommendation?.recommendation) {
      Speech.speak(recommendation.recommendation, {
        language: language === 'en' ? 'en-US' : 'ur-PK',
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  useEffect(() => {
    if (profile?.location && profile?.special_plants?.length > 0) {
      const primaryCrop = profile.special_plants[0];
      const growthStage = profile?.plant_phases?.[0] || 'Vegetative';
      fetchRecommendation(profile.location, primaryCrop, growthStage);
    }
  }, [profile]);

  useEffect(() => {
    Voice.onSpeechResults = e => {
      if (!e.value || !e.value.length) return;

      const spokenText = e.value[0];
      handleVoiceCommand(spokenText);
      setIsListening(false);
    };
    Voice.onSpeechError = e => {
      console.error('Voice error:', e);
      setIsListening(false);
    };
    return () => {
      Voice.destroy().then(() => Voice.removeAllListeners());
    };
  }, [recommendation, language]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FF66" />
      </View>
    );
  }

  // Urdu translations for common recommendation patterns
  const translateRecommendation = (text, targetLang) => {
    if (targetLang === 'en') return text;

    const translations = {
      'Apply potassium-rich fertilizer. Maintain consistent watering.':
        'پوٹاشیم سے بھرپور کھاد ڈالیں۔ پانی کی مستقل مقدار برقرار رکھیں۔',
      'Calcium supplement to prevent blossom end rot.':
        'پھول کے سرے کے گلنے سے بچنے کے لیے کیلشیم سپلیمنٹ ڈالیں۔',
      'Water regularly and monitor for pests. Ensure proper sunlight exposure.':
        'باقاعدگی سے پانی دیں اور کیڑوں کی نگرانی کریں۔ مناسب دھوپ یقینی بنائیں۔',
      'Stake plants. Apply balanced fertilizer.': 'پودوں کو سہارا دیں۔ متوازن کھاد ڈالیں۔',
      'Reduce nitrogen. Increase phosphorus and potassium.':
        'نائٹروجن کم کریں۔ فاسفورس اور پوٹاشیم بڑھائیں۔',
    };

    if (translations[text]) return translations[text];

    let translated = text;
    const keywordMap = {
      water: 'پانی',
      fertilizer: 'کھاد',
      potassium: 'پوٹاشیم',
      nitrogen: 'نائٹروجن',
      phosphorus: 'فاسفورس',
      pests: 'کیڑے',
      sunlight: 'دھوپ',
      leaves: 'پتے',
      apply: 'ڈالیں',
      maintain: 'برقرار رکھیں',
      prevent: 'روک تھام کریں',
      monitor: 'نگرانی کریں',
    };

    Object.keys(keywordMap).forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      translated = translated.replace(regex, keywordMap[keyword]);
    });

    return translated;
  };

  const cropCount = profile?.special_plants?.length || 0;
  const location = profile?.location || 'Islamabad, PK';
  const hasProfile = profile?.location && cropCount > 0;

  const handleVoiceCommand = async command => {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('status') || lowerCommand.includes('plant')) {
      const lastScan = await getLastDetection();
      speakResponse(`Your last scan showed ${lastScan?.disease || 'no disease'}`);
    } else if (lowerCommand.includes('advice') || lowerCommand.includes('recommend')) {
      speakResponse(recommendation?.recommendation || 'Complete your profile first');
    } else if (lowerCommand.includes('scan') || lowerCommand.includes('detect')) {
      router.push('/Upload');
    } else if (lowerCommand.includes('history')) {
      router.push('/history');
    } else {
      speakResponse('Say status, advice, scan, or history');
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        console.log('Voice not available');
        setIsListening(false);
        return;
      }
      await Voice.start('ur-PK');
    } catch (error) {
      console.error('Voice start error:', error);
      setIsListening(false);
    }
  };

  const getUserName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Gardener';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Salaam, {getUserName()}</Text>
            <View style={styles.locationBadge}>
              <MapPin size={12} color="#888" />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => router.push('/(drawer)/profile')}
            >
              <User color="white" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => router.push('/infogathering')}
            >
              <Edit2 color="white" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Setup Card */}
        {!hasProfile && (
          <TouchableOpacity
            style={styles.setupCard}
            onPress={() => router.push('/infogathering')}
            activeOpacity={0.9}
          >
            <Sprout color="#00FF66" size={24} />
            <View style={styles.setupContent}>
              <Text style={styles.setupTitle}>Complete Your Profile</Text>
              <Text style={styles.setupText}>
                Add location and crops for personalized AI advice
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>{translations[language].gardenStatus}</Text>
            <Text style={styles.statusValue}>{translations[language].healthy}</Text>
          </View>
          <View style={styles.statusCircle}>
            <Sprout color="#00FF66" size={32} />
          </View>
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/Upload')}
          activeOpacity={0.8}
        >
          <View style={styles.scanIconCircle}>
            <Camera color="black" size={30} />
          </View>
          <View>
            <Text style={styles.scanTitle}>{translations[language].checkDisease}</Text>
            <Text style={styles.scanSub}>{translations[language].checkDiseaseUrdu}</Text>
          </View>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <LayoutGrid color="#00FF66" size={24} />
            <Text style={styles.statNum}>{cropCount}</Text>
            <Text style={styles.statLabel}>{translations[language].crops}</Text>
          </View>
          <View style={styles.statBox}>
            <Droplet color="#3498db" size={24} />
            <Text style={styles.statNum}>Today</Text>
            <Text style={styles.statLabel}>{translations[language].watering}</Text>
          </View>
        </View>

        {/* AI Advice Section with Language Toggle + Speaker */}
        <View style={styles.adviceHeader}>
          <Text style={styles.sectionTitle}>{translations[language].aiAdvice}</Text>
          <View style={styles.adviceHeaderRight}>
            {/* Language Toggle Button */}
            <TouchableOpacity
              style={styles.langBtn}
              onPress={() => setLanguage(language === 'en' ? 'ur' : 'en')}
            >
              <Globe color="#00FF66" size={16} />
              <Text style={styles.langText}>{language === 'en' ? 'اردو' : 'EN'}</Text>
            </TouchableOpacity>

            {/* Text-to-Speech Button */}
            {recommendation && !recommendationLoading && (
              <TouchableOpacity style={styles.speakBtn} onPress={speakAdvice}>
                <Volume2 color="#00FF66" size={16} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {recommendation ? (
          <View style={styles.adviceCard}>
            <Lightbulb color="#FFD700" size={24} />
            <Text style={styles.adviceText}>
              {language === 'ur'
                ? translateRecommendation(recommendation.recommendation, 'ur')
                : recommendation.recommendation}
            </Text>
          </View>
        ) : recommendationLoading ? (
          <View style={styles.adviceCard}>
            <Loader color="#00FF66" size={24} />
            <Text style={styles.adviceText}>{translations[language].generating}</Text>
          </View>
        ) : hasProfile ? (
          <View style={styles.adviceCard}>
            <Leaf color="#00FF66" size={24} />
            <Text style={styles.adviceText}>{translations[language].loadingAdvice}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.adviceCard} onPress={() => router.push('/infogathering')}>
            <AlertTriangle color="#FFA500" size={24} />
            <Text style={styles.adviceText}>{translations[language].completeProfile}</Text>
          </TouchableOpacity>
        )}

        {/* Footer */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/history')}>
            <History color="#888" size={24} />
            <Text style={styles.navText}>{translations[language].history}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={logout}>
            <Text style={[styles.navText, { color: '#ff4d4f' }]}>
              {translations[language].logOut}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Voice Button */}
      <TouchableOpacity
        style={[styles.floatingVoiceBtn, isListening && styles.listeningBtn]}
        onPress={startListening}
      >
        <Mic color="black" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20, paddingBottom: 80 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  listeningBtn: {
    backgroundColor: '#FF4444',
    transform: [{ scale: 1.1 }],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { color: '#888', fontSize: 14 },
  profileBtn: { backgroundColor: '#1A1A1A', padding: 10, borderRadius: 12 },
  iconCircle: {
    backgroundColor: '#1A1A1A',
    padding: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00FF6630',
  },
  setupContent: { flex: 1 },
  setupTitle: { color: '#00FF66', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  setupText: { color: '#888', fontSize: 12 },
  statusCard: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 20,
  },
  statusLabel: { color: '#888', fontSize: 12, fontWeight: '600' },
  statusValue: { color: '#00FF66', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  statusCircle: { backgroundColor: 'rgba(0, 255, 102, 0.1)', padding: 15, borderRadius: 50 },
  scanButton: {
    backgroundColor: '#00FF66',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 25,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  scanIconCircle: { backgroundColor: 'white', padding: 12, borderRadius: 16 },
  scanTitle: { color: 'black', fontSize: 18, fontWeight: '800' },
  scanSub: { color: 'rgba(0,0,0,0.6)', fontSize: 14, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  statBox: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  statNum: { color: 'white', fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  statLabel: { color: '#666', fontSize: 12 },
  adviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  adviceHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 4,
  },
  langText: { color: '#00FF66', fontSize: 11, fontWeight: '600' },
  speakBtn: {
    backgroundColor: '#1A1A1A',
    padding: 5,
    borderRadius: 15,
  },
  adviceCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  adviceEmoji: { fontSize: 24 },
  adviceText: { color: '#BBB', flex: 1, fontSize: 14, lineHeight: 20 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, opacity: 0.7 },
  navItem: { alignItems: 'center' },
  navText: { color: '#888', fontSize: 12, marginTop: 4 },
  floatingVoiceBtn: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 60,
    height: 70,
    borderRadius: 30,
    backgroundColor: '#00FF66',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
