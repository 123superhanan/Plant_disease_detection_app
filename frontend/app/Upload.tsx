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
      setPrediction(null); // Reset prediction on new image
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
    }
  };

  // Upload and Detect
  const handleDetect = async () => {
    if (!image) return;
    setUploading(true);

    try {
      const token = await getToken();
      const formData = new FormData();

      // Constructing file data
      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1];

      // @ts-ignore
      formData.append('file', {
        uri: image,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });

      const response = await fetch('http://your-ip-address:5001/api/detect', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setPrediction(data);

      // Option: Navigate to a detailed results page
      // router.push({ pathname: '/results', params: data });
    } catch (error) {
      console.error(error);
      Alert.alert('Detection Failed', 'Make sure your backend is running.');
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
        <TouchableOpacity>
          <Info color="#555" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {image ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            {prediction && (
              <View style={styles.resultBadge}>
                <Zap color="#1DB954" size={16} fill="#1DB954" />
                <Text style={styles.resultText}>{prediction.disease_name || 'Healthy'}</Text>
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

        {/* Action Controls */}
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
      </View>

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
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },

  // Empty State
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

  // Preview State
  previewContainer: {
    width: width * 0.85,
    height: width * 1.1,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#111',
    elevation: 10,
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

  // Controls
  controls: { width: '100%', paddingVertical: 40 },
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
    marginBottom: 30,
    paddingHorizontal: 40,
  },
});
