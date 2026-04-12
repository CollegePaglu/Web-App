/**
 * SettingsBottomSheet Component
 * 
 * Modal-based bottom sheet with Edit Profile, Settings, and Logout options
 */

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Modal,
    Pressable,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/context/ThemeContext';
import { LogoutModal } from './LogoutModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 340;

export interface SettingsBottomSheetRef {
    open: () => void;
    close: () => void;
}

interface SettingsBottomSheetProps {
    onEditProfile: () => void;
    onSettings?: () => void;
    onSupport?: () => void;
    onLogout: () => void;
}

export const SettingsBottomSheet = forwardRef<SettingsBottomSheetRef, SettingsBottomSheetProps>(
    ({ onEditProfile, onSettings, onSupport, onLogout }, ref) => {
        const colors = useThemeColors();
        const [visible, setVisible] = useState(false);
        const [showLogoutModal, setShowLogoutModal] = useState(false);
        const translateY = useSharedValue(SHEET_HEIGHT);
        const backdropOpacity = useSharedValue(0);

        useImperativeHandle(ref, () => ({
            open: () => {
                setVisible(true);
                translateY.value = withTiming(0, { duration: 300 });
                backdropOpacity.value = withTiming(1, { duration: 300 });
            },
            close: () => {
                translateY.value = withTiming(SHEET_HEIGHT, { duration: 300 });
                backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
                    runOnJS(setVisible)(false);
                });
            },
        }));

        const closeSheet = () => {
            translateY.value = withTiming(SHEET_HEIGHT, { duration: 300 });
            backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
                runOnJS(setVisible)(false);
            });
        };

        const handleEditProfile = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            closeSheet();
            setTimeout(onEditProfile, 300);
        };

        const handleSettings = () => {
            if (onSettings) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                closeSheet();
                setTimeout(onSettings, 300);
            }
        };

        const handleSupport = () => {
            if (onSupport) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                closeSheet();
                setTimeout(onSupport, 300);
            }
        };

        const handleLogout = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            closeSheet();
            setTimeout(() => {
                setShowLogoutModal(true);
            }, 300);
        };

        const sheetStyle = useAnimatedStyle(() => ({
            transform: [{ translateY: translateY.value }],
        }));

        const backdropStyle = useAnimatedStyle(() => ({
            opacity: backdropOpacity.value,
        }));

        if (!visible && !showLogoutModal) return null;

        return (
            <>
                <Modal
                    visible={visible}
                    transparent
                    animationType="none"
                    onRequestClose={closeSheet}
                >
                    <View style={styles.container}>
                        {/* Backdrop */}
                        <Animated.View style={[styles.backdrop, backdropStyle]}>
                            <Pressable style={styles.backdropPressable} onPress={closeSheet} />
                        </Animated.View>

                        {/* Sheet */}
                        <Animated.View
                            style={[
                                styles.sheet,
                                { backgroundColor: colors.surface },
                                sheetStyle,
                            ]}
                        >
                            {/* Handle */}
                            <View style={styles.handleContainer}>
                                <View style={[styles.handle, { backgroundColor: colors.textTertiary }]} />
                            </View>

                            {/* Edit Profile */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={handleEditProfile}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="person-outline" size={24} color={colors.text} />
                                <Text style={[styles.menuText, { color: colors.text }]}>
                                    Edit Profile
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                            </TouchableOpacity>

                            {/* Settings */}
                            {onSettings && (
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={handleSettings}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="settings-outline" size={24} color={colors.text} />
                                    <Text style={[styles.menuText, { color: colors.text }]}>
                                        Settings
                                    </Text>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                                </TouchableOpacity>
                            )}

                            {/* Help & Support */}
                            {onSupport && (
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={handleSupport}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="help-circle-outline" size={24} color={colors.text} />
                                    <Text style={[styles.menuText, { color: colors.text }]}>
                                        Help & Support
                                    </Text>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                                </TouchableOpacity>
                            )}

                            {/* Divider */}
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />

                            {/* Logout */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={handleLogout}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                                <Text style={[styles.menuText, { color: '#EF4444' }]}>
                                    Logout
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Modal>

                {/* Custom Logout Modal */}
                <LogoutModal
                    visible={showLogoutModal}
                    onClose={() => setShowLogoutModal(false)}
                    onConfirm={onLogout}
                />
            </>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdropPressable: {
        flex: 1,
    },
    sheet: {
        height: SHEET_HEIGHT,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 24,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 16,
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },
});
