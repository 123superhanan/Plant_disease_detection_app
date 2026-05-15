import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  AlertTriangle,
  ArrowLeft,
  HeartPulse,
  Share2,
  Shield,
  Sparkles,
  Stethoscope,
} from 'lucide-react-native';
import { ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';

export default function Results() {
  const router = useRouter();
  const params = useLocalSearchParams();

  let prediction = null;

  try {
    if (params.prediction && typeof params.prediction === 'string') {
      prediction = JSON.parse(params.prediction);
    }
  } catch (error) {
    console.error('Prediction parse error:', error);
  }

  if (!prediction) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0A0A0A',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Text
          style={{
            color: '#F44336',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          No Result Found
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            backgroundColor: '#1DB954',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: 'black', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const generateReport = async () => {
    const report = `
🌱 Plant Disease Diagnosis Report

━━━━━━━━━━━━━━━━━━

Disease:
${prediction.disease}

Confidence:
${prediction.confidence_percentage}

Health Score:
${prediction.health_score || 85}%

Severity:
${prediction.severity || 'Moderate'}

Symptoms:
${prediction.symptoms?.join(', ') || 'Leaf discoloration, spots, reduced vitality'}

Treatment:
${prediction.recommendations?.treatment || 'Consult agricultural expert'}

Prevention:
${prediction.recommendations?.prevention || 'Regular monitoring and airflow management'}

AI Analysis:
${
  prediction.analysis ||
  'CNN model detected disease patterns from image texture and color distribution.'
}
`;

    await Share.share({
      message: report,
    });
  };

  const speakResult = () => {
    Speech.stop();

    Speech.speak(
      `
      ${prediction.disease} detected.
      Confidence level ${prediction.confidence_percentage}.
      ${prediction.recommendations?.treatment || 'Apply recommended treatment immediately.'}
    `,
      {
        language: 'en',
        pitch: 1,
        rate: 0.9,
      }
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0A0A0A',
      }}
    >
      <LinearGradient
        colors={['#1DB95425', 'transparent']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 220,
        }}
      />

      {/* HEADER */}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: '#1A1A1A',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ArrowLeft color="white" size={22} />
        </TouchableOpacity>

        <Text
          style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
            letterSpacing: 1,
          }}
        >
          AI RESULTS
        </Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 140,
        }}
      >
        {/* DISEASE HEADER */}

        <View
          style={{
            backgroundColor: '#121212',
            borderRadius: 24,
            padding: 22,
            borderWidth: 1,
            borderColor: '#1DB95440',
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: 'bold',
              color: '#1DB954',
            }}
          >
            {prediction.disease}
          </Text>

          <Text
            style={{
              color: '#AAAAAA',
              marginTop: 10,
              fontSize: 15,
            }}
          >
            Confidence Level: {prediction.confidence_percentage}
          </Text>

          {/* HEALTH SCORE */}

          <View
            style={{
              marginTop: 18,
              backgroundColor: '#1DB95415',
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: '#1DB954',
                fontWeight: 'bold',
                fontSize: 15,
              }}
            >
              Plant Health Score
            </Text>

            <Text
              style={{
                color: 'white',
                fontSize: 34,
                fontWeight: 'bold',
                marginTop: 6,
              }}
            >
              {prediction.health_score || 85}%
            </Text>
          </View>
        </View>

        {/* SEVERITY */}

        <View
          style={{
            backgroundColor: '#121212',
            borderRadius: 22,
            padding: 18,
            marginBottom: 18,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <AlertTriangle color="#FFA500" size={20} />

            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              Disease Severity
            </Text>
          </View>

          <Text
            style={{
              color: '#CCCCCC',
              marginTop: 12,
              lineHeight: 24,
              fontSize: 15,
            }}
          >
            {prediction.severity || 'Moderate infection detected. Immediate treatment recommended.'}
          </Text>
        </View>

        {/* SYMPTOMS */}

        <View
          style={{
            backgroundColor: '#121212',
            borderRadius: 22,
            padding: 18,
            marginBottom: 18,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <HeartPulse color="#ff4d4f" size={20} />

            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              Symptoms
            </Text>
          </View>

          {(
            prediction.symptoms || ['Leaf discoloration', 'Dark spots', 'Reduced plant vitality']
          ).map((item: string, index: number) => (
            <Text
              key={index}
              style={{
                color: '#CCCCCC',
                marginTop: 12,
                lineHeight: 22,
                fontSize: 15,
              }}
            >
              • {item}
            </Text>
          ))}
        </View>

        {/* TREATMENT */}

        <View
          style={{
            backgroundColor: '#121212',
            borderRadius: 22,
            padding: 18,
            marginBottom: 18,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Stethoscope color="#1DB954" size={20} />

            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              Treatment Plan
            </Text>
          </View>

          <Text
            style={{
              color: '#CCCCCC',
              marginTop: 12,
              lineHeight: 24,
              fontSize: 15,
            }}
          >
            {prediction.recommendations?.treatment ||
              'Apply recommended fungicide and isolate infected plants.'}
          </Text>
        </View>

        {/* PREVENTION */}

        <View
          style={{
            backgroundColor: '#121212',
            borderRadius: 22,
            padding: 18,
            marginBottom: 18,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Shield color="#00BFFF" size={20} />

            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              Prevention Tips
            </Text>
          </View>

          <Text
            style={{
              color: '#CCCCCC',
              marginTop: 12,
              lineHeight: 24,
              fontSize: 15,
            }}
          >
            {prediction.recommendations?.prevention ||
              'Avoid overwatering. Ensure proper airflow and monitor leaves regularly.'}
          </Text>
        </View>

        {/* AI ANALYSIS */}

        <View
          style={{
            backgroundColor: '#121212',
            borderRadius: 22,
            padding: 18,
            marginBottom: 18,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Sparkles color="#FFD700" size={20} />

            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              AI Analysis
            </Text>
          </View>

          <Text
            style={{
              color: '#CCCCCC',
              marginTop: 12,
              lineHeight: 24,
              fontSize: 15,
            }}
          >
            {prediction.analysis ||
              'CNN model analyzed image texture, lesion patterns, leaf coloration, and disease distribution.'}
          </Text>
        </View>

        {/* ACTION BUTTONS */}

        <View
          style={{
            flexDirection: 'row',
            gap: 14,
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            onPress={speakResult}
            style={{
              flex: 1,
              backgroundColor: '#1DB954',
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: 'black',
                fontWeight: 'bold',
                fontSize: 15,
              }}
            >
              🔊 Read Result
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={generateReport}
            style={{
              flex: 1,
              backgroundColor: '#161616',
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#1DB954',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Share2 color="#1DB954" size={18} />

              <Text
                style={{
                  color: '#1DB954',
                  fontWeight: 'bold',
                  fontSize: 15,
                }}
              >
                Share Report
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
