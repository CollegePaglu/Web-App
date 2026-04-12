/**
 * CustomTabBar - Neumorphic Design with Center-Connected Flags
 * 
 * Premium navbar: 4 icons + center FAB with waving flags
 * World-class UI/UX implementation
 */

import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager, DeviceEventEmitter } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Video, ResizeMode } from 'expo-av'; // Removed as per user request

import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { HangingBanner } from './HangingBanner';
import { extendedColors as colors } from '@/theme/colors';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { useThemeColors } from '@/context/ThemeContext';

/** Must match listener in CommunityFeed (scroll to top + refresh on double-tap Home). */
export const HOME_TAB_DOUBLE_TAP_EVENT = 'HOME_TAB_DOUBLE_TAP';

const HOME_DOUBLE_TAP_MS = 450;

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
    state,
    descriptors,
    navigation,
}) => {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const lastHomePressAt = useRef(0);

    // Filter out hidden tabs (profile) and create tab
    const visibleRoutes = state.routes.filter((route, index) => {
        const { options } = descriptors[route.key];
        // Explicitly exclude profile and create tabs
        if (route.name === 'profile' || route.name === 'create') {
            return false;
        }
        return options.tabBarButton !== null && (options as any).href !== null;
    });

    const dynamicStyles = {
        navbarBackground: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.borderHighlight, // Subtle shadow in dark mode
        },
        videoWrapper: (isFocused: boolean) => ({
            backgroundColor: isFocused ? colors.primary + '15' : colors.surfaceHighlight, // 50 opacity hex roughly
            borderColor: isFocused ? colors.primary : colors.border,
        }),
    };

    return (
        <View
            style={[
                styles.container,
                {
                    paddingBottom: insets.bottom,
                },
            ]}
        >
            {/* Neumorphic Navbar Container */}
            <View style={styles.navbarWrapper}>
                {/* Simple Flat Navbar Background */}
                <View style={[styles.navbarBackground, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {/* Center FAB */}
                    <View style={styles.centerFabContainer}>
                        {/* Neumorphic Shadow Wrapper */}
                        <View style={[styles.neumorphicWrapper, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                            <TouchableOpacity
                                style={styles.fabButton}
                                onPress={() => {
                                    const createRoute = state.routes.find(r => r.name === 'create');
                                    if (createRoute) {
                                        const event = navigation.emit({
                                            type: 'tabPress',
                                            target: createRoute.key,
                                            canPreventDefault: true,
                                        });

                                        if (!event.defaultPrevented) {
                                            navigation.navigate(createRoute.name);
                                        }
                                    }
                                }}
                                activeOpacity={0.85}
                            >
                                <View style={styles.fabInner}>
                                    {/* Plus icon */}
                                    <View style={styles.plusIcon}>
                                        <View style={[styles.plusHorizontal, { backgroundColor: colors.textInverse || '#fcfdfb' }]} />
                                        <View style={[styles.plusVertical, { backgroundColor: colors.textInverse || '#fcfdfb' }]} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tab Icons Container */}
                    <View style={styles.tabBarContainer}>
                        {visibleRoutes.map((route, visibleIndex) => {
                            const routeIndex = state.routes.findIndex(r => r.key === route.key);
                            const { options } = descriptors[route.key];
                            const isFocused = state.index === routeIndex;

                            const onPress = () => {
                                const event = navigation.emit({
                                    type: 'tabPress',
                                    target: route.key,
                                    canPreventDefault: true,
                                });

                                if (route.name === 'home' && isFocused) {
                                    const now = Date.now();
                                    if (now - lastHomePressAt.current < HOME_DOUBLE_TAP_MS) {
                                        lastHomePressAt.current = 0;
                                        DeviceEventEmitter.emit(HOME_TAB_DOUBLE_TAP_EVENT);
                                    } else {
                                        lastHomePressAt.current = now;
                                    }
                                    return;
                                }

                                if (!isFocused && !event.defaultPrevented) {
                                    navigation.navigate(route.name);
                                }
                            };

                            const onLongPress = () => {
                                navigation.emit({
                                    type: 'tabLongPress',
                                    target: route.key,
                                });
                            };

                            // Determine icon type
                            const isCampusmart = route.name === 'campusmart';
                            const isLazzypeeps = route.name === 'lazzypeeps';
                            const isFlagTab = isCampusmart || isLazzypeeps;

                            return (
                                <TabItem
                                    key={route.key}
                                    isFocused={isFocused}
                                    options={options}
                                    onPress={onPress}
                                    onLongPress={onLongPress}
                                    isFlagTab={isFlagTab}
                                    flagBrand={isCampusmart ? 'campusmart' : 'lazzypeeps'}
                                    routeName={route.name}
                                    colors={colors}
                                />
                            );
                        })}
                    </View>
                </View>
            </View>
        </View>
    );
};

interface TabItemProps {
    isFocused: boolean;
    options: any;
    onPress: () => void;
    onLongPress: () => void;
    isFlagTab: boolean;
    flagBrand: string;
    routeName: string;
    colors: any;
}

const TabItem: React.FC<TabItemProps> = ({
    isFocused,
    options,
    onPress,
    onLongPress,
    isFlagTab,
    flagBrand,
    routeName,
    colors,
}) => {
    const scale = useSharedValue(1);
    const videoRef = useRef<Video>(null);

    const handlePressIn = () => {
        scale.value = withTiming(0.95, { duration: 100 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, {
            damping: 10,
            stiffness: 200,
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const iconSize = isFocused ? 24 : 22;

    // Custom positioning - equal spacing for all items
    const getCustomStyle = () => {
        return {}; // Equal spacing for all items
    };

    const renderContent = () => {
        // Simply return the standard icon for all tabs
        return options.tabBarIcon?.({
            focused: isFocused,
            color: isFocused ? colors.primary : colors.textSecondary,
            size: iconSize || 24, // Fallback size
        });
    };

    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.tabItem, getCustomStyle()]}
            activeOpacity={0.8}
        >
            <Animated.View style={[styles.iconContainer, animatedStyle]}>
                {renderContent()}

                {/* Soft glow - Only for non-flag tabs */}
                {isFocused && !isFlagTab && (
                    <View style={[styles.activeGlow, { backgroundColor: colors.primary, shadowColor: colors.primary }]} />
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 0,
    },
    navbarWrapper: {
        position: 'relative',
    },
    navbarBackground: {
        borderRadius: 24,
        paddingTop: 8,
        paddingBottom: 8,
        paddingHorizontal: 8,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
        position: 'relative',
        borderWidth: 1,
    },
    centerFabContainer: {
        position: 'absolute',
        top: -28,
        left: '50%',
        width: 52,
        height: 52,
        zIndex: 100,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateX: -16 }],
    },
    neumorphicWrapper: {
        width: 52,
        height: 52,
        transform: [{ rotate: '45deg' }],
        borderRadius: 12,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    fabButton: {
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-45deg' }],
    },
    fabInner: {
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusIcon: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusHorizontal: {
        width: 14,
        height: 2.5,
        borderRadius: 1.25,
    },
    plusVertical: {
        width: 2.5,
        height: 14,
        borderRadius: 1.25,
        position: 'absolute',
    },
    tabBarContainer: {
        flexDirection: 'row',
        height: 60,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    activeGlow: {
        position: 'absolute',
        bottom: 2,
        width: 28,
        height: 3,
        borderRadius: 1.5,
        opacity: 0.8,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
    },
    bigGlow: {
        width: 36,
        height: 3,
    },
    flagIconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoWrapper: {
        width: 40,
        height: 40,
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoIcon: {
        width: 40,
        height: 40,
    },
});
