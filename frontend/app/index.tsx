import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "ai",
      text: "Upload a plant image or describe symptoms for disease analysis.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const inputAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    if (showAnalysis) {
      // Slide up animation
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Hide input
      Animated.timing(inputAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
      inputAnim.setValue(0);
    }
  }, [showAnalysis]);

  const handleSend = () => {
    if (!input && !image) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      text: input,
      image: image,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setImage(null);

    // Show processing and then analysis
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setAnalysisResult({
        plant: "Tomato Plant",
        disease: "Early Blight",
        confidence: "94%",
        description: "Fungal disease affecting leaves, stems, and fruits",
        treatment: "Apply copper-based fungicide every 7-10 days",
        prevention: "Water at base, improve air circulation",
      });
      setShowAnalysis(true);

      // Add AI response to chat
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        text: `Analysis complete: ${analysisResult?.plant || "Plant"} - ${analysisResult?.disease || "Disease detected"}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1500);
  };

  const closeAnalysis = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(inputAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAnalysis(false);
      setAnalysisResult(null);
    });
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.messageWrapper}>
        <View
          style={[
            styles.messageContainer,
            item.type === "user" ? styles.userMessage : styles.aiMessage,
          ]}
        >
          {item.image && (
            <View style={styles.chatImageContainer}>
              <Image source={{ uri: item.image }} style={styles.chatImage} />
              <View style={styles.imageBadge}>
                <Text style={styles.imageBadgeText}>📷 Image</Text>
              </View>
            </View>
          )}
          {item.text ? (
            <Text style={styles.messageText}>{item.text}</Text>
          ) : null}
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>

        {item.type === "ai" && (
          <View style={styles.aiIndicator}>
            <Text style={styles.aiIndicatorText}>🌿 AI Analysis</Text>
          </View>
        )}
      </View>
    );
  };

  const slideUpStyle = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [400, 0],
        }),
      },
    ],
    opacity: slideAnim,
  };

  const inputHideStyle = {
    transform: [
      {
        translateY: inputAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 100],
        }),
      },
    ],
    opacity: inputAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🌱</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>PlantGuard</Text>
            <Text style={styles.headerSubtitle}>Disease Detection System</Text>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>94%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>500+</Text>
            <Text style={styles.statLabel}>Plants</Text>
          </View>
        </View>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeIcon}>🌿</Text>
            <Text style={styles.welcomeTitle}>Welcome to PlantGuard</Text>
            <Text style={styles.welcomeText}>
              Upload plant images or describe symptoms to detect diseases and
              get treatment recommendations.
            </Text>
          </View>
        }
      />

      {/* Image Preview with Leaf-themed Border */}
      {image && (
        <Animated.View style={[styles.imagePreviewContainer, inputHideStyle]}>
          <View style={styles.previewWrapper}>
            <View style={styles.leafBorder}>
              <View style={styles.leafCornerTL}>🍃</View>
              <View style={styles.leafCornerTR}>🍃</View>
              <View style={styles.leafCornerBL}>🍃</View>
              <View style={styles.leafCornerBR}>🍃</View>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImage(null)}
              >
                <Text style={styles.removeImageIcon}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.previewLabel}>Ready for Analysis</Text>
          </View>
        </Animated.View>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <View style={styles.processingContainer}>
          <View style={styles.processingContent}>
            <Text style={styles.processingIcon}>🔍</Text>
            <Text style={styles.processingText}>Analyzing Plant...</Text>
            <View style={styles.loadingDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>
      )}

      {/* Slide-up Analysis Result */}
      {showAnalysis && analysisResult && (
        <Animated.View style={[styles.analysisContainer, slideUpStyle]}>
          <View style={styles.analysisHeader}>
            <Text style={styles.analysisTitle}>Analysis Complete</Text>
            <TouchableOpacity
              onPress={closeAnalysis}
              style={styles.closeButton}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.plantIconContainer}>
                <Text style={styles.plantIcon}>🍅</Text>
              </View>
              <View style={styles.resultTitleContainer}>
                <Text style={styles.plantName}>{analysisResult.plant}</Text>
                <Text style={styles.diseaseName}>{analysisResult.disease}</Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {analysisResult.confidence} Confident
                </Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>📋 Description</Text>
              <Text style={styles.detailText}>
                {analysisResult.description}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>💊 Treatment</Text>
              <Text style={styles.detailText}>{analysisResult.treatment}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>🛡️ Prevention</Text>
              <Text style={styles.detailText}>{analysisResult.prevention}</Text>
            </View>

            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>💾 Save Report</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Input Area */}
      <Animated.View style={[styles.inputWrapper, inputHideStyle]}>
        {!image && (
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={() =>
              setImage(
                "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop",
              )
            }
          >
            <Text style={styles.imageUploadIcon}>📷</Text>
            <Text style={styles.imageUploadText}>Add Photo</Text>
          </TouchableOpacity>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Describe symptoms or ask about plant health..."
            placeholderTextColor="#A3B18A"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              !input && !image && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!input && !image}
          >
            <Text style={styles.sendIcon}>🌱</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputHint}>
          Press Enter or tap the leaf icon to analyze
        </Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F7F3",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#2D5A27",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#A3B18A",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    fontSize: 24,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
  },
  headerSubtitle: {
    color: "#D4E2D4",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 15,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  statLabel: {
    color: "#D4E2D4",
    fontSize: 10,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  welcomeCard: {
    backgroundColor: "#E9F5DB",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D4E2D4",
    alignItems: "center",
  },
  welcomeIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  welcomeTitle: {
    color: "#2D5A27",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeText: {
    color: "#588157",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  messageWrapper: {
    marginBottom: 12,
  },
  messageContainer: {
    padding: 16,
    borderRadius: 20,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#A3B18A",
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E9F5DB",
  },
  messageText: {
    color: "#344E41",
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    color: "#588157",
    fontSize: 11,
    marginTop: 6,
    textAlign: "right",
  },
  aiIndicator: {
    marginTop: 4,
    marginLeft: 10,
  },
  aiIndicatorText: {
    color: "#588157",
    fontSize: 11,
    fontWeight: "500",
  },
  chatImageContainer: {
    marginBottom: 12,
    position: "relative",
  },
  chatImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    resizeMode: "cover",
  },
  imageBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(45, 90, 39, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
  },
  imagePreviewContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  previewWrapper: {
    alignItems: "center",
  },
  leafBorder: {
    borderWidth: 2,
    borderColor: "#A3B18A",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 10,
    position: "relative",
    marginBottom: 8,
  },
  leafCornerTL: {
    position: "absolute",
    top: -10,
    left: -10,
    fontSize: 16,
  },
  leafCornerTR: {
    position: "absolute",
    top: -10,
    right: -10,
    fontSize: 16,
    transform: [{ rotate: "90deg" }],
  },
  leafCornerBL: {
    position: "absolute",
    bottom: -10,
    left: -10,
    fontSize: 16,
    transform: [{ rotate: "-90deg" }],
  },
  leafCornerBR: {
    position: "absolute",
    bottom: -10,
    right: -10,
    fontSize: 16,
    transform: [{ rotate: "180deg" }],
  },
  previewImage: {
    width: 100,
    height: 75,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  removeImageIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 20,
  },
  previewLabel: {
    color: "#588157",
    fontSize: 12,
    fontWeight: "500",
  },
  processingContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  processingContent: {
    backgroundColor: "rgba(45, 90, 39, 0.95)",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  processingIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  processingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#A3B18A",
  },
  analysisContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  analysisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  analysisTitle: {
    color: "#2D5A27",
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F9F7F3",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    fontSize: 20,
    color: "#2D5A27",
    fontWeight: "bold",
  },
  resultCard: {
    backgroundColor: "#F9F7F3",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E9F5DB",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  plantIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E9F5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  plantIcon: {
    fontSize: 24,
  },
  resultTitleContainer: {
    flex: 1,
  },
  plantName: {
    color: "#2D5A27",
    fontSize: 18,
    fontWeight: "600",
  },
  diseaseName: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  confidenceBadge: {
    backgroundColor: "#A3B18A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  detailSection: {
    marginBottom: 16,
  },
  detailTitle: {
    color: "#2D5A27",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  detailText: {
    color: "#588157",
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: "#2D5A27",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  inputWrapper: {
    padding: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E9F5DB",
  },
  imageUploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    alignSelf: "flex-start",
    backgroundColor: "#E9F5DB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  imageUploadIcon: {
    fontSize: 20,
  },
  imageUploadText: {
    color: "#2D5A27",
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#F9F7F3",
    color: "#344E41",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    fontSize: 15,
    maxHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#D4E2D4",
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#2D5A27",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#D4E2D4",
    opacity: 0.6,
  },
  sendIcon: {
    fontSize: 24,
  },
  inputHint: {
    color: "#A3B18A",
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
});
