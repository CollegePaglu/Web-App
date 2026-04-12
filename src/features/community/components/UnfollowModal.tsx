import React from 'react';
import {
    View,
    Text as RNText,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Pressable,
    Platform
} from 'react-native';
import { AppImage } from '@/components/ui/AppImage';
import { BlurView } from 'expo-blur';
import { useThemeColors } from '@/context/ThemeContext';

interface UnfollowModalProps {
    visible: boolean;
    user: {
        id: string;
        name: string;
        avatarUrl?: string;
    } | null;
    onClose: () => void;
    onConfirm: (userId: string) => void;
}

export const UnfollowModal = ({ visible, user, onClose, onConfirm }: UnfollowModalProps) => {
    const uiColors = useThemeColors();

    if (!user) return null;

    const handleConfirm = () => {
        onConfirm(user.id);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose}>
                    {Platform.OS === 'ios' ? (
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                    )}
                </Pressable>

                <View style={[styles.container, { backgroundColor: uiColors.surface }]}>
                    <View style={styles.content}>
                        {user.avatarUrl ? (
                            <AppImage uri={user.avatarUrl} style={styles.avatar} contentFit="cover" />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: uiColors.surfaceHighlight }]}>
                                <RNText style={[styles.avatarInitials, { color: uiColors.primary }]}>
                                    {user.name.charAt(0).toUpperCase()}
                                </RNText>
                            </View>
                        )}

                        <RNText style={[styles.title, { color: uiColors.text }]}>
                            Unfollow @{user.name}?
                        </RNText>

                        <RNText style={[styles.subtitle, { color: uiColors.textSecondary }]}>
                            Their posts won't show up in your feed anymore.
                        </RNText>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={handleConfirm}
                        >
                            <RNText style={[styles.buttonText, { color: '#FF3B30' }]}>
                                Unfollow
                            </RNText>
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: uiColors.border }]} />

                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <RNText style={[styles.buttonText, { color: uiColors.text }]}>
                                Cancel
                            </RNText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        width: 300,
        borderRadius: 16,
        overflow: 'hidden',
        // Shadows
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 16,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 32,
        fontWeight: '700',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    actions: {
        width: '100%',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        width: '100%',
    },
    button: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'transparent', // The divider handles this visually but keeping spacing
    },
    cancelButton: {
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
