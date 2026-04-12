/**
 * ProfileTabs Component
 * 
 * Instagram-style animated tab bar with sliding indicator
 */

import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'posts' | 'liked';

interface ProfileTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
    activeTab,
    onTabChange,
}) => {
    const colors = useThemeColors();
    const tabWidth = SCREEN_WIDTH / 2;

    const handleTabPress = (tab: TabType) => {
        if (tab !== activeTab) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onTabChange(tab);
        }
    };

    const indicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: withSpring(
                        activeTab === 'posts' ? 0 : tabWidth,
                        { damping: 20, stiffness: 200 }
                    )
                }
            ],
        };
    });

    return (
        <View style={[styles.container, { borderColor: colors.border }]}>
            <TouchableOpacity
                style={styles.tab}
                onPress={() => handleTabPress('posts')}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={activeTab === 'posts' ? 'grid' : 'grid-outline'}
                    size={24}
                    color={activeTab === 'posts' ? colors.text : colors.textTertiary}
                />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.tab}
                onPress={() => handleTabPress('liked')}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={activeTab === 'liked' ? 'heart' : 'heart-outline'}
                    size={24}
                    color={activeTab === 'liked' ? colors.text : colors.textTertiary}
                />
            </TouchableOpacity>

            {/* Animated Indicator */}
            <Animated.View
                style={[
                    styles.indicator,
                    { backgroundColor: colors.text, width: tabWidth },
                    indicatorStyle,
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        position: 'relative',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 1,
    },
});
