import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Wind, MapPin, ShieldCheck, AlertTriangle, Droplets, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import axios from 'axios';
import ScreenHero from '../components/ScreenHero';
import { Colors } from '../theme/colors';
import { screenStyles } from '../theme/screenStyles';
import { API_BASE_URL } from '../config';

const EnvironmentScreen = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weather`, {
        params: { lat, lon },
      });
      setWeatherData(response.data);
      setError(null);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to fetch local weather data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied — showing default region.');
        fetchWeather(18.5204, 73.8567);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      fetchWeather(location.coords.latitude, location.coords.longitude);
    } catch (err) {
      setError('Could not get your location — showing default region.');
      fetchWeather(18.5204, 73.8567);
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
        <Text style={styles.loadingText}>Syncing hyper-local weather…</Text>
      </View>
    );
  }

  const { temp, condition, humidity, wind, city, alerts } = weatherData || {};

  return (
    <ScrollView
      style={screenStyles.screen}
      contentContainerStyle={screenStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        badgeIcon={<Sparkles size={12} color="#7dd3fc" />}
        badgeText="HYPER-LOCAL MONITORING"
        title="Alerts"
        subtitle="Precision field weather, active risk alerts, and crop cycle projections."
        stats={[
          { value: alerts?.length || 0, label: 'Active' },
          { value: `${Math.round(temp || 0)}°`, label: 'Now' },
          { value: 'Live', label: 'GPS' },
        ]}
        gradient="blue"
      />

      <View style={screenStyles.body}>
        {error ? (
          <View style={styles.errorBanner}>
            <AlertTriangle size={16} color="#b45309" />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        <LinearGradient
          colors={['#0ea5e9', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.weatherCard}
        >
          <View style={styles.weatherHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.locationRow}>
                <MapPin size={14} color="rgba(255,255,255,0.85)" />
                <Text style={styles.locationLabel}>Current field</Text>
              </View>
              <Text style={styles.cityText}>{city || 'Your location'}</Text>
            </View>
            <Text style={styles.weatherEmoji}>
              {condition?.includes('Rain') ? '🌧️' : condition?.includes('Cloud') ? '☁️' : '☀️'}
            </Text>
          </View>

          <View style={styles.mainWeather}>
            <Text style={styles.tempText}>{Math.round(temp || 0)}°</Text>
            <Text style={styles.conditionText}>{condition || '—'}</Text>
          </View>

          <View style={styles.weatherStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Humidity</Text>
              <View style={styles.statValueRow}>
                <Droplets size={16} color="#fff" />
                <Text style={styles.statValue}>{humidity ?? '—'}%</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Wind</Text>
              <View style={styles.statValueRow}>
                <Wind size={16} color="#fff" />
                <Text style={styles.statValue}>{wind ?? '—'} km/h</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Air</Text>
              <View style={styles.statValueRow}>
                <ShieldCheck size={16} color="#fff" />
                <Text style={styles.statValue}>Good</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <Text style={screenStyles.sectionEyebrow}>Field alerts</Text>
        <Text style={screenStyles.sectionTitle}>Active warnings</Text>

        {alerts && alerts.length > 0 ? (
          alerts.map((alert, index) => {
            const isDanger = alert.type === 'danger';
            const isWarning = alert.type === 'warning';
            const accent = isDanger ? Colors.danger : isWarning ? '#d97706' : Colors.info;
            const bg = isDanger ? '#fef2f2' : isWarning ? '#fffbeb' : '#eff6ff';

            return (
              <View
                key={index}
                style={[styles.alertCard, { borderLeftColor: accent, backgroundColor: bg }]}
              >
                <View style={styles.alertHeader}>
                  <View style={[styles.alertBadge, { backgroundColor: `${accent}18` }]}>
                    {isDanger ? <AlertTriangle size={12} color={accent} /> : null}
                    <Text style={[styles.alertBadgeText, { color: accent }]}>
                      {alert.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.alertTime}>Real-time</Text>
                </View>
                <Text style={styles.alertMsg}>{alert.msg}</Text>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyAlerts}>
            <ShieldCheck size={36} color={Colors.primary} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyTitle}>All clear</Text>
            <Text style={styles.emptyText}>Optimal farming conditions detected in your area.</Text>
          </View>
        )}

        <Text style={[screenStyles.sectionEyebrow, { marginTop: 20 }]}>Planning</Text>
        <Text style={screenStyles.sectionTitle}>Crop cycle projections</Text>
        <View style={styles.projectionGrid}>
          {[
            { m: 'Prep', icon: '🚜', status: 'Ready' },
            { m: 'Sow', icon: '🌱', status: 'Optimal' },
            { m: 'Grow', icon: '🌿', status: '30 days' },
            { m: 'Harvest', icon: '🌾', status: '90 days' },
          ].map((item) => (
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 14,
    color: Colors.textMuted,
    fontSize: 14,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
  },
  weatherCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  cityText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  weatherEmoji: {
    fontSize: 48,
  },
  mainWeather: {
    marginTop: 24,
  },
  tempText: {
    color: '#fff',
    fontSize: 56,
    fontWeight: '800',
  },
  conditionText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 4,
  },
  weatherStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  alertCard: {
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
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
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  alertTime: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  alertMsg: {
    fontSize: 14,
    color: Colors.textMain,
    lineHeight: 21,
    fontWeight: '500',
  },
  emptyAlerts: {
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMain,
    marginTop: 12,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  projectionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  projectionItem: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projectionIcon: {
    fontSize: 22,
    marginVertical: 8,
  },
  projectionStatus: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
});

export default EnvironmentScreen;
