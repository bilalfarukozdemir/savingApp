import React from 'react';
import { View, Text, StyleSheet, ImageSourcePropType, Image, ViewStyle } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string; // İkon adı
  illustration?: ImageSourcePropType; // Opsiyonel resim
  containerStyle?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  illustration,
  containerStyle,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, containerStyle, { backgroundColor: colors.card }]}>
      {illustration && <Image source={illustration} style={styles.illustration} />}
      
      {icon && <IconSymbol name={icon} size={50} color={colors.text} style={styles.icon} />}
      
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
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
    marginHorizontal: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
}); 