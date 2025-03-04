import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider as PaperProvider } from 'react-native-paper';
import { getPaperTheme, validateTheme } from '@/constants/PaperTheme';

// Theme type definition
type ThemeType = 'light' | 'dark';

// Theme context interface
interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  isDark: boolean;
  paperTheme: any; // React Native Paper tema nesnesi
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage key for theme preference
const THEME_STORAGE_KEY = 'USER_THEME_PREFERENCE';

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with system theme
  const [theme, setTheme] = useState<ThemeType>('light');
  const [isLoaded, setIsLoaded] = useState(false);
  const [paperTheme, setPaperTheme] = useState(() => getPaperTheme(false));

  // Tema değişikliğini uygula
  const applyTheme = (newTheme: ThemeType) => {
    const isDarkMode = newTheme === 'dark';
    setTheme(newTheme);
    
    // React Native Paper temasını güncelle
    const newPaperTheme = getPaperTheme(isDarkMode);
    
    // Tema doğrulaması yap
    if (!validateTheme(newPaperTheme)) {
      console.error('Tema doğrulama hatası! Yedek tema kullanılıyor.');
      // Yedek tema olarak varsayılan tema kullanılabilir
      setPaperTheme(isDarkMode ? getPaperTheme(true) : getPaperTheme(false));
      return;
    }
    
    setPaperTheme(newPaperTheme);
  };

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        
        if (savedTheme) {
          // Use saved preference if available
          applyTheme(savedTheme as ThemeType);
        } else {
          // Otherwise use device preference
          const deviceTheme = Appearance.getColorScheme() || 'light';
          applyTheme(deviceTheme as ThemeType);
        }
      } catch (error) {
        // Default to light theme if error
        console.error('Error loading theme:', error);
        applyTheme('light');
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  // Update when system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only auto-update if no explicit user preference is set
      if (!isLoaded) return;
      
      const asyncUpdate = async () => {
        const hasUserPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!hasUserPreference && colorScheme) {
          applyTheme(colorScheme as ThemeType);
        }
      };
      
      asyncUpdate();
    });

    return () => subscription.remove();
  }, [isLoaded]);

  // Toggle theme function
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    
    // Save user preference
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // React Native Paper ile birleştirilmiş tema sağlayıcı
  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme,
      isDark: theme === 'dark',
      paperTheme
    }}>
      <PaperProvider theme={paperTheme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}; 