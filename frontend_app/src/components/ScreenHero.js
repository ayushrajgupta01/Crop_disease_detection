import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut, LogIn, User } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const HERO_GRADIENTS = {
  green: ['#064e3b', '#022c22'],
  blue: ['#0c4a6e', '#082f49'],
  forest: ['#14532d', '#052e16'],
  earth: ['#78350f', '#451a03'],
};

export default function ScreenHero({
  authOnly = false,
  badgeIcon,
  badgeText,
  title,
  subtitle,
  stats = [],
  gradient = 'green',
  gradientColors,
}) {
  const insets = useSafeAreaInsets();
  const { isLoggedIn, user, logout, exitGuest } = useContext(AuthContext);
  const colors = gradientColors || HERO_GRADIENTS[gradient] || HERO_GRADIENTS.green;

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to sign out of CropGuard?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleGuestSignIn = () => {
    Alert.alert(
      'Join CropGuard',
      'Sign up or log in to unlock all features.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login / Sign Up', onPress: exitGuest },
      ]
    );
  };

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.hero,
        authOnly && styles.heroAuthOnly,
        { paddingTop: insets.top + (authOnly ? 8 : 12) },
      ]}
    >
      <View style={[styles.heroTopBar, authOnly && styles.heroTopBarAuthOnly]}>
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

      {!authOnly && badgeText ? (
        <View style={styles.heroBadge}>
          {badgeIcon}
          <Text style={styles.heroBadgeText}>{badgeText}</Text>
        </View>
      ) : null}

      {!authOnly && title ? <Text style={styles.heroTitle}>{title}</Text> : null}
      {!authOnly && subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}

      {!authOnly && stats.length > 0 ? (
        <View style={styles.heroStats}>
          {stats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              {index > 0 ? <View style={styles.heroStatDivider} /> : null}
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{stat.value}</Text>
                <Text style={styles.heroStatLabel}>{stat.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroAuthOnly: {
    paddingBottom: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    minHeight: 36,
  },
  heroTopBarAuthOnly: {
    marginBottom: 0,
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
});
