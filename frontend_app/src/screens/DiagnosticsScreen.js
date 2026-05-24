import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  RotateCcw,
  Sun,
  Focus,
  ShieldCheck,
  LogOut,
  LogIn,
  User,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STEPS = [
  { id: 1, label: 'Capture', icon: Camera },
  { id: 2, label: 'Analyze', icon: Sparkles },
  { id: 3, label: 'Results', icon: CheckCircle2 },
];

const SCAN_TIPS = [
  { icon: Sun, title: 'Good light', desc: 'Use natural daylight, avoid harsh shadows.' },
  { icon: Focus, title: 'Single leaf', desc: 'Fill the frame with one affected leaf.' },
  { icon: ShieldCheck, title: 'Stay steady', desc: 'Hold still for a sharp, clear photo.' },
];

const LOADING_MESSAGES = [
  'Processing leaf patterns…',
  'Matching against disease database…',
  'Building treatment recommendations…',
];

const formatDiseaseName = (raw) => {
  if (!raw) return 'Unknown condition';
  return raw
    .replace(/___/g, ' · ')
    .replace(/__/g, ' ')
    .replace(/_/g, ' ')
    .trim();
};

const isHealthyCrop = (name) => (name || '').toLowerCase().includes('healthy');

const getConfidenceLevel = (value) => {
  const pct = (value || 0) * 100;
  if (pct >= 85) return { label: 'High confidence', color: '#059669' };
  if (pct >= 65) return { label: 'Moderate confidence', color: '#d97706' };
  return { label: 'Review recommended', color: '#dc2626' };
};

const StepIndicator = ({ currentStep }) => (
  <View style={styles.stepRow}>
    {STEPS.map((step, index) => {
      const Icon = step.icon;
      const isActive = currentStep === step.id;
      const isDone = currentStep > step.id;
      return (
        <View key={step.id} style={styles.stepItemWrap}>
          <View
            style={[
              styles.stepCircle,
              isActive && styles.stepCircleActive,
              isDone && styles.stepCircleDone,
            ]}
          >
            <Icon size={16} color={isActive || isDone ? '#fff' : Colors.textMuted} />
          </View>
          <Text style={[styles.stepLabel, (isActive || isDone) && styles.stepLabelActive]}>
            {step.label}
          </Text>
          {index < STEPS.length - 1 && (
            <View style={[styles.stepConnector, isDone && styles.stepConnectorDone]} />
          )}
        </View>
      );
    })}
  </View>
);

const ViewfinderFrame = ({ children, style }) => (
  <View style={[styles.viewfinder, style]}>
    <View style={[styles.corner, styles.cornerTL]} />
    <View style={[styles.corner, styles.cornerTR]} />
    <View style={[styles.corner, styles.cornerBL]} />
    <View style={[styles.corner, styles.cornerBR]} />
    {children}
  </View>
);

const DiagnosticsScreen = () => {
  const insets = useSafeAreaInsets();
  const { isLoggedIn, user, logout, exitGuest } = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const scanAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const currentStep = result ? 3 : loading ? 2 : image ? 2 : 1;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2200, useNativeDriver: false }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2200, useNativeDriver: false }),
      ])
    ).start();
  }, [scanAnim]);

  useEffect(() => {
    if (result) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [result, fadeAnim]);

  useEffect(() => {
    if (!loading) {
      setLoadingMsgIndex(0);
      return undefined;
    }
    const interval = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  const scanLineTop = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['12%', '78%'],
  });

  const pickImage = async (useCamera = false) => {
    try {
      let pickerResult;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Camera access is needed to scan your crop.');
          return;
        }
        pickerResult = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.85,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Gallery access is needed to upload photos.');
          return;
        }
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.85,
        });
      }

      if (!pickerResult.canceled) {
        setImage(pickerResult.assets[0].uri);
        setResult(null);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Could not select an image. Please try again.');
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: 'upload.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      console.error('Analysis error:', err);
      Alert.alert(
        'Analysis unavailable',
        'Could not reach the ML service. Ensure the backend and ML server are running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setImage(null);
    setResult(null);
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to sign out of CropGuard?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleGuestSignIn = () => {
    Alert.alert(
      'Join CropGuard',
      'Sign up or log in to save scans and unlock all features.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login / Sign Up', onPress: exitGuest },
      ]
    );
  };

  const confidencePct = result ? (result.confidence * 100).toFixed(1) : 0;
  const confidenceMeta = result ? getConfidenceLevel(result.confidence) : null;
  const healthy = result ? isHealthyCrop(result.name) : false;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={['#064e3b', '#022c22']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.heroTopBar}>
          {isLoggedIn ? (
            <>
              <View style={styles.userChip}>
                <User size={14} color="#6ee7b7" />
                <Text style={styles.userChipText} numberOfLines={1}>
                  {user?.username || 'Farmer'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
                accessibilityLabel="Log out"
              >
                <LogOut size={16} color="#fca5a5" />
                <Text style={styles.logoutBtnText}>Log out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={handleGuestSignIn}
              activeOpacity={0.8}
            >
              <LogIn size={14} color="#064e3b" />
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.heroBadge}>
          <Sparkles size={12} color="#6ee7b7" />
          <Text style={styles.heroBadgeText}>AI-POWERED DIAGNOSTICS</Text>
        </View>
        <Text style={styles.heroTitle}>Scan Crop</Text>
        <Text style={styles.heroSubtitle}>
          Detect diseases, pests, and nutrient issues from a single leaf photo in seconds.
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>98%</Text>
            <Text style={styles.heroStatLabel}>Accuracy</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>15+</Text>
            <Text style={styles.heroStatLabel}>Conditions</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{'<60s'}</Text>
            <Text style={styles.heroStatLabel}>Analysis</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <StepIndicator currentStep={currentStep} />

        {/* Capture state */}
        {!image && (
          <>
            <ViewfinderFrame style={styles.captureZone}>
              <TouchableOpacity
                style={styles.captureInner}
                onPress={() => pickImage(true)}
                activeOpacity={0.85}
              >
                <View style={styles.cameraIconWrap}>
                  <Camera size={32} color={Colors.primary} />
                </View>
                <Text style={styles.captureTitle}>Scan with camera</Text>
                <Text style={styles.captureHint}>Point at the affected leaf</Text>
                <Animated.View style={[styles.scanLaser, { top: scanLineTop }]} />
              </TouchableOpacity>
            </ViewfinderFrame>

            <TouchableOpacity
              style={styles.galleryBtn}
              onPress={() => pickImage(false)}
              activeOpacity={0.8}
            >
              <ImageIcon size={20} color={Colors.primaryDark} />
              <Text style={styles.galleryBtnText}>Upload from gallery</Text>
            </TouchableOpacity>

            <Text style={styles.tipsHeading}>For best results</Text>
            <View style={styles.tipsRow}>
              {SCAN_TIPS.map((tip) => {
                const TipIcon = tip.icon;
                return (
                  <View key={tip.title} style={styles.tipCard}>
                    <View style={styles.tipIconWrap}>
                      <TipIcon size={18} color={Colors.primaryDark} />
                    </View>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDesc}>{tip.desc}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Preview & analyze */}
        {image && !result && (
          <View style={styles.previewSection}>
            <ViewfinderFrame style={styles.previewFrame}>
              <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
              {loading && (
                <View style={styles.previewOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.loadingOverlayText}>
                    {LOADING_MESSAGES[loadingMsgIndex]}
                  </Text>
                </View>
              )}
            </ViewfinderFrame>

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={resetScan}
                disabled={loading}
                activeOpacity={0.8}
              >
                <RotateCcw size={18} color={Colors.textMain} />
                <Text style={styles.secondaryBtnText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                onPress={analyzeImage}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={loading ? ['#6b7280', '#4b5563'] : ['#10b981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtnGradient}
                >
                  {loading ? (
                    <Text style={styles.primaryBtnText}>Analyzing…</Text>
                  ) : (
                    <>
                      <Sparkles size={18} color="#fff" />
                      <Text style={styles.primaryBtnText}>Run AI analysis</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Results */}
        {result && (
          <Animated.View style={[styles.resultsSection, { opacity: fadeAnim }]}>
            <View
              style={[
                styles.statusBanner,
                healthy ? styles.statusBannerHealthy : styles.statusBannerAlert,
              ]}
            >
              {healthy ? (
                <Leaf size={22} color="#059669" />
              ) : (
                <AlertTriangle size={22} color="#b45309" />
              )}
              <View style={styles.statusBannerText}>
                <Text style={styles.statusBannerTitle}>
                  {healthy ? 'Plant looks healthy' : 'Condition detected'}
                </Text>
                <Text style={styles.statusBannerSub}>
                  {healthy
                    ? 'Continue routine monitoring and care.'
                    : 'Review treatment steps below promptly.'}
                </Text>
              </View>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultEyebrow}>Detected condition</Text>
              <Text style={styles.diseaseName}>{formatDiseaseName(result.name)}</Text>

              <View style={styles.confidenceBlock}>
                <View style={styles.confidenceHeader}>
                  <Text style={styles.confidenceLabel}>Model confidence</Text>
                  <Text style={[styles.confidencePct, { color: confidenceMeta.color }]}>
                    {confidencePct}%
                  </Text>
                </View>
                <View style={styles.confidenceTrack}>
                  <View
                    style={[
                      styles.confidenceFill,
                      {
                        width: `${Math.min(100, Number(confidencePct))}%`,
                        backgroundColor: confidenceMeta.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.confidenceMeta, { color: confidenceMeta.color }]}>
                  {confidenceMeta.label}
                </Text>
              </View>
            </View>

            <View style={styles.protocolCard}>
              <View style={styles.protocolHeader}>
                <View style={[styles.protocolIcon, { backgroundColor: '#fef3c7' }]}>
                  <AlertTriangle size={18} color="#b45309" />
                </View>
                <Text style={styles.protocolTitle}>Treatment protocol</Text>
              </View>
              <Text style={styles.protocolBody}>{result.treatment}</Text>
            </View>

            <View style={styles.protocolCard}>
              <View style={styles.protocolHeader}>
                <View style={[styles.protocolIcon, { backgroundColor: Colors.primaryLight }]}>
                  <Leaf size={18} color={Colors.primaryDark} />
                </View>
                <Text style={styles.protocolTitle}>Nutrient & fertilizer plan</Text>
              </View>
              <Text style={styles.protocolBody}>{result.fertilizer}</Text>
            </View>

            <TouchableOpacity style={styles.newScanBtn} onPress={resetScan} activeOpacity={0.85}>
              <LinearGradient
                colors={['#064e3b', '#022c22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.newScanGradient}
              >
                <Camera size={18} color="#6ee7b7" />
                <Text style={styles.newScanText}>Scan another leaf</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    minHeight: 36,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(110, 231, 183, 0.25)',
  },
  userChipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#ecfdf5',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.35)',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fecaca',
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
    backgroundColor: '#6ee7b7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  signInBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#064e3b',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6ee7b7',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 21,
    marginTop: 8,
    maxWidth: SCREEN_WIDTH - 48,
  },
  heroStats: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6ee7b7',
  },
  heroStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 4,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  stepItemWrap: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepCircleDone: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  stepLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 6,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: Colors.primaryDark,
  },
  stepConnector: {
    position: 'absolute',
    top: 17,
    left: '55%',
    width: '90%',
    height: 2,
    backgroundColor: Colors.border,
    zIndex: 1,
  },
  stepConnectorDone: {
    backgroundColor: Colors.primaryLight,
  },
  viewfinder: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: Colors.primary,
    zIndex: 10,
  },
  cornerTL: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
  cornerTR: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
  cornerBL: { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },
  captureZone: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 220,
  },
  captureInner: {
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    overflow: 'hidden',
  },
  cameraIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  captureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textMain,
  },
  captureHint: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  scanLaser: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.7,
    shadowColor: Colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
    height: 52,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  galleryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  tipsHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 24,
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tipCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 4,
  },
  tipDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    lineHeight: 14,
  },
  previewSection: {
    marginBottom: 8,
  },
  previewFrame: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  previewImage: {
    width: '100%',
    height: 280,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 44, 34, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingOverlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 14,
    textAlign: 'center',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMain,
  },
  primaryBtn: {
    flex: 1.4,
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryBtnDisabled: {
    opacity: 0.9,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: 16,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  resultsSection: {
    gap: 14,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusBannerHealthy: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  statusBannerAlert: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  statusBannerText: {
    flex: 1,
  },
  statusBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
  },
  statusBannerSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textMain,
    marginTop: 6,
    lineHeight: 28,
  },
  confidenceBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  confidencePct: {
    fontSize: 20,
    fontWeight: '800',
  },
  confidenceTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceMeta: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  protocolCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  protocolIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  protocolTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
  },
  protocolBody: {
    fontSize: 14,
    color: Colors.textMain,
    lineHeight: 22,
  },
  newScanBtn: {
    marginTop: 6,
    borderRadius: 14,
    overflow: 'hidden',
  },
  newScanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
  },
  newScanText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default DiagnosticsScreen;
