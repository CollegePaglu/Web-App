import React, { useState } from 'react';
import { View, StyleSheet, Platform, Modal } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, lightTheme } from '../../../src/theme/colors';
import { CreatePostModal } from '../../../src/features/community/components/CreatePostModal';
import { CustomTabBar } from '../../../src/components/navigation/CustomTabBar';
import { useThemeColors } from '@/context/ThemeContext';
import { useConfig } from '@/context/ConfigContext';
import { ComingSoonModal } from '@/components/modals/ComingSoonModal';

// Custom tab bar icon
interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  size?: number;
  isBig?: boolean; // For Campusmart and Lazzipeep
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused, size = 24, isBig = false }) => (
  <View style={[styles.iconContainer, isBig && styles.bigIconContainer]}>
    <Ionicons
      name={name}
      size={isBig ? 28 : size}
      color={focused ? colors.primary : colors.secondary}
    />
    {focused && <View style={[styles.activeIndicator, isBig && styles.bigIndicator]} />}
  </View>
);

// Diamond Add Button
const AddButton = () => {
  const colors = useThemeColors();
  return (
    <View style={styles.diamondContainer}>
      <View style={[styles.diamond, { backgroundColor: colors.primary, shadowColor: colors.primary }]} />
      <Ionicons name="add" size={28} color={colors.textInverse} style={styles.addIcon} />
    </View>
  );
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { features } = useConfig();
  const [comingSoonModal, setComingSoonModal] = useState({ visible: false, title: '', message: '' });

  const handlePostCreated = () => {
    router.replace('/(main)/(tabs)/home');
  };

  const handleComingSoonTableClose = () => {
    setComingSoonModal({ ...comingSoonModal, visible: false });
  };

  const handleProtectedTabPress = (e: any, featureEnabled: boolean, featureName: string) => {
    if (!featureEnabled) {
      e.preventDefault();
      setComingSoonModal({
        visible: true,
        title: `${featureName} Coming Soon`,
        message: `The ${featureName} feature is currently disabled or under maintenance. Please check back later!`,
      });
    }
  };

  return (
    <>
      <Tabs
        initialRouteName="home"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
        }}
        tabBar={(props) => {
          // Hide CustomTabBar for campusmart and lazzypeeps routes
          const routeName = props.state.routes[props.state.index]?.name;
          // If we block navigation, we won't be on these routes, so this logic is fine
          if (routeName === 'campusmart' || routeName === 'lazzypeeps') {
            return null;
          }
          return <CustomTabBar {...props} />;
        }}
      >
        {/* 1. CampusMart (Assignments) */}
        <Tabs.Screen
          name="campusmart"
          options={{
            title: 'CampusMart',
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name={focused ? 'storefront' : 'storefront-outline'}
                focused={focused}
                isBig={true}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => handleProtectedTabPress(e, features.assignmentEnabled, 'Assignments'),
          }}
        />

        {/* 2. Home */}
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name={focused ? 'home' : 'home-outline'}
                focused={focused}
              />
            ),
          }}
        />

        {/* 3. Create (Middle) */}
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ focused }) => (
              <AddButton />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowCreateModal(true);
            },
          }}
        />

        {/* 4. Updates */}
        <Tabs.Screen
          name="updates"
          options={{
            title: 'Updates',
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name={focused ? 'megaphone' : 'megaphone-outline'}
                focused={focused}
              />
            ),
          }}
        />

        {/* 5. Lazzypeeps */}
        <Tabs.Screen
          name="lazzypeeps"
          options={{
            title: 'Lazzypeeps',
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name={focused ? 'newspaper' : 'newspaper-outline'}
                focused={focused}
                isBig={true}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => handleProtectedTabPress(e, features.lazyPeepsEnabled, 'LazyPeeps'),
          }}
        />

        {/* Profile - Hidden from navbar, will be in Home header */}
        <Tabs.Screen
          name="profile"
          options={{
            href: null, // Hide from tab bar
          }}
        />
      </Tabs>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      </Modal>

      <ComingSoonModal
        visible={comingSoonModal.visible}
        onClose={handleComingSoonTableClose}
        title={comingSoonModal.title}
        message={comingSoonModal.message}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  bigIconContainer: {
    marginTop: -4, // Slight lift
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  bigIndicator: {
    width: 20, // Rectangular indicator
    height: 3,
    borderRadius: 1.5,
  },
  // Diamond Button Styles
  diamondContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20, // Float above
    width: 48,
    height: 48,
  },
  diamond: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    transform: [{ rotate: '45deg' }],
    borderRadius: 8,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addIcon: {
    zIndex: 1,
  },
});
