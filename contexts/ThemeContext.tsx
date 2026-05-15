import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { light, dark } from '@/constants/colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof light;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  // Load saved theme
  useEffect(() => {
    const loadTheme = async () => {
      try {
        if (typeof localStorage !== 'undefined') {
          const savedTheme = localStorage.getItem('themeMode') as ThemeMode;
          if (savedTheme) {
            setThemeMode(savedTheme);
          }
        }
      } catch (e) {
        console.error('Failed to load theme', e);
      }
    };
    loadTheme();
  }, []);

  // Save theme
  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('themeMode', mode);
      }
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const isDark = false;
  const colors = light;

  return (
    <ThemeContext.Provider value={{ 
      themeMode, 
      setThemeMode: handleSetThemeMode, 
      colors, 
      isDark 
    }}>
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
