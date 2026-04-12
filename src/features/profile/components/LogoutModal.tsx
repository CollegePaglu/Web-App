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
import { BlurView } from 'expo-blur';
import { useThemeColors } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface LogoutModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const LogoutModal = ({ visible, onClose, onConfirm }: LogoutModalProps) => {
    const uiColors = useThemeColors();

    const handleConfirm = () => {
        onConfirm();
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
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <Ionicons name="log-out-outline" size={36} color="#EF4444" />
                        </View>

                        <RNText style={[styles.title, { color: uiColors.text }]}>
                            Logout
                        </RNText>

                        <RNText style={[styles.subtitle, { color: uiColors.textSecondary }]}>
                            Are you sure you want to log out of your account?
                        </RNText>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={handleConfirm}
                        >
                            <RNText style={[styles.buttonText, { color: '#EF4444' }]}>
                                Logout
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
        paddingTop: 32,
        alignItems: 'center',
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    actions: {
        width: '100%',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        width: '100%',
    },
    button: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'transparent',
    },
    cancelButton: {
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
