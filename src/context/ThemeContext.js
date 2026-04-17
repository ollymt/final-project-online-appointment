import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const lightTheme = {
    mode: 'light',
    bg: '#F8F5F2',
    bgCard: '#FFFFFF',
    bgInput: '#F0EDE9',
    primary: '#2D6A4F',
    primaryLight: '#52B788',
    primaryDark: '#1B4332',
    accent: '#E76F51',
    accentLight: '#F4A261',
    text: '#1A1A2E',
    textSecondary: '#5C5C7A',
    textMuted: '#9999AA',
    border: '#E0DAD4',
    danger: '#C0392B',
    dangerLight: '#FADBD8',
    success: '#27AE60',
    successLight: '#D5F5E3',
    warning: '#F39C12',
    warningLight: '#FDEBD0',
    shadow: '#00000015',
    statusBar: 'dark',
};

export const darkTheme = {
    mode: 'dark',
    bg: '#0D1117',
    bgCard: '#161B22',
    bgInput: '#21262D',
    primary: '#52B788',
    primaryLight: '#74C69D',
    primaryDark: '#2D6A4F',
    accent: '#F4A261',
    accentLight: '#E76F51',
    text: '#E6EDF3',
    textSecondary: '#8B949E',
    textMuted: '#484F58',
    border: '#30363D',
    danger: '#FF6B6B',
    dangerLight: '#3D1A1A',
    success: '#56D364',
    successLight: '#1A3D1A',
    warning: '#E3B341',
    warningLight: '#3D2E1A',
    shadow: '#00000040',
    statusBar: 'light',
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(lightTheme);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const saved = await AsyncStorage.getItem('@theme');
            if (saved === 'dark') setTheme(darkTheme);
        } catch { }
    };

    const toggleTheme = async () => {
        const next = theme.mode === 'light' ? darkTheme : lightTheme;
        setTheme(next);
        await AsyncStorage.setItem('@theme', next.mode);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);