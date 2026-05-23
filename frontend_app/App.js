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
  Platform
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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
      <Tab.Screen name="Diagnostics" component={DiagnosticsScreen} options={{ title: 'Scan Crop' }} />
      <Tab.Screen name="AgroBot" component={AgroBotScreen} options={{ title: 'AgroBot AI' }} />
      <Tab.Screen name="AgriNews" component={AgriNewsScreen} options={{ title: 'AgriNews' }} />
      <Tab.Screen name="Environment" component={EnvironmentScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ title: 'Plant Library' }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ title: 'Community' }} />
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

  const enterAsGuestWithScreen = (screenName) => {
    setInitialTab(screenName);
    setContinueAsGuest(true);
  };

  // Header modal trigger for guest login
  const [headerAuthVisible, setHeaderAuthVisible] = useState(false);

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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <LinearGradient
              colors={['#065f46', '#0f766e', '#115e59']}
              style={styles.landingContainer}
            >
              {/* Branding Section */}
              <View style={styles.brandContainer}>
                <Shield size={40} color={Colors.primary} />
                <Text style={styles.brandTitle}>CropGuard Pro</Text>
                <Text style={styles.brandSubtitle}>AI Diagnostics & Farmers Network</Text>
              </View>

              {/* Form Card */}
              <View style={styles.authCard}>
                <Text style={styles.authCardTitle}>
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </Text>
                <Text style={styles.authCardSubtitle}>
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
                  onPress={() => setContinueAsGuest(true)}
                >
                  <Text style={styles.guestBtnText}>Explore as Guest</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  style={{ marginTop: 15 }}
                >
                  <Text style={styles.toggleText}>
                    {authMode === 'login'
                      ? "New to CropGuard? Sign Up"
                      : "Already registered? Sign In"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Brief Feature Info */}
              <View style={styles.miniFeatures}>
                <TouchableOpacity onPress={() => enterAsGuestWithScreen('Diagnostics')}>
                  <Text style={styles.featureLabel}>🔍 leaf diagnosis</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => enterAsGuestWithScreen('AgroBot')}>
                  <Text style={styles.featureLabel}>🤖 expert bot</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => enterAsGuestWithScreen('Community')}>
                  <Text style={styles.featureLabel}>🤝 community</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => enterAsGuestWithScreen('Environment')}>
                  <Text style={styles.featureLabel}>⛅ weather</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    );
  }

  // Render Core Bottom Tab Dashboard
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout }}>
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
  landingContainer: {
    flex: 1,
    padding: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  brandSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
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
  miniFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  featureLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontWeight: '600',
  }
});
