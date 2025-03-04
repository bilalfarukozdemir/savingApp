/**
 * React Native Paper tema yapılandırması
 * Mevcut renk şemasını React Native Paper temasıyla entegre eder
 */

import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { Colors } from './Colors';

// Font yapılandırması - Modern Inter yazı tipi ailesi
const fontConfig = {
  fontFamily: 'Inter_400Regular',
};

// Tipografi hiyerarşisi
const typographyConfig = configureFonts({
  config: {
    displayLarge: {
      ...fontConfig,
      fontFamily: 'Inter_400Regular',
      fontWeight: '400',
      fontSize: 57,
      letterSpacing: 0,
      lineHeight: 64,
    },
    displayMedium: {
      ...fontConfig,
      fontFamily: 'Inter_400Regular',
      fontWeight: '400',
      fontSize: 45,
      letterSpacing: 0,
      lineHeight: 52,
    },
    displaySmall: {
      ...fontConfig,
      fontFamily: 'Inter_400Regular',
      fontWeight: '400',
      fontSize: 36,
      letterSpacing: 0,
      lineHeight: 44,
    },
    headlineLarge: {
      ...fontConfig,
      fontFamily: 'Inter_500Medium',
      fontWeight: '400',
      fontSize: 32,
      letterSpacing: 0,
      lineHeight: 40,
    },
    headlineMedium: {
      ...fontConfig,
      fontFamily: 'Inter_500Medium',
      fontWeight: '400',
      fontSize: 28,
      letterSpacing: 0,
      lineHeight: 36,
    },
    headlineSmall: {
      ...fontConfig,
      fontFamily: 'Inter_500Medium',
      fontWeight: '400',
      fontSize: 24,
      letterSpacing: 0,
      lineHeight: 32,
    },
    titleLarge: {
      ...fontConfig,
      fontFamily: 'Inter_600SemiBold',
      fontWeight: '500',
      fontSize: 22,
      letterSpacing: 0,
      lineHeight: 28,
    },
    titleMedium: {
      ...fontConfig,
      fontFamily: 'Inter_600SemiBold',
      fontWeight: '500',
      fontSize: 16,
      letterSpacing: 0.15,
      lineHeight: 24,
    },
    titleSmall: {
      ...fontConfig,
      fontFamily: 'Inter_600SemiBold',
      fontWeight: '500',
      fontSize: 14,
      letterSpacing: 0.1,
      lineHeight: 20,
    },
    bodyLarge: {
      ...fontConfig,
      fontFamily: 'Inter_400Regular',
      fontWeight: '400',
      fontSize: 16,
      letterSpacing: 0.15,
      lineHeight: 24,
    },
    bodyMedium: {
      ...fontConfig,
      fontFamily: 'Inter_400Regular',
      fontWeight: '400',
      fontSize: 14,
      letterSpacing: 0.25,
      lineHeight: 20,
    },
    bodySmall: {
      ...fontConfig,
      fontFamily: 'Inter_400Regular',
      fontWeight: '400',
      fontSize: 12,
      letterSpacing: 0.4,
      lineHeight: 16,
    },
    labelLarge: {
      ...fontConfig,
      fontFamily: 'Inter_500Medium',
      fontWeight: '500',
      fontSize: 14,
      letterSpacing: 0.1,
      lineHeight: 20,
    },
    labelMedium: {
      ...fontConfig,
      fontFamily: 'Inter_500Medium',
      fontWeight: '500',
      fontSize: 12,
      letterSpacing: 0.5,
      lineHeight: 16,
    },
    labelSmall: {
      ...fontConfig,
      fontFamily: 'Inter_500Medium',
      fontWeight: '500',
      fontSize: 11,
      letterSpacing: 0.5,
      lineHeight: 16,
    },
  },
});

// Aydınlık tema oluştur
export const LightPaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.light.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: `${Colors.light.primary}20`, // %20 opaklıkta
    onPrimaryContainer: Colors.light.primary,
    secondary: Colors.light.secondary,
    onSecondary: '#FFFFFF',
    secondaryContainer: `${Colors.light.secondary}20`,
    onSecondaryContainer: Colors.light.secondary,
    tertiary: Colors.light.accent,
    onTertiary: '#FFFFFF',
    tertiaryContainer: `${Colors.light.accent}20`,
    onTertiaryContainer: Colors.light.accent,
    error: Colors.light.error,
    onError: '#FFFFFF',
    errorContainer: `${Colors.light.error}20`,
    onErrorContainer: Colors.light.error,
    background: Colors.light.background,
    onBackground: Colors.light.text,
    surface: Colors.light.background,
    onSurface: Colors.light.text,
    surfaceVariant: Colors.light.backgroundSecondary,
    onSurfaceVariant: Colors.light.textSecondary,
    outline: Colors.light.border,
    outlineVariant: Colors.light.borderSecondary,
    shadow: Colors.light.shadow,
    scrim: Colors.light.overlay,
    inverseSurface: Colors.dark.background,
    inverseOnSurface: Colors.dark.text,
    inversePrimary: Colors.dark.primary,
    elevation: {
      level0: 'transparent',
      level1: '#F5F5F5',
      level2: '#EEEEEE',
      level3: '#E0E0E0',
      level4: '#D6D6D6',
      level5: '#C2C2C2',
    },
  },
  fonts: typographyConfig,
  roundness: 8, // Köşe yuvarlaklığını ayarla
  animation: {
    scale: 1.0, // Animasyon hızını ayarla
  },
};

// Karanlık tema oluştur
export const DarkPaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.dark.primary,
    onPrimary: '#000000',
    primaryContainer: `${Colors.dark.primary}20`,
    onPrimaryContainer: Colors.dark.primary,
    secondary: Colors.dark.secondary,
    onSecondary: '#000000',
    secondaryContainer: `${Colors.dark.secondary}20`,
    onSecondaryContainer: Colors.dark.secondary,
    tertiary: Colors.dark.accent,
    onTertiary: '#000000',
    tertiaryContainer: `${Colors.dark.accent}20`,
    onTertiaryContainer: Colors.dark.accent,
    error: Colors.dark.error,
    onError: '#000000',
    errorContainer: `${Colors.dark.error}20`,
    onErrorContainer: Colors.dark.error,
    background: Colors.dark.background,
    onBackground: Colors.dark.text,
    surface: Colors.dark.background,
    onSurface: Colors.dark.text,
    surfaceVariant: Colors.dark.backgroundSecondary,
    onSurfaceVariant: Colors.dark.textSecondary,
    outline: Colors.dark.border,
    outlineVariant: Colors.dark.borderSecondary,
    shadow: Colors.dark.shadow,
    scrim: Colors.dark.overlay,
    inverseSurface: Colors.light.background,
    inverseOnSurface: Colors.light.text,
    inversePrimary: Colors.light.primary,
    elevation: {
      level0: 'transparent',
      level1: '#272727',
      level2: '#2E2E2E',
      level3: '#333333',
      level4: '#383838',
      level5: '#404040',
    },
  },
  fonts: typographyConfig,
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Tema durumunu kontrol eden yardımcı fonksiyon
export const getPaperTheme = (isDark: boolean) => {
  return isDark ? DarkPaperTheme : LightPaperTheme;
};

// Hata yakalama ve doğrulama fonksiyonu
export const validateTheme = (theme: any): boolean => {
  try {
    // Gerekli tema özelliklerini kontrol et
    const requiredProps = ['colors', 'fonts', 'roundness', 'animation'];
    const missingProps = requiredProps.filter(prop => !theme[prop]);
    
    if (missingProps.length > 0) {
      console.error(`Tema doğrulama hatası: Eksik özellikler: ${missingProps.join(', ')}`);
      return false;
    }
    
    // Renkler için gerekli özellikleri kontrol et
    const requiredColors = ['primary', 'background', 'surface', 'error'];
    const missingColors = requiredColors.filter(color => !theme.colors[color]);
    
    if (missingColors.length > 0) {
      console.error(`Tema renk doğrulama hatası: Eksik renkler: ${missingColors.join(', ')}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Tema doğrulama sırasında beklenmeyen hata:', error);
    return false;
  }
}; 