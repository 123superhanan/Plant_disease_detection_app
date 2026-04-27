import { useAuth } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image as ImageIcon, Info, ShieldCheck, X, Zap } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Upload() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Get your actual local IP address (not localhost for physical device)
  const API_URL = 'http://localhost:5001/api/detect';

  // Pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPrediction(null);
      setShowDetails(false);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera access to scan plants.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPrediction(null);
      setShowDetails(false);
    }
  };

  // Upload and Detect
  const handleDetect = async () => {
    if (!image) return;
    setUploading(true);

    try {
      const token = await getToken();
      const formData = new FormData();

      // Get file info
      const uriParts = image.split('/');
      const fileName = uriParts[uriParts.length - 1] || 'photo.jpg';

      // For React Native web, use blob
      if (image.startsWith('blob:')) {
        const blobResponse = await fetch(image);
        const blob = await blobResponse.blob();
        formData.append('file', blob, 'photo.jpg');
      } else {
        // @ts-ignore
        formData.append('file', {
          uri: image,
          name: fileName,
          type: 'image/jpeg',
        });
      }

      console.log('Sending request...');

      const response = await fetch('http://localhost:5001/api/detect', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);

      const text = await response.text();
      console.log('Raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', text);
        throw new Error('Invalid response from server');
      }

      if (response.ok) {
        router.push({
          pathname: '/results',
          params: {
            prediction: JSON.stringify(data), // Pass as string
            imageUri: image,
          },
        });

        Alert.alert('Success', `Detected: ${data.disease || data.disease_name}`);
      } else {
        Alert.alert('Error', data.error || 'Detection failed');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1DB95420', 'transparent']} style={styles.backgroundGlow} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X color="white" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI SCANNER</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('About', 'Upload a clear photo of your plant leaf for AI disease detection')
          }
        >
          <Info color="#555" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {image ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              {prediction && !showDetails && (
                <View style={styles.resultBadge}>
                  <Zap color="#1DB954" size={16} fill="#1DB954" />
                  <Text style={styles.resultText}>{prediction.disease || 'Analyzing...'}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.scanBox}>
                <Zap color="#1DB954" size={40} style={styles.zapIcon} />
                <Text style={styles.emptyText}>Place your plant in the frame</Text>
              </View>
            </View>
          )}

          {/* Prediction Details */}
          {prediction && showDetails && (
            <View style={styles.detailsContainer}>
              <View style={styles.diseaseCard}>
                <Text style={styles.diseaseTitle}>{prediction.disease}</Text>
                <Text style={styles.confidenceText}>
                  Confidence:{' '}
                  {prediction.confidence_percentage ||
                    `${(prediction.confidence * 100).toFixed(1)}%`}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>🌿 Treatment</Text>
                <Text style={styles.sectionText}>
                  {prediction.recommendations?.treatment ||
                    'Apply appropriate fungicide. Remove infected leaves.'}
                </Text>

                <Text style={styles.sectionTitle}>🛡️ Prevention</Text>
                <Text style={styles.sectionText}>
                  {prediction.recommendations?.prevention ||
                    'Improve air circulation. Water at base of plant.'}
                </Text>

                <Text style={styles.sectionTitle}>⚠️ Severity</Text>
                <Text style={styles.sectionText}>
                  {prediction.recommendations?.severity || 'Moderate'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.newScanBtn}
                onPress={() => {
                  setImage(null);
                  setPrediction(null);
                  setShowDetails(false);
                }}
              >
                <Text style={styles.newScanText}>SCAN ANOTHER PLANT</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Controls */}
          {!showDetails && (
            <View style={styles.controls}>
              {!image ? (
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
                    <ImageIcon color="white" size={28} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
                    <View style={styles.captureInner} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.iconBtn}>
                    <ShieldCheck color="#555" size={28} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.retakeBtn} onPress={() => setImage(null)}>
                    <Text style={styles.retakeText}>RETAKE</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.detectBtn, uploading && styles.disabled]}
                    onPress={handleDetect}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator color="black" />
                    ) : (
                      <Text style={styles.detectBtnText}>ANALYZE PLANT</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <Text style={styles.footerHint}>AI results can vary. Verify with an expert.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backgroundGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: { color: 'white', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  emptyContainer: { width: '100%', alignItems: 'center' },
  scanBox: {
    width: width * 0.8,
    height: width * 0.8,
    borderWidth: 2,
    borderColor: '#1DB95430',
    borderRadius: 40,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zapIcon: { marginBottom: 20, opacity: 0.5 },
  emptyText: { color: '#555', fontSize: 16, textAlign: 'center' },

  previewContainer: {
    width: width * 0.85,
    height: width * 1.1,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#111',
    elevation: 10,
    marginBottom: 20,
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  resultBadge: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  resultText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  detailsContainer: {
    width: '100%',
    marginTop: 20,
  },
  diseaseCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  diseaseTitle: {
    color: '#1DB954',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  confidenceText: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  sectionText: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  newScanBtn: {
    backgroundColor: '#1DB954',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  newScanText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
  },

  controls: { width: '100%', paddingVertical: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  iconBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },

  actionRow: { flexDirection: 'row', gap: 15 },
  retakeBtn: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  retakeText: { color: 'white', fontWeight: 'bold' },
  detectBtn: {
    flex: 2,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectBtnText: { color: 'black', fontWeight: '900', letterSpacing: 1 },
  disabled: { opacity: 0.6 },
  footerHint: {
    color: '#444',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
});
