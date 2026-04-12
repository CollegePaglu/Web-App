/**
 * Theme Configuration
 * 
 * Modern college paglu theme - inspired by landing page design.
 * Primary: Forest (#3D5940) | Secondary: Sage (#8BA888) | Accent: Orange (#FF8C42)
 * Background: Beige Cream (#FAF8F3) | Text: Forest Deep (#2A3F2C)
 */

export const theme = {
    colors: {
        // Primary brand colors - Forest palette
        primary: '#3D5940',         // Forest Main
        primaryLight: '#8BA888',    // Sage Main
        primaryDark: '#2A3F2C',     // Forest Deep

        // Secondary colors - Sage & Mint
        secondary: '#8BA888',       // Sage Main
        secondaryLight: '#8FE3B0',  // Mint Fresh

        // Background colors - Beige palette
        background: '#FAF8F3',      // Beige Cream
        backgroundSecondary: '#F5F1E8', // Beige Soft

        // Text colors
        text: '#2A3F2C',            // Forest Deep
        textSecondary: '#5F7A61',   // Forest Mid
        textTertiary: '#8BA888',    // Sage Main

        // Status colors
        success: '#8FE3B0',         // Mint Fresh
        warning: '#FF8C42',         // Accent Orange
        error: '#FF7F7F',           // Coral Red
        info: '#3D5940',            // Forest Main

        // Border colors
        border: '#C4B299',          // Beige Rich
        borderLight: '#E8DCC4',     // Beige Medium

        // Social/Engagement
        upvote: '#8FE3B0',          // Mint Fresh
        downvote: '#FF7F7F',        // Coral Red
        like: '#FF8C42',            // Accent Orange
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
    },

    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },

    typography: {
        fontSizes: {
            xs: 10,
            sm: 12,
            md: 14,
            lg: 16,
            xl: 18,
            xxl: 24,
        },
        fontWeights: {
            normal: '400' as const,
            medium: '500' as const,
            semibold: '600' as const,
            bold: '700' as const,
        },
    },
} as const;

export default theme;
