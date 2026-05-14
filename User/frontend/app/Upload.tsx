import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  Camera,
  Image as ImageIcon,
  Info,
  RefreshCw,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

// Use this in your fetch

const { width } = Dimensions.get('window');

export default function Upload() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState('');

  

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
      setErrorModalVisible(false);
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
      setErrorModalVisible(false);
    }
  };

  // Show error modal with appropriate message
  const showError = (message: string, type: string = 'general') => {
    setErrorMessage(message);
    setErrorType(type);
    setErrorModalVisible(true);
  };

  // Upload and Detect
  const handleDetect = async () => {
    if (!image) return;

    setUploading(true);
    setErrorModalVisible(false);

    try {
      const token = await getToken();
      const formData = new FormData();

      const uriParts = image.split('/');
      const fileName = uriParts[uriParts.length - 1] || 'photo.jpg';

      if (image.startsWith('blob:')) {
        const blobResponse = await fetch(image);
        const blob = await blobResponse.blob();
        formData.append('file', blob, 'photo.jpg');
      } else {
        formData.append('file', {
          uri: image,
          name: fileName,
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch('http://localhost:5001/api/detect', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid response from server');
      }

      // ========== HANDLE ALL API VALIDATION ERRORS ==========

      // Case 1: Non-leaf image error
      if (data.error_type === 'leaf' || (data.error && data.error.includes('leaf'))) {
        showError(
          data.suggestion ||
            data.error ||
            "This doesn't appear to be a plant leaf. Please upload a clear photo of a plant leaf.",
          'leaf'
        );
        return;
      }

      // Case 2: Image quality error (blurry, dark, too small)
      if (
        data.error_type === 'quality' ||
        (data.error &&
          (data.error.includes('quality') ||
            data.error.includes('blurry') ||
            data.error.includes('small')))
      ) {
        showError(
          data.suggestion ||
            data.error ||
            'Image quality is poor. Please take a clearer, well-lit photo.',
          'quality'
        );
        return;
      }

      // Case 3: General validation error
      if (!response.ok || data.error) {
        showError(
          data.error || data.suggestion || 'Detection failed. Please try again.',
          data.error_type || 'general'
        );
        return;
      }

      // Case 4: Success - Check if data has required fields
      if (data.success === false) {
        showError(
          data.error || data.suggestion || 'Unable to analyze image. Please try again.',
          data.error_type || 'general'
        );
        return;
      }

      // Case 5: Low confidence warning
      if (data.confidence && data.confidence < 0.6) {
        Alert.alert(
          'Low Confidence',
          `Detection confidence is only ${(data.confidence * 100).toFixed(1)}%. Please upload a clearer image for better results.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Still proceed but show warning
                router.push({
                  pathname: '/results',
                  params: {
                    prediction: JSON.stringify(data),
                    imageUri: image,
                    lowConfidence: 'true',
                  },
                });
              },
            },
          ]
        );
        return;
      }

      // Success - Navigate to results
      router.push({
        pathname: '/results',
        params: {
          prediction: JSON.stringify(data),
          imageUri: image,
        },
      });
    } catch (error: any) {
      console.error('Detection error:', error);

      // Handle network errors
      if (error.message === 'Network request failed') {
        showError('Cannot connect to server. Please check your internet connection.', 'network');
      } else {
        showError('Failed to analyze image. Please try again.', 'server');
      }
    } finally {
      setUploading(false);
    }
  };

  // Reset and try again
  const resetAndTryAgain = () => {
    setImage(null);
    setPrediction(null);
    setShowDetails(false);
    setErrorModalVisible(false);
    setErrorMessage('');
    setErrorType('');
  };

  // Get error icon based on type
  const getErrorIcon = () => {
    switch (errorType) {
      case 'leaf':
        return <AlertCircle color="#FF6B6B" size={48} />;
      case 'quality':
        return <Camera color="#FFB347" size={48} />;
      case 'network':
        return <RefreshCw color="#4ECDC4" size={48} />;
      default:
        return <AlertCircle color="#FF6B6B" size={48} />;
    }
  };

  // Get error title based on type
  const getErrorTitle = () => {
    switch (errorType) {
      case 'leaf':
        return 'Not a Plant Leaf';
      case 'quality':
        return 'Poor Image Quality';
      case 'network':
        return 'Connection Error';
      default:
        return 'Analysis Failed';
    }
  };

  // Get error suggestion based on type
  const getErrorSuggestion = () => {
    switch (errorType) {
      case 'leaf':
        return 'Try uploading a close-up photo of a single plant leaf against a plain background.';
      case 'quality':
        return 'Ensure good lighting, hold the camera steady, and make sure the leaf is in focus.';
      case 'network':
        return 'Check your internet connection and try again.';
      default:
        return 'Please try again with a clear photo of a plant leaf.';
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

      {/* Error Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>{getErrorIcon()}</View>
            <Text style={styles.modalTitle}>{getErrorTitle()}</Text>
            <Text style={styles.modalMessage}>{errorMessage || 'Something went wrong'}</Text>

            <View style={styles.suggestionBox}>
              <Text style={styles.suggestionTitle}>💡 Suggestion</Text>
              <Text style={styles.suggestionText}>{getErrorSuggestion()}</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setErrorModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Dismiss</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalRetryBtn} onPress={resetAndTryAgain}>
                <Text style={styles.modalRetryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                <Text style={styles.emptySubText}>Take a clear photo of a single leaf</Text>
              </View>
            </View>
          )}

          {/* Prediction Details with Validation Info */}
          {prediction && showDetails && (
            <View style={styles.detailsContainer}>
              <View style={styles.diseaseCard}>
                <Text style={styles.diseaseTitle}>{prediction.disease}</Text>
                <Text style={styles.confidenceText}>
                  Confidence:{' '}
                  {prediction.confidence_percentage ||
                    `${(prediction.confidence * 100).toFixed(1)}%`}
                </Text>

                {/* Show validation info if available */}
                {prediction.validation && (
                  <View style={styles.validationBadge}>
                    <ShieldCheck color="#1DB954" size={16} />
                    <Text style={styles.validationText}>
                      {prediction.validation.leaf_check || 'Leaf verified'}
                    </Text>
                  </View>
                )}

                {/* Damage severity if available */}
                {prediction.validation?.damage_severity && (
                  <View style={styles.damageBadge}>
                    <Text style={styles.damageText}>
                      Damage: {prediction.validation.damage_severity} (
                      {prediction.validation.damage_percentage}%)
                    </Text>
                  </View>
                )}

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>🌿 Treatment</Text>
                <Text style={styles.sectionText}>
                  {prediction.details?.treatment ||
                    prediction.recommendations?.treatment ||
                    'Apply appropriate fungicide. Remove infected leaves.'}
                </Text>

                <Text style={styles.sectionTitle}>🛡️ Prevention</Text>
                <Text style={styles.sectionText}>
                  {prediction.details?.prevention ||
                    prediction.recommendations?.prevention ||
                    'Improve air circulation. Water at base of plant.'}
                </Text>

                <Text style={styles.sectionTitle}>⚠️ Severity</Text>
                <Text style={styles.sectionText}>
                  {prediction.validation?.damage_severity ||
                    prediction.details?.severity ||
                    prediction.recommendations?.severity ||
                    'Moderate'}
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
                  <TouchableOpacity style={styles.retakeBtn} onPress={resetAndTryAgain}>
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
  emptySubText: { color: '#333', fontSize: 12, textAlign: 'center', marginTop: 8 },

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
  validationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1DB95420',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  validationText: {
    color: '#1DB954',
    fontSize: 12,
  },
  damageBadge: {
    backgroundColor: '#FFB34720',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  damageText: {
    color: '#FFB347',
    fontSize: 12,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    width: width * 0.85,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  modalIcon: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    color: '#CCC',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  suggestionBox: {
    backgroundColor: '#1DB95410',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#1DB954',
  },
  suggestionTitle: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionText: {
    color: '#AAA',
    fontSize: 13,
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#AAA',
    fontSize: 14,
    fontWeight: '600',
  },
  modalRetryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1DB954',
    alignItems: 'center',
  },
  modalRetryText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
