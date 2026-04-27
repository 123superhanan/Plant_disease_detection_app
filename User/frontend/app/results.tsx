import { useAuth } from '@clerk/clerk-expo/dist/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Droplet,
  Share2,
  Shield,
} from 'lucide-react-native';
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

export default function Results() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getToken } = useAuth();
  const prediction = JSON.parse(params.prediction as string);
  const imageUri = params.imageUri as string;

  const getSeverityColor = () => {
    const disease = prediction.disease;
    if (disease === 'Healthy') return '#4CAF50';
    if (disease === 'Powdery') return '#FF9800';
    if (disease === 'Rust') return '#F44336';
    return '#888';
  };

  const getSeverityIcon = () => {
    const disease = prediction.disease;
    if (disease === 'Healthy') return <CheckCircle color="#4CAF50" size={24} />;
    if (disease === 'Powdery') return <Droplet color="#FF9800" size={24} />;
    if (disease === 'Rust') return <AlertTriangle color="#F44336" size={24} />;
    return <Shield color="#888" size={24} />;
  };

  const getHealthScore = () => {
    if (prediction.disease === 'Healthy') return 95;
    if (prediction.confidence > 0.95) return 20;
    if (prediction.confidence > 0.85) return 35;
    return 50;
  };

  const generateAndShareReport = async () => {
    const report = `
╔════════════════════════════════════════╗
║     🌿 PLANT DIAGNOSIS REPORT 🌿       ║
╠════════════════════════════════════════╣
║ 📅 Date: ${new Date().toLocaleDateString()}
║ 🕐 Time: ${new Date().toLocaleTimeString()}
╠════════════════════════════════════════╣
║ 🔬 DIAGNOSIS RESULTS
╠════════════════════════════════════════╣
║ 🦠 Disease: ${prediction.disease}
║ 📊 Confidence: ${prediction.confidence_percentage}
║ ⚠️ Severity: ${prediction.recommendations?.severity || 'Unknown'}
╠════════════════════════════════════════╣
║ 💊 TREATMENT PLAN
╠════════════════════════════════════════╣
║ ${prediction.recommendations?.treatment}
╠════════════════════════════════════════╣
║ 🛡️ PREVENTION TIPS
╠════════════════════════════════════════╣
║ ${prediction.recommendations?.prevention}
╠════════════════════════════════════════╣
║ 💚 HEALTH SCORE: ${getHealthScore()}/100
╠════════════════════════════════════════╣
║ 🤖 Powered by AgriVision AI
║ 🔗 Scan again to track progress
╚════════════════════════════════════════╝
    `;

    try {
      await Share.share({
        message: report,
        title: '🌿 Plant Diagnosis Report',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share report');
    }
  };

  // const saveToHistory = async () => {
  //   try {
  //     const token = await getToken();

  //     // The backend already saves during detection, but if you want to manually save:
  //     const response = await fetch('http://localhost:5001/api/history/save', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         image_url: imageUri,
  //         disease_detected: prediction.disease,
  //         confidence: prediction.confidence,
  //         prediction: prediction,
  //         health_score: getHealthScore(),
  //         severity_level: prediction.recommendations?.severity || 'Unknown',
  //       }),
  //     });

  //     if (response.ok) {
  //       Alert.alert('✅ Saved', 'Diagnosis saved to your history');
  //     } else {
  //       Alert.alert('⚠️ Error', 'Failed to save to history');
  //     }
  //   } catch (error) {
  //     console.error('Save error:', error);
  //     Alert.alert('Error', 'Could not save to history');
  //   }
  // };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1DB95420', 'transparent']} style={styles.headerGradient} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DIAGNOSIS RESULTS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image Preview */}
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
                {prediction.disease}
              </Text>
            </View>
          </View>
        )}

        {/* Confidence Section */}
        <View style={styles.confidenceSection}>
          <Text style={styles.confidenceLabel}>AI Confidence Score</Text>
          <Text style={styles.confidenceValue}>{prediction.confidence_percentage}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: prediction.confidence_percentage }]} />
          </View>
        </View>

        {/* Recommendations Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Treatment Plan</Text>
          <Text style={styles.cardText}>{prediction.recommendations?.treatment}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}> Prevention Tips</Text>
          <Text style={styles.cardText}>{prediction.recommendations?.prevention}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}> Severity Level</Text>
          <Text style={styles.cardText}>{prediction.recommendations?.severity}</Text>
        </View>

        {/* Health Score Card */}
        <View style={[styles.scoreCard, { borderColor: getSeverityColor() }]}>
          <Text style={styles.scoreTitle}> Plant Health Score</Text>
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
              ? 'Your plant looks great! Continue good care practices.'
              : `Monitor your plant closely. ${prediction.recommendations?.treatment.split('.')[0]}.`}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.shareBtn} onPress={generateAndShareReport}>
            <Share2 color="#1DB954" size={20} />
            <Text style={styles.shareBtnText}>Share Report</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.saveBtn} onPress={saveToHistory}>
            <Download color="black" size={20} />
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity> */}
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          AI diagnosis is for guidance only. Consult an agricultural expert for critical decisions.
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
