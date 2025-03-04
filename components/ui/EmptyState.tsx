import React from 'react';
import { View, StyleSheet, ImageSourcePropType, Image, ViewStyle, TouchableOpacity } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Button } from './PaperComponents';
import { BodyMedium, TitleMedium } from '../ThemedText';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: string; // İkon adı
  illustration?: ImageSourcePropType; // Opsiyonel resim
  containerStyle?: ViewStyle;
  action?: {
    title: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  illustration,
  containerStyle,
  action,
}) => {
  const { theme, isDark } = useTheme();
  const colors = Colors[theme];

  return (
    <View style={[styles.container, containerStyle]}>
      {illustration && <Image source={illustration} style={styles.illustration} />}
      
      {icon && <IconSymbol name={icon} size={50} color={colors.text} style={styles.icon} />}
      
      {title && <TitleMedium style={styles.title}>{title}</TitleMedium>}
      <BodyMedium style={styles.message}>{message}</BodyMedium>
      
      {action && (
        <Button
          mode="contained"
          onPress={action.onPress}
          style={styles.actionButton}
        >
          {action.title}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 10,
    minHeight: 180,
  },
  illustration: {
    width: 100,
    height: 100,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 16,
  }
}); 