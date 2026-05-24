import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Animated
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Camera, Bot, CloudRain, Library, Users, LogOut, Shield, MapPin, User, LogIn, Newspaper } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from './src/theme/colors';
import { API_BASE_URL } from './src/config';
import axios from 'axios';

// Import Tab Screens
import DiagnosticsScreen from './src/screens/DiagnosticsScreen';
import AgroBotScreen from './src/screens/AgroBotScreen';
import EnvironmentScreen from './src/screens/EnvironmentScreen';
import LibraryScreen from './src/screens/PlantLibraryScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import AgriNewsScreen from './src/screens/AgriNewsScreen';

// Import Auth Context
import { AuthContext } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();

const showAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 0) {
      const hasCancel = buttons.some(btn => btn.style === 'cancel' || btn.text.toLowerCase() === 'cancel');
      const actionButton = buttons.find(btn => btn.style !== 'cancel' && btn.text.toLowerCase() !== 'cancel');

      if (hasCancel && actionButton) {
        const confirmed = window.confirm(`${title}\n\n${message}`);
        if (confirmed && actionButton.onPress) {
          actionButton.onPress();
        } else {
          const cancelBtn = buttons.find(btn => btn.style === 'cancel' || btn.text.toLowerCase() === 'cancel');
          if (cancelBtn && cancelBtn.onPress) {
            cancelBtn.onPress();
          }
        }
      } else {
        window.alert(`${title}\n\n${message}`);
        if (buttons[0] && buttons[0].onPress) {
          buttons[0].onPress();
        }
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

function MainAppContent({ initialTab, setContinueAsGuest, setIsLoggedIn }) {
  const insets = useSafeAreaInsets();
  const { isLoggedIn, user, logout } = React.useContext(AuthContext);

  // Calculate bottom tab styles using safe area insets
  const tabBottomPadding = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 16 : 8);
  const tabBarHeight = (Platform.OS === 'android' ? 68 : 60) + (insets.bottom > 0 ? insets.bottom - 8 : 0);

  return (
    <Tab.Navigator
      initialRouteName={initialTab}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Diagnostics') return <Camera color={color} size={size} />;
          if (route.name === 'AgroBot') return <Bot color={color} size={size} />;
          if (route.name === 'AgriNews') return <Newspaper color={color} size={size} />;
          if (route.name === 'Environment') return <CloudRain color={color} size={size} />;
          if (route.name === 'Library') return <Library color={color} size={size} />;
          if (route.name === 'Community') return <Users color={color} size={size} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: tabBarHeight,
          paddingBottom: tabBottomPadding,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: Colors.white,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: Colors.textMain,
        },
        headerRight: () => (
          isLoggedIn ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
              <Text style={{ marginRight: 8, fontSize: 12, fontWeight: 'bold', color: Colors.primaryDark }}>
                👤 {user?.username}
              </Text>
              <TouchableOpacity onPress={logout}>
                <LogOut size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                showAlert(
                  'Join CropGuard',
                  'Unlock all features by signing up or logging in.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login / Sign Up', onPress: () => { setContinueAsGuest(false); setIsLoggedIn(false); } }
                  ]
                );
              }}
              style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}
            >
              <Text style={{ color: Colors.primaryDark, fontWeight: 'bold', fontSize: 11, marginRight: 4 }}>Sign In</Text>
              <LogIn size={14} color={Colors.primaryDark} />
            </TouchableOpacity>
          )
        )
      })}
    >
      <Tab.Screen
        name="Diagnostics"
        component={DiagnosticsScreen}
        options={{ title: 'Scan Crop', headerShown: false }}
      />
      <Tab.Screen name="AgroBot" component={AgroBotScreen} options={{ title: 'AgroBot AI', headerShown: false }} />
      <Tab.Screen name="AgriNews" component={AgriNewsScreen} options={{ title: 'AgriNews', headerShown: false }} />
      <Tab.Screen name="Environment" component={EnvironmentScreen} options={{ title: 'Alerts', headerShown: false }} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ title: 'Plant Library', headerShown: false }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ title: 'Community', headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function App() {
  // Global Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [continueAsGuest, setContinueAsGuest] = useState(false);
  const [initialTab, setInitialTab] = useState('Diagnostics');

  // Landing Page Local UI States
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  // Global Auth Actions
  const login = (userData, userToken) => {
    setIsLoggedIn(true);
    setUser(userData);
    setToken(userToken);
    setContinueAsGuest(false);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken('');
    setContinueAsGuest(false);
  };

  const exitGuest = () => {
    setContinueAsGuest(false);
    setIsLoggedIn(false);
  };

  const enterAsGuestWithScreen = (screenName) => {
    setInitialTab(screenName);
    setContinueAsGuest(true);
  };

  // Header modal trigger for guest login
  const [headerAuthVisible, setHeaderAuthVisible] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Animated scan laser loop for landing page scanner banner
  const scanAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: false,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [scanAnim]);

  const scanLineTop = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['5%', '70%'],
  });

  const handleLandingAuthSubmit = async () => {
    if (authMode === 'login') {
      if (!emailOrUsername || !password) {
        showAlert('Validation Error', 'Please fill in all fields.');
        return;
      }
    } else {
      if (!username || !email || !password) {
        showAlert('Validation Error', 'Please fill in username, email, and password.');
        return;
      }
    }

    setLoading(true);
    const endpoint = authMode === 'login' ? 'login' : 'signup';
    const payload = authMode === 'login'
      ? { emailOrUsername, password }
      : { username, email, password, location };

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/${endpoint}`, payload);
      if (response.data && response.data.token) {
        login(response.data.user, response.data.token);

        // Reset local fields
        setEmailOrUsername('');
        setUsername('');
        setEmail('');
        setPassword('');
        setLocation('');

        showAlert('Welcome!', `Logged in as ${response.data.user.username}`);
      }
    } catch (error) {
      console.error('Auth error:', error);
      const errorMsg = error.response?.data?.error || 'Authentication failed. Please try again.';
      showAlert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Render Landing Screen if not logged in and not guest
  if (!isLoggedIn && !continueAsGuest) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <LinearGradient
          colors={['#064e3b', '#022c22']}
          style={{ flex: 1 }}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Pinned Header Section */}
            <SafeAreaView edges={['top', 'left', 'right']} style={styles.fixedHeader}>
              <View style={styles.headerInner}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Shield size={24} color="#10b981" />
                  <Text style={styles.brandLogoText}>CropGuard Pro</Text>
                </View>
                <TouchableOpacity 
                  style={styles.navSignInBtn} 
                  onPress={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.navSignInBtnText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            {/* Scrollable Content */}
            <ScrollView 
              contentContainerStyle={styles.scrollContainer} 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >

              {/* NEXT-GEN Badge */}
              <View style={styles.badgeCapsule}>
                <Text style={styles.badgeCapsuleText}>NEXT-GEN AGRONOMY</Text>
              </View>

              {/* Hero Section */}
              <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>Precision Agriculture at Your Fingertips</Text>
                <Text style={styles.heroSubtitle}>
                  Empowering global agriculture with AI-driven diagnostics, expert chatbot support, and a collaborative network of farmers.
                </Text>
                
                {/* AI Scanner Visual Banner */}
                <View style={styles.scannerVisualContainer}>
                  <Image 
                    source={require('./assets/scanner_plant.png')} 
                    style={styles.scannerImage}
                    resizeMode="cover"
                  />
                  {/* Viewfinder Target Corners */}
                  <View style={[styles.targetCorner, { top: 15, left: 15, borderLeftWidth: 3, borderTopWidth: 3 }]} />
                  <View style={[styles.targetCorner, { top: 15, right: 15, borderRightWidth: 3, borderTopWidth: 3 }]} />
                  <View style={[styles.targetCorner, { bottom: 15, left: 15, borderLeftWidth: 3, borderBottomWidth: 3 }]} />
                  <View style={[styles.targetCorner, { bottom: 15, right: 15, borderRightWidth: 3, borderBottomWidth: 3 }]} />
                  
                  {/* Glassmorphic Scanning Bar */}
                  <Animated.View style={[styles.scanLaserLine, { top: scanLineTop }]} />
                </View>

                <TouchableOpacity 
                  style={styles.heroCtaBtn} 
                  onPress={() => enterAsGuestWithScreen('Diagnostics')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.heroCtaBtnText}>Start Leaf Scan  →</Text>
                </TouchableOpacity>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>98.4%</Text>
                  <Text style={styles.statLabel}>ACCURACY</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>15k+</Text>
                  <Text style={styles.statLabel}>FARMERS</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>24/7</Text>
                  <Text style={styles.statLabel}>AGROBOT</Text>
                </View>
              </View>

              {/* Intelligent Pillars Section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Intelligent Pillars of Growth</Text>
                <Text style={styles.sectionSubtitle}>
                  Our platform combines advanced machine learning with human expertise to ensure your harvest is smart and resilient.
                </Text>
              </View>

              <View style={styles.featuresGrid}>
                {/* AI Leaf Scanner */}
                <TouchableOpacity 
                  style={styles.featureCardMain} 
                  onPress={() => enterAsGuestWithScreen('Diagnostics')}
                  activeOpacity={0.9}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.featureCardEmoji}>🔍</Text>
                    <Text style={styles.featureCardTitle}>AI Leaf Scanner</Text>
                    <Text style={styles.featureCardDesc}>Identify pests, fungi, and nutrient deficiencies with 98% accuracy in under a minute.</Text>
                    <Text style={styles.featureCardBadge}>✓ Instant analysis</Text>
                  </View>
                  <View style={styles.featureCardMockImage}>
                    <Text style={{ fontSize: 48 }}>🍃</Text>
                  </View>
                </TouchableOpacity>

                {/* AgroBot AI */}
                <TouchableOpacity 
                  style={styles.featureCardDark} 
                  onPress={() => enterAsGuestWithScreen('AgroBot')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.featureCardEmoji}>🤖</Text>
                  <Text style={styles.featureCardTitleDark}>AgroBot Support</Text>
                  <Text style={styles.featureCardDescDark}>Multilingual chatbot answering soil, crop, and pesticide queries customized to your region.</Text>
                  <View style={styles.featureCardBtn}>
                    <Text style={styles.featureCardBtnText}>Open AgroBot</Text>
                  </View>
                </TouchableOpacity>

                {/* Farmers Hub */}
                <TouchableOpacity 
                  style={styles.featureCardPastel} 
                  onPress={() => enterAsGuestWithScreen('Community')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.featureCardEmoji}>🤝</Text>
                  <Text style={styles.featureCardTitle}>Farmers Hub</Text>
                  <Text style={styles.featureCardDesc}>A global network to discuss solutions, post updates, and share advice with other peer farmers.</Text>
                </TouchableOpacity>

                {/* Weather Alerts */}
                <TouchableOpacity 
                  style={styles.featureCardGlass} 
                  onPress={() => enterAsGuestWithScreen('Environment')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.featureCardEmoji}>⛅</Text>
                  <Text style={styles.featureCardTitle}>Weather Alerts</Text>
                  <Text style={styles.featureCardDesc}>Real-time agricultural environment recommendations based on local microclimate data.</Text>
                </TouchableOpacity>
              </View>

              {/* Science-Backed Process */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Science-Backed Process</Text>
                <Text style={styles.sectionSubtitle}>
                  Three simple steps to transition from vulnerability to professional crop management.
                </Text>
              </View>

              <View style={styles.stepsContainer}>
                <View style={styles.stepItem}>
                  <View style={styles.stepCircle}><Text style={styles.stepCircleText}>1</Text></View>
                  <Text style={styles.stepHeader}>Scan</Text>
                  <Text style={styles.stepDescription}>Capture clear leaf images via our scanner.</Text>
                </View>
                <View style={styles.stepItem}>
                  <View style={styles.stepCircle}><Text style={styles.stepCircleText}>2</Text></View>
                  <Text style={styles.stepHeader}>Analyze</Text>
                  <Text style={styles.stepDescription}>AI processes patterns against database standards.</Text>
                </View>
                <View style={styles.stepItem}>
                  <View style={styles.stepCircle}><Text style={styles.stepCircleText}>3</Text></View>
                  <Text style={styles.stepHeader}>Resolve</Text>
                  <Text style={styles.stepDescription}>Get localized treatment guides and expert help.</Text>
                </View>
              </View>

              <View style={styles.landingFooter}>
                <Text style={styles.footerText}>© {new Date().getFullYear()} CropGuard Pro. Resilient Harvests.</Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>

        {/* Dynamic Auth Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showAuthModal}
          onRequestClose={() => setShowAuthModal(false)}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowAuthModal(false)} style={styles.modalCloseBtn}>
                    <Text style={styles.modalCloseBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalSubtitle}>
                  {authMode === 'login' ? 'Sign in to access your farmer profile' : 'Register your farm and start analyzing'}
                </Text>

                {authMode === 'login' ? (
                  <View>
                    <TextInput
                      style={styles.input}
                      placeholder="Username or Email"
                      placeholderTextColor="#a0aec0"
                      value={emailOrUsername}
                      onChangeText={setEmailOrUsername}
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#a0aec0"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                ) : (
                  <View>
                    <TextInput
                      style={styles.input}
                      placeholder="Username"
                      placeholderTextColor="#a0aec0"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      placeholderTextColor="#a0aec0"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password (Min 6 chars)"
                      placeholderTextColor="#a0aec0"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Location / State (e.g. Maharashtra)"
                      placeholderTextColor="#a0aec0"
                      value={location}
                      onChangeText={setLocation}
                    />
                  </View>
                )}

                {loading ? (
                  <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 15 }} />
                ) : (
                  <TouchableOpacity style={styles.submitBtn} onPress={handleLandingAuthSubmit}>
                    <Text style={styles.submitBtnText}>
                      {authMode === 'login' ? 'Sign In' : 'Register'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.guestBtn}
                  onPress={() => {
                    setShowAuthModal(false);
                    setContinueAsGuest(true);
                  }}
                >
                  <Text style={styles.guestBtnText}>Explore as Guest</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  style={{ marginTop: 15, paddingVertical: 5 }}
                >
                  <Text style={styles.toggleText}>
                    {authMode === 'login'
                      ? "New to CropGuard? Sign Up"
                      : "Already registered? Sign In"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaProvider>
    );
  }

  // Render Core Bottom Tab Dashboard
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout, exitGuest }}>
        <NavigationContainer>
          <MainAppContent
            initialTab={initialTab}
            setContinueAsGuest={setContinueAsGuest}
            setIsLoggedIn={setIsLoggedIn}
          />
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(2, 44, 34, 0.98)', // Highly opaque deep green matching background
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 120 : 95, // Space to clear the absolute header
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandLogoText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  badgeCapsule: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  badgeCapsuleText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroSection: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    lineHeight: 32,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 18,
    marginBottom: 20,
  },
  heroCtaBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroCtaBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 36,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10b981',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sectionHeader: {
    alignSelf: 'stretch',
    marginBottom: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 16,
  },
  featuresGrid: {
    alignSelf: 'stretch',
    gap: 16,
    marginBottom: 36,
  },
  featureCardMain: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 253, 244, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  featureCardEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  featureCardDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
    marginBottom: 10,
  },
  featureCardBadge: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  featureCardMockImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCardDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 20,
    padding: 16,
  },
  featureCardTitleDark: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  featureCardDescDark: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
    marginBottom: 12,
  },
  featureCardBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  featureCardBtnText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  featureCardPastel: {
    backgroundColor: 'rgba(255, 247, 237, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 237, 213, 0.2)',
    borderRadius: 20,
    padding: 16,
  },
  featureCardGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
  },
  stepsContainer: {
    alignSelf: 'stretch',
    gap: 20,
    marginBottom: 36,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  stepHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    width: 60,
  },
  stepDescription: {
    flex: 1,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 14,
  },
  authCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    marginVertical: 20,
  },
  authCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textMain,
    marginBottom: 5,
  },
  authCardSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 20,
    lineHeight: 16,
  },
  input: {
    height: 48,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 15,
    color: Colors.textMain,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  guestBtn: {
    borderColor: Colors.border,
    borderWidth: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  guestBtnText: {
    color: Colors.textMain,
    fontWeight: 'bold',
    fontSize: 15,
  },
  toggleText: {
    color: Colors.primary,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  landingFooter: {
    marginTop: 20,
    marginBottom: 30,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  navSignInBtn: {
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  navSignInBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textMain,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
    marginBottom: 20,
  },
  scannerVisualContainer: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#0f172a',
  },
  scannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  targetCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'white',
    opacity: 0.85,
  },
  scanLaserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
});
