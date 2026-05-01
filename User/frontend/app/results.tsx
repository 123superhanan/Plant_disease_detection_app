import { useAuth } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Download,
  Droplet,
  Globe,
  Mic,
  Share2,
  Shield,
  Volume2,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ----------------------
// Full bilingual recommendation dataset (English + Urdu)
// ----------------------
const RECOMMENDATION_DATA = {
  Rust: {
    en: {
      diseaseName: 'Leaf Rust',
      treatment:
        'Remove infected leaves immediately. Apply copper-based fungicide. Spray neem oil every 7 days. Water at base, not on leaves.',
      prevention:
        'Space plants for air circulation. Water early morning. Use rust-resistant varieties. Clean garden tools regularly.',
      severity: 'High - Treat within 7 days',
      chemical: 'Copper fungicide, Mancozeb',
      organic: 'Neem oil, Baking soda spray',
      soil: 'Well-draining soil with good airflow',
    },
    ur: {
      diseaseName: 'پتوں کی زنگ',
      treatment:
        'متاثرہ پتے فوری ہٹا دیں۔ کاپر فنگسائیڈ لگائیں۔ ہر 7 دن بعد نیم کا تیل سپرے کریں۔ پانی پودے کی بنیاد پر دیں۔',
      prevention:
        'پودوں کے درمیان فاصلہ رکھیں۔ صبح سویرے پانی دیں۔ مزاحم اقسام استعمال کریں۔ اوزار صاف رکھیں۔',
      severity: 'زیادہ - 7 دن میں علاج کریں',
      chemical: 'کاپر فنگسائیڈ، مینکوزیب',
      organic: 'نیم کا تیل، بیکنگ سوڈا سپرے',
      soil: 'اچھی نکاسی والی مٹی',
    },
  },
  Powdery: {
    en: {
      diseaseName: 'Powdery Mildew',
      treatment:
        'Remove affected leaves. Apply sulfur fungicide. Use milk spray (1:10 ratio). Improve air circulation.',
      prevention: 'Avoid overhead watering. Prune dense foliage. Apply preventive sulfur.',
      severity: 'Medium - Treat within 14 days',
      chemical: 'Sulfur, Potassium bicarbonate',
      organic: 'Milk spray, Neem oil',
      soil: 'Moderate moisture, good drainage',
    },
    ur: {
      diseaseName: 'پاوڈری پھپھوندی',
      treatment:
        'متاثرہ پتے ہٹا دیں۔ سلفر فنگسائیڈ لگائیں۔ دودھ کا سپرے کریں۔ ہوا کی گردش بہتر کریں۔',
      prevention: 'پتوں پر پانی دینے سے گریز کریں۔ گھنے پتے کاٹ دیں۔',
      severity: 'درمیانی - 14 دن میں علاج کریں',
      chemical: 'سلفر، پوٹاشیم بائی کاربونیٹ',
      organic: 'دودھ کا سپرے، نیم کا تیل',
      soil: 'معتدل نمی، اچھی نکاسی',
    },
  },
  Healthy: {
    en: {
      diseaseName: 'Healthy Plant',
      treatment: 'No treatment needed. Continue good care practices.',
      prevention: 'Regular watering. Proper sunlight. Clean tools. Weekly monitoring.',
      severity: 'None',
      chemical: 'Not needed',
      organic: 'Continue good practices',
      soil: 'Healthy soil structure',
    },
    ur: {
      diseaseName: 'صحت مند پودا',
      treatment: 'کسی علاج کی ضرورت نہیں۔ اچھی دیکھ بھال جاری رکھیں۔',
      prevention: 'باقاعدہ پانی۔ مناسب دھوپ۔ صاف اوزار۔ ہفتہ وار معائنہ۔',
      severity: 'کوئی نہیں',
      chemical: 'ضرورت نہیں',
      organic: 'اچھی عادات جاری رکھیں',
      soil: 'صحت مند مٹی کا ڈھانچہ',
    },
  },
};

export default function Results() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getToken } = useAuth();
  const prediction = JSON.parse(params.prediction as string);
  const imageUri = params.imageUri as string;

  const [language, setLanguage] = useState<'en' | 'ur'>('en');

  const diseaseKey = prediction.disease as keyof typeof RECOMMENDATION_DATA;
  const data = RECOMMENDATION_DATA[diseaseKey]?.[language] || RECOMMENDATION_DATA.Healthy[language];

  const getSeverityColor = () => {
    const d = prediction.disease;
    if (d === 'Healthy') return '#4CAF50';
    if (d === 'Powdery') return '#FF9800';
    if (d === 'Rust') return '#F44336';
    return '#888';
  };

  const getSeverityIcon = () => {
    const d = prediction.disease;
    if (d === 'Healthy') return <CheckCircle color="#4CAF50" size={24} />;
    if (d === 'Powdery') return <Droplet color="#FF9800" size={24} />;
    if (d === 'Rust') return <AlertTriangle color="#F44336" size={24} />;
    return <Shield color="#888" size={24} />;
  };

  const getHealthScore = () => {
    if (prediction.disease === 'Healthy') return 95;
    if (prediction.confidence > 0.95) return 20;
    if (prediction.confidence > 0.85) return 35;
    return 50;
  };

  const handleTextToSpeech = () => {
    const text = `${data.diseaseName}. ${data.treatment}. ${data.prevention}`;
    Speech.speak(text, { language: language === 'en' ? 'en-US' : 'ur-PK' });
  };

  const generateAndShareReport = async () => {
    const report = `
╔════════════════════════════════════════╗
║     🌿 PLANT DIAGNOSIS REPORT 🌿       ║
╠════════════════════════════════════════╣
║ 📅 ${new Date().toLocaleDateString()}
╠════════════════════════════════════════╣
║ 🦠 Disease: ${data.diseaseName}
║ 📊 Confidence: ${prediction.confidence_percentage}
║ ⚠️ Severity: ${data.severity}
╠════════════════════════════════════════╣
║ 💊 TREATMENT
║ ${data.treatment}
╠════════════════════════════════════════╣
║ 🛡️ PREVENTION
║ ${data.prevention}
╠════════════════════════════════════════╣
║ 🧪 ORGANIC: ${data.organic}
║ ⚗️ CHEMICAL: ${data.chemical}
╠════════════════════════════════════════╣
║ 💚 HEALTH SCORE: ${getHealthScore()}/100
╠════════════════════════════════════════╣
║ 🤖 AgriVision AI
╚════════════════════════════════════════╝
    `;
    try {
      await Share.share({ message: report, title: 'Plant Diagnosis Report' });
    } catch {
      Alert.alert('Error', 'Failed to share report');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1DB95420', 'transparent']} style={styles.headerGradient} />

      {/* Header with language toggle */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DIAGNOSIS RESULTS</Text>
        <TouchableOpacity
          onPress={() => setLanguage(language === 'en' ? 'ur' : 'en')}
          style={styles.langBtn}
        >
          <Globe color="#1DB954" size={20} />
          <Text style={styles.langText}>{language === 'en' ? 'اردو' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image + Badge */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <View
              style={[
                styles.diseaseBadge,
                { backgroundColor: getSeverityColor() + '20', borderColor: getSeverityColor() },
              ]}
            >
              {getSeverityIcon()}
              <Text style={[styles.diseaseBadgeText, { color: getSeverityColor() }]}>
                {data.diseaseName}
              </Text>
            </View>
          </View>
        )}

        {/* Confidence */}
        <View style={styles.confidenceSection}>
          <Text style={styles.confidenceLabel}>AI Confidence Score</Text>
          <Text style={styles.confidenceValue}>{prediction.confidence_percentage}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: prediction.confidence_percentage }]} />
          </View>
        </View>

        {/* Cards */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💊 Treatment</Text>
          <Text style={styles.cardText}>{data.treatment}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛡️ Prevention</Text>
          <Text style={styles.cardText}>{data.prevention}</Text>
        </View>

        <View style={styles.rowCards}>
          <View style={[styles.halfCard, { backgroundColor: '#1A1A1A' }]}>
            <Text style={styles.cardTitle}>🌱 Organic</Text>
            <Text style={styles.cardText}>{data.organic}</Text>
          </View>
          <View style={[styles.halfCard, { backgroundColor: '#1A1A1A' }]}>
            <Text style={styles.cardTitle}>⚗️ Chemical</Text>
            <Text style={styles.cardText}>{data.chemical}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚠️ Severity</Text>
          <Text style={styles.cardText}>{data.severity}</Text>
        </View>

        {/* Health Score */}
        <View style={[styles.scoreCard, { borderColor: getSeverityColor() }]}>
          <Text style={styles.scoreTitle}>🌿 Plant Health Score</Text>
          <Text style={[styles.scoreValue, { color: getSeverityColor() }]}>
            {getHealthScore()}/100
          </Text>
          <View style={styles.healthProgressBar}>
            <View
              style={[
                styles.healthProgressFill,
                { width: `${getHealthScore()}%`, backgroundColor: getSeverityColor() },
              ]}
            />
          </View>
          <Text style={styles.scoreSubtext}>
            {prediction.disease === 'Healthy'
              ? 'Your plant looks great! Continue good care.'
              : `Act now — ${data.treatment.split('.')[0]}.`}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.voiceBtn} onPress={handleTextToSpeech}>
            <Volume2 color="black" size={20} />
            <Text style={styles.voiceBtnText}>🔊 Read</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={generateAndShareReport}>
            <Share2 color="#1DB954" size={20} />
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={() => router.push('/history')}>
            <Download color="black" size={20} />
            <Text style={styles.saveBtnText}>History</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          ⚕️ AI diagnosis is guidance only. Consult an expert for critical decisions.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 150 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  langText: { color: '#1DB954', fontSize: 12, fontWeight: 'bold' },

  scrollContent: { paddingBottom: 40 },
  imageContainer: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  previewImage: { width: '100%', height: 250, resizeMode: 'cover' },
  diseaseBadge: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  diseaseBadgeText: { fontSize: 16, fontWeight: 'bold' },

  confidenceSection: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  confidenceLabel: { color: '#888', fontSize: 14, marginBottom: 5 },
  confidenceValue: { color: '#1DB954', fontSize: 36, fontWeight: 'bold', marginBottom: 10 },
  progressBar: { height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#1DB954', borderRadius: 3 },

  card: {
    backgroundColor: '#161616',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardText: { color: '#CCC', fontSize: 14, lineHeight: 20 },

  rowCards: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginBottom: 12 },
  halfCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#222' },

  scoreCard: {
    backgroundColor: '#161616',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
  },
  scoreTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  scoreValue: { fontSize: 42, fontWeight: 'bold', marginBottom: 10 },
  healthProgressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  healthProgressFill: { height: '100%', borderRadius: 4 },
  scoreSubtext: { color: '#AAA', fontSize: 12, lineHeight: 16 },

  buttonRow: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginBottom: 20 },
  voiceBtn: {
    flex: 1,
    backgroundColor: '#1DB954',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  voiceBtnText: { color: 'black', fontWeight: 'bold' },
  shareBtn: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  shareBtnText: { color: '#1DB954', fontWeight: 'bold' },
  saveBtn: {
    flex: 1,
    backgroundColor: '#1DB954',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: { color: 'black', fontWeight: 'bold' },

  disclaimer: {
    textAlign: 'center',
    color: '#555',
    fontSize: 11,
    marginHorizontal: 20,
    marginTop: 10,
  },
});
