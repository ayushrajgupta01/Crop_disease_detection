import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { CloudRain, Wind, MapPin, ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import axios from 'axios';
import { Colors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const EnvironmentScreen = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weather`, {
        params: { lat, lon }
      });
      setWeatherData(response.data);
      setError(null);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError("Failed to fetch local weather data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        fetchWeather(18.5204, 73.8567); // Fallback
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      fetchWeather(location.coords.latitude, location.coords.longitude);
    } catch (err) {
      setError('Could not get your location');
      fetchWeather(18.5204, 73.8567); // Fallback
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    getLocation();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Syncing with local satellites...</Text>
      </View>
    );
  }

  const { temp, condition, humidity, wind, city, alerts } = weatherData || {};

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Environment & Alerts</Text>
        <Text style={styles.subtitle}>Precision monitoring via hyper-local GPS data.</Text>
        {error && <Text style={styles.errorText}>⚠️ {error}</Text>}
      </View>

      <LinearGradient
        colors={['#0ea5e9', '#2563eb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.weatherCard}
      >
        <View style={styles.weatherHeader}>
          <View>
            <View style={styles.locationContainer}>
              <MapPin size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.locationLabel}>Current Field</Text>
            </View>
            <Text style={styles.cityText}>{city || "Your Location"}</Text>
          </View>
          <Text style={styles.weatherIcon}>
            {condition?.includes('Rain') ? '🌧️' : condition?.includes('Cloud') ? '☁️' : '☀️'}
          </Text>
        </View>
        
        <View style={styles.mainWeather}>
          <Text style={styles.tempText}>{Math.round(temp)}°</Text>
          <Text style={styles.conditionText}>{condition}</Text>
        </View>

        <View style={styles.weatherStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Humidity</Text>
            <View style={styles.statValueRow}>
              <CloudRain size={16} color="white" />
              <Text style={styles.statValue}>{humidity}%</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Wind Speed</Text>
            <View style={styles.statValueRow}>
              <Wind size={16} color="white" />
              <Text style={styles.statValue}>{wind} km/h</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Air Quality</Text>
            <View style={styles.statValueRow}>
              <ShieldCheck size={16} color="white" />
              <Text style={styles.statValue}>Good</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Field Alerts</Text>
        {alerts && alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <View key={index} style={[
              styles.alertCard, 
              { borderLeftColor: alert.type === 'danger' ? Colors.danger : alert.type === 'warning' ? Colors.warning : Colors.info },
              { backgroundColor: alert.type === 'danger' ? '#fef2f2' : alert.type === 'warning' ? '#fffbeb' : '#eff6ff' }
            ]}>
              <View style={styles.alertHeader}>
                <View style={styles.alertBadge}>
                  {alert.type === 'danger' ? <AlertTriangle size={12} color={Colors.danger} /> : null}
                  <Text style={[
                    styles.alertBadgeText, 
                    { color: alert.type === 'danger' ? Colors.danger : alert.type === 'warning' ? '#d97706' : Colors.info }
                  ]}>{alert.type.toUpperCase()}</Text>
                </View>
                <Text style={styles.alertTime}>Real-time</Text>
              </View>
              <Text style={styles.alertMsg}>{alert.msg}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyAlerts}>
            <ShieldCheck size={32} color={Colors.primary} style={{ opacity: 0.5, marginBottom: 8 }} />
            <Text style={styles.emptyText}>All clear. Optimal farming conditions detected.</Text>
          </View>
        )}
      </View>

      <View style={[styles.section, { marginBottom: 30 }]}>
        <Text style={styles.sectionTitle}>Crop Cycle Projections</Text>
        <View style={styles.projectionGrid}>
          {[
            { m: 'Preparation', icon: '🚜', status: 'Ready' },
            { m: 'Sowing', icon: '🌱', status: 'Optimal' },
            { m: 'Growth', icon: '🌿', status: 'In 30 days' },
            { m: 'Harvest', icon: '🌾', status: 'In 90 days' }
          ].map(item => (
            <View key={item.m} style={styles.projectionItem}>
              <Text style={styles.projectionLabel}>{item.m}</Text>
              <Text style={styles.projectionIcon}>{item.icon}</Text>
              <Text style={styles.projectionStatus}>{item.status}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 15,
    color: Colors.textMuted,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textMain,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 5,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 8,
  },
  weatherCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 24,
    padding: 20,
    elevation: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'start',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.8,
    marginBottom: 4,
  },
  locationLabel: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  cityText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  weatherIcon: {
    fontSize: 48,
  },
  mainWeather: {
    marginTop: 30,
  },
  tempText: {
    color: 'white',
    fontSize: 64,
    fontWeight: 'bold',
  },
  conditionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  weatherStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textMain,
    marginBottom: 15,
  },
  alertCard: {
    padding: 15,
    borderRadius: 16,
    borderLeftWidth: 6,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  alertTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  alertMsg: {
    fontSize: 14,
    color: Colors.textMain,
    fontWeight: '500',
    lineHeight: 20,
  },
  emptyAlerts: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  projectionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectionItem: {
    width: '23%',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projectionLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  projectionIcon: {
    fontSize: 24,
    marginVertical: 8,
  },
  projectionStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary,
  }
});

export default EnvironmentScreen;
