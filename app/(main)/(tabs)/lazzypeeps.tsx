import React, { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { LazyPeepsView } from '@/features/LazyPeeps';

export default function LazzypeepsScreen() {
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                // Navigate to 'home' (Community) tab instead of default behavior
                router.navigate('/(main)/(tabs)/home');
                return true; // Prevent default behavior (exit/history)
            };

            const subscription = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress
            );

            return () => subscription.remove();
        }, [router])
    );

    return <LazyPeepsView />;
}
