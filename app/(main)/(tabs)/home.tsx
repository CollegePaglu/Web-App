import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  Pressable,
  BackHandler,
} from 'react-native';
import { AppImage } from '../../../src/components/ui/AppImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { extendedColors as colors, shadowColors } from '../../../src/theme/colors';
import { fontFamily } from '../../../src/theme/typography';
import { spacing } from '../../../src/theme/spacing';
import { useCurrentUser } from '../../../src/features/auth';
import { apiCircuitBreaker } from '../../../src/utils/circuitBreaker';
import { useTheme, useThemeColors } from '../../../src/context/ThemeContext';
import { ThemeToggle } from '../../../src/components/ui/ThemeToggle';

// Feeds
import { CommunityFeed } from '../../../src/features/community/components/CommunityFeed';

export default function CommunityScreen() {
  const [cbMetrics, setCbMetrics] = React.useState(apiCircuitBreaker.getMetrics());
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { isDark } = useTheme();
  const uiColors = useThemeColors();

  React.useEffect(() => {
    setCbMetrics(apiCircuitBreaker.getMetrics());
    return apiCircuitBreaker.subscribe(() => {
      setCbMetrics(apiCircuitBreaker.getMetrics());
    });
  }, []);

  // Hardware back on Home = exit app (standard Android behavior)
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const handleProfilePress = () => {
    router.push('/(main)/(tabs)/profile');
  };

  const handleResetCircuitBreaker = () => {
    apiCircuitBreaker.reset();
    setCbMetrics(apiCircuitBreaker.getMetrics());
    console.log('🔄 Circuit breaker reset');
  };

  return (
    <View style={[styles.container, { backgroundColor: uiColors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={uiColors.surface}
      />

      {/* Header */}
      <View style={[
        styles.header,
        {
          paddingTop: insets.top + spacing[2],
          backgroundColor: uiColors.surface,
          borderBottomColor: uiColors.border,
        }
      ]}>
        <View style={styles.headerTop}>
          <Text style={[styles.appName, { color: uiColors.primary }]}>CollegePaglu</Text>

          <View style={styles.rightHeaderActions}>
            {/* Theme Toggle Switch */}
            <ThemeToggle />

            {/* Search Button */}
            <Pressable onPress={() => router.push('/(main)/search')} style={styles.searchButton}>
              <Ionicons name="search" size={24} color={uiColors.text} />
            </Pressable>

            {/* Profile Button */}
            <Pressable onPress={handleProfilePress} style={styles.profileButton}>
              {currentUser?.avatar ? (
                <AppImage
                  uri={currentUser.avatar}
                  style={[styles.profileAvatar, { borderColor: uiColors.primary }]}
                  contentFit="cover"
                />
              ) : (
                <View style={[
                  styles.profileAvatarPlaceholder,
                  {
                    backgroundColor: uiColors.surfaceHighlight,
                    borderColor: uiColors.primary
                  }
                ]}>
                  <Ionicons name="person" size={20} color={uiColors.primary} />
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Debug Panel - Circuit Breaker Status */}
        {cbMetrics.state !== 'CLOSED' ? (
          <View style={[styles.debugPanel, { backgroundColor: uiColors.surfaceHighlight, borderTopColor: uiColors.border }]}>
            <View style={styles.debugContent}>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor: cbMetrics.state === 'OPEN' ? '#9b2c2c' :
                    cbMetrics.state === 'HALF_OPEN' ? '#b8860b' : '#4b5444'
                }
              ]}>
                <Text style={styles.statusText}>
                  {cbMetrics.state === 'OPEN' ? '🔴 Backend Down' :
                    cbMetrics.state === 'HALF_OPEN' ? '🟡 Testing...' : '🟢 OK'}
                </Text>
              </View>
              <Text style={[styles.debugText, { color: uiColors.textSecondary }]}>
                Failures: {cbMetrics.failureCount}/5
              </Text>
            </View>
            {cbMetrics.state === 'OPEN' ? (
              <Pressable
                onPress={handleResetCircuitBreaker}
                style={[styles.resetButton, { backgroundColor: uiColors.primary }]}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <CommunityFeed />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    shadowColor: shadowColors.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Space between theme toggle and profile
  },
  appName: {
    fontSize: 28,
    fontFamily: fontFamily.heading,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  searchButton: {
    padding: 4,
  },
  profileButton: {
    padding: 2,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  profileAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    borderWidth: 2,
    borderColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  debugPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#faf8f6',
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginTop: spacing[2],
  },
  debugContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
  },
  resetButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
