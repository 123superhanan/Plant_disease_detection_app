import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  BarChart3,
  Cpu,
  TrendingUp,
  Zap,
  Activity,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function Modelstats() {
  const router = useRouter();

  const metrics = {
    accuracy: 93.33,
    precision: 94.2,
    recall: 93.8,
    f1Score: 93.5,
    inferenceTime: 0.47, // seconds
    totalImages: 1532,
    classes: 3,
  };

  const classPerformance = [
    { name: 'Healthy', precision: 90.0, recall: 90.0, f1: 90.0, samples: 126 },
    { name: 'Powdery', precision: 95.0, recall: 95.0, f1: 95.0, samples: 1051 },
    { name: 'Rust', precision: 95.0, recall: 95.0, f1: 95.0, samples: 126 },
  ];

  const confusionMatrix = [
    [18, 2, 0],
    [1, 19, 0],
    [1, 0, 19],
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1DB95420', 'transparent']} style={styles.headerGradient} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MODEL STATISTICS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Metric */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Overall Accuracy</Text>
          <Text style={styles.heroValue}>{metrics.accuracy}%</Text>
          <View style={styles.heroBar}>
            <View style={[styles.heroBarFill, { width: `${metrics.accuracy}%` }]} />
          </View>
          <Text style={styles.heroSubtext}>Validated on 306 test images</Text>
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Cpu color="#1DB954" size={24} />
            <Text style={styles.metricValue}>{metrics.precision}%</Text>
            <Text style={styles.metricLabel}>Precision</Text>
          </View>
          <View style={styles.metricCard}>
            <Activity color="#1DB954" size={24} />
            <Text style={styles.metricValue}>{metrics.recall}%</Text>
            <Text style={styles.metricLabel}>Recall</Text>
          </View>
          <View style={styles.metricCard}>
            <TrendingUp color="#1DB954" size={24} />
            <Text style={styles.metricValue}>{metrics.f1Score}%</Text>
            <Text style={styles.metricLabel}>F1 Score</Text>
          </View>
          <View style={styles.metricCard}>
            <Zap color="#1DB954" size={24} />
            <Text style={styles.metricValue}>{metrics.inferenceTime}s</Text>
            <Text style={styles.metricLabel}>Inference Time</Text>
          </View>
        </View>

        {/* Class-wise Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Per-Class Performance</Text>
          {classPerformance.map((cls, idx) => (
            <View key={idx} style={styles.classCard}>
              <View style={styles.classHeader}>
                <Text style={styles.className}>{cls.name}</Text>
                <View
                  style={[
                    styles.classBadge,
                    {
                      backgroundColor:
                        cls.name === 'Healthy'
                          ? '#4CAF5020'
                          : cls.name === 'Powdery'
                            ? '#FF980020'
                            : '#F4433620',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.classBadgeText,
                      {
                        color:
                          cls.name === 'Healthy'
                            ? '#4CAF50'
                            : cls.name === 'Powdery'
                              ? '#FF9800'
                              : '#F44336',
                      },
                    ]}
                  >
                    {cls.samples} samples
                  </Text>
                </View>
              </View>
              <View style={styles.metricsRow}>
                <View style={styles.metricsItem}>
                  <Text style={styles.metricsItemLabel}>Precision</Text>
                  <Text style={styles.metricsItemValue}>{cls.precision}%</Text>
                </View>
                <View style={styles.metricsItem}>
                  <Text style={styles.metricsItemLabel}>Recall</Text>
                  <Text style={styles.metricsItemValue}>{cls.recall}%</Text>
                </View>
                <View style={styles.metricsItem}>
                  <Text style={styles.metricsItemLabel}>F1 Score</Text>
                  <Text style={styles.metricsItemValue}>{cls.f1}%</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Confusion Matrix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Confusion Matrix</Text>
          <Text style={styles.matrixSubtitle}>Actual → Predicted</Text>

          <View style={styles.matrixContainer}>
            {/* Header Row */}
            <View style={styles.matrixRow}>
              <View style={styles.matrixCornerCell} />
              {classPerformance.map((cls, idx) => (
                <View key={`header-${idx}`} style={styles.matrixHeaderCell}>
                  <Text style={styles.matrixHeaderText}>{cls.name}</Text>
                </View>
              ))}
            </View>

            {/* Data Rows */}
            {classPerformance.map((cls, rowIdx) => (
              <View key={`row-${rowIdx}`} style={styles.matrixRow}>
                <View style={styles.matrixRowLabelCell}>
                  <Text style={styles.matrixRowLabelText}>{cls.name}</Text>
                </View>
                {confusionMatrix[rowIdx].map((value, colIdx) => (
                  <View
                    key={`cell-${rowIdx}-${colIdx}`}
                    style={[styles.matrixCell, rowIdx === colIdx && styles.matrixCellCorrect]}
                  >
                    <Text
                      style={[
                        styles.matrixCellText,
                        rowIdx === colIdx && styles.matrixCellTextCorrect,
                      ]}
                    >
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.matrixLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#1DB954' }]} />
              <Text style={styles.legendText}>Correct predictions</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>Misclassifications</Text>
            </View>
          </View>
        </View>

        {/* Architecture Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 Model Architecture</Text>
          <View style={styles.archCard}>
            <View style={styles.archRow}>
              <Text style={styles.archLabel}>Type</Text>
              <Text style={styles.archValue}>CNN (Convolutional Neural Network)</Text>
            </View>
            <View style={styles.archRow}>
              <Text style={styles.archLabel}>Layers</Text>
              <Text style={styles.archValue}>Conv2D (4) + MaxPooling (4) + Dense (2)</Text>
            </View>
            <View style={styles.archRow}>
              <Text style={styles.archLabel}>Input Size</Text>
              <Text style={styles.archValue}>128 x 128 x 3</Text>
            </View>
            <View style={styles.archRow}>
              <Text style={styles.archLabel}>Activation</Text>
              <Text style={styles.archValue}>ReLU + Softmax</Text>
            </View>
            <View style={styles.archRow}>
              <Text style={styles.archLabel}>Framework</Text>
              <Text style={styles.archValue}>TensorFlow 2.x / Keras</Text>
            </View>
          </View>
        </View>

        {/* Training Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Training Details</Text>
          <View style={styles.trainingCard}>
            <View style={styles.trainingRow}>
              <CheckCircle color="#1DB954" size={18} />
              <Text style={styles.trainingText}>Total Training Images: 1,226</Text>
            </View>
            <View style={styles.trainingRow}>
              <CheckCircle color="#1DB954" size={18} />
              <Text style={styles.trainingText}>Validation Images: 306</Text>
            </View>
            <View style={styles.trainingRow}>
              <CheckCircle color="#1DB954" size={18} />
              <Text style={styles.trainingText}>Test Images: 150</Text>
            </View>
            <View style={styles.trainingRow}>
              <CheckCircle color="#1DB954" size={18} />
              <Text style={styles.trainingText}>Epochs: 20 (Early Stopping at 15)</Text>
            </View>
            <View style={styles.trainingRow}>
              <CheckCircle color="#1DB954" size={18} />
              <Text style={styles.trainingText}>
                Data Augmentation: Flip, Rotation, Zoom, Contrast
              </Text>
            </View>
          </View>
        </View>
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
  scrollContent: { padding: 20, paddingBottom: 40 },

  heroCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1DB95430',
  },
  heroTitle: {
    color: '#888',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroValue: { color: '#1DB954', fontSize: 56, fontWeight: 'bold', marginBottom: 16 },
  heroBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  heroBarFill: { height: '100%', backgroundColor: '#1DB954', borderRadius: 4 },
  heroSubtext: { color: '#666', fontSize: 12 },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  metricCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  metricValue: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  metricLabel: { color: '#888', fontSize: 12, marginTop: 4 },

  section: { marginBottom: 24 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },

  classCard: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  className: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  classBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  classBadgeText: { fontSize: 11, fontWeight: '600' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  metricsItem: { alignItems: 'center' },
  metricsItemLabel: { color: '#666', fontSize: 11, marginBottom: 4 },
  metricsItemValue: { color: '#1DB954', fontSize: 16, fontWeight: 'bold' },

  matrixContainer: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
  },
  matrixRow: { flexDirection: 'row' },
  matrixCornerCell: { width: 70, padding: 10 },
  matrixHeaderCell: { flex: 1, padding: 10, alignItems: 'center' },
  matrixHeaderText: { color: '#1DB954', fontSize: 11, fontWeight: 'bold', textAlign: 'center' },
  matrixRowLabelCell: { width: 70, justifyContent: 'center' },
  matrixRowLabelText: { color: '#888', fontSize: 11, textAlign: 'center' },
  matrixCell: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    margin: 2,
    borderRadius: 6,
  },
  matrixCellCorrect: { backgroundColor: '#1DB95420' },
  matrixCellText: { color: '#CCC', fontSize: 14, fontWeight: 'bold' },
  matrixCellTextCorrect: { color: '#1DB954' },
  matrixSubtitle: { color: '#666', fontSize: 12, textAlign: 'center', marginBottom: 12 },

  matrixLegend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: '#888', fontSize: 11 },

  archCard: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  archRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  archLabel: { color: '#888', fontSize: 14 },
  archValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },

  trainingCard: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  trainingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  trainingText: { color: '#CCC', fontSize: 14, flex: 1 },
});
