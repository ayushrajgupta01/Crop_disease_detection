import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Camera, Bot, CloudRain, Library, Users } from 'lucide-react-native';
import { Colors } from './src/theme/colors';

// Import Real Screens
import DiagnosticsScreen from './src/screens/DiagnosticsScreen';
import AgroBotScreen from './src/screens/AgroBotScreen';
import EnvironmentScreen from './src/screens/EnvironmentScreen';
import LibraryScreen from './src/screens/PlantLibraryScreen';
import CommunityScreen from './src/screens/CommunityScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Diagnostics') {
                return <Camera color={color} size={size} />;
              } else if (route.name === 'AgroBot') {
                return <Bot color={color} size={size} />;
              } else if (route.name === 'Environment') {
                return <CloudRain color={color} size={size} />;
              } else if (route.name === 'Library') {
                return <Library color={color} size={size} />;
              } else if (route.name === 'Community') {
                return <Users color={color} size={size} />;
              }
            },
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.textMuted,
            tabBarStyle: {
              backgroundColor: Colors.white,
              borderTopWidth: 1,
              borderTopColor: Colors.border,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            headerStyle: {
              backgroundColor: Colors.white,
            },
            headerTitleStyle: {
              fontWeight: '700',
              color: Colors.textMain,
            },
          })}
        >
          <Tab.Screen name="Diagnostics" component={DiagnosticsScreen} options={{ title: 'Scan Crop' }} />
          <Tab.Screen name="AgroBot" component={AgroBotScreen} options={{ title: 'AgroBot AI' }} />
          <Tab.Screen name="Environment" component={EnvironmentScreen} options={{ title: 'Alerts' }} />
          <Tab.Screen name="Library" component={LibraryScreen} options={{ title: 'Plant Library' }} />
          <Tab.Screen name="Community" component={CommunityScreen} options={{ title: 'Community' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
