import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, ThemeColors } from '../theme/colors';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeType;
    colors: ThemeColors;
    isDark: boolean;
    setTheme: (theme: ThemeType) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<ThemeType>('system');
    const [isReady, setIsReady] = useState(false);

    // Load saved theme preference
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('user_theme_preference');
                if (savedTheme) {
                    setThemeState(savedTheme as ThemeType);
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
            } finally {
                setIsReady(true);
            }
        };
        loadTheme();
    }, []);

    const setTheme = async (newTheme: ThemeType) => {
        setThemeState(newTheme);
        try {
            await AsyncStorage.setItem('user_theme_preference', newTheme);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const toggleTheme = () => {
        let nextTheme: ThemeType;
        if (theme === 'system') {
            nextTheme = systemColorScheme === 'dark' ? 'light' : 'dark';
        } else {
            nextTheme = theme === 'dark' ? 'light' : 'dark';
        }
        setTheme(nextTheme);
    };

    const activeTheme = theme === 'system' ? systemColorScheme : theme;
    const isDark = activeTheme === 'dark';
    const colors = isDark ? darkTheme : lightTheme;

    if (!isReady) {
        return null; // Or a splash screen
    }

    return (
        <ThemeContext.Provider value={{ theme, colors, isDark, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const useThemeColors = () => {
    const { colors } = useTheme();
    return colors;
};
