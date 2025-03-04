import React from 'react';
import { Text as PaperText } from 'react-native-paper';
import { StyleProp, TextStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface ThemedTextProps {
  style?: StyleProp<TextStyle>;
  variant?: 'displayLarge' | 'displayMedium' | 'displaySmall' | 'headlineLarge' | 'headlineMedium' | 
    'headlineSmall' | 'titleLarge' | 'titleMedium' | 'titleSmall' | 'bodyLarge' | 
    'bodyMedium' | 'bodySmall' | 'labelLarge' | 'labelMedium' | 'labelSmall';
  lightColor?: string;
  darkColor?: string;
  children?: React.ReactNode;
  [x: string]: any; // Diğer özellikleri kabul etmek için
}

export function ThemedText(props: ThemedTextProps) {
  const { style, lightColor, darkColor, variant = 'bodyMedium', children, ...otherProps } = props;
  const { isDark } = useTheme();
  
  // Özelleştirilmiş renk veya varsayılan tema rengi kullan
  const color = isDark ? darkColor : lightColor;
  
  // Temadan "onSurface" (metin rengi) değerini kullanacak, özel renk verilmişse o kullanılacak
  return (
    <PaperText
      variant={variant}
      style={[color ? { color } : {}, style]}
      {...otherProps}
    >
      {children}
    </PaperText>
  );
}

// İsimlendirme kolaylığı için önceden tanımlanmış bileşenler
export const TitleLarge = (props: Omit<ThemedTextProps, 'variant'>) => (
  <ThemedText {...props} variant="titleLarge" />
);

export const TitleMedium = (props: Omit<ThemedTextProps, 'variant'>) => (
  <ThemedText {...props} variant="titleMedium" />
);

export const TitleSmall = (props: Omit<ThemedTextProps, 'variant'>) => (
  <ThemedText {...props} variant="titleSmall" />
);

export const BodyLarge = (props: Omit<ThemedTextProps, 'variant'>) => (
  <ThemedText {...props} variant="bodyLarge" />
);

export const BodyMedium = (props: Omit<ThemedTextProps, 'variant'>) => (
  <ThemedText {...props} variant="bodyMedium" />
);

export const BodySmall = (props: Omit<ThemedTextProps, 'variant'>) => (
  <ThemedText {...props} variant="bodySmall" />
);

export const LabelLarge = (props: Omit<ThemedTextProps, 'variant'>) => (
  <ThemedText {...props} variant="labelLarge" />
);

export const LabelMedium = (props: Omit<ThemedTextProps, 'variant'>) => (
  <ThemedText {...props} variant="labelMedium" />
);

export const LabelSmall = (props: Omit<ThemedTextProps, 'variant'>) => (
  <ThemedText {...props} variant="labelSmall" />
); 