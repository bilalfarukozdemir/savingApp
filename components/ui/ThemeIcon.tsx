/**
 * Tema Uyumlu İkon Bileşeni
 * React Native Paper ve Vector Icons ile uyumlu çalışır
 */

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { MD2Colors, MD3Colors } from 'react-native-paper';
import { 
  MaterialIcons, 
  MaterialCommunityIcons,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  Feather,
  Entypo,
  AntDesign
} from '@expo/vector-icons';

export type IconType = 
  | 'material'
  | 'material-community'
  | 'font-awesome'
  | 'font-awesome5'
  | 'ionicons'
  | 'feather'
  | 'entypo'
  | 'antdesign'
  | 'system'; // iOS sembolleri için (IconSymbol kullanılır)

interface ThemeIconProps {
  name: string;
  type?: IconType;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const ThemeIcon: React.FC<ThemeIconProps> = ({
  name,
  type = 'material',
  size = 24,
  color,
  style,
  onPress
}) => {
  const { isDark } = useTheme();
  
  // Varsayılan renkler
  const defaultColor = isDark 
    ? color || Colors.dark.icon 
    : color || Colors.light.icon;
  
  // İkon türüne göre doğru bileşeni seç
  const renderIcon = () => {
    switch (type) {
      case 'material':
        return (
          <MaterialIcons
            name={name}
            size={size}
            color={defaultColor}
            style={style}
          />
        );
      
      case 'material-community':
        return (
          <MaterialCommunityIcons
            name={name}
            size={size}
            color={defaultColor}
            style={style}
          />
        );
      
      case 'font-awesome':
        return (
          <FontAwesome
            name={name}
            size={size}
            color={defaultColor}
            style={style}
          />
        );
        
      case 'font-awesome5':
        return (
          <FontAwesome5
            name={name}
            size={size}
            color={defaultColor}
            style={style}
          />
        );
      
      case 'ionicons':
        return (
          <Ionicons
            name={name}
            size={size}
            color={defaultColor}
            style={style}
          />
        );
        
      case 'feather':
        return (
          <Feather
            name={name}
            size={size}
            color={defaultColor}
            style={style}
          />
        );
      
      case 'entypo':
        return (
          <Entypo
            name={name}
            size={size}
            color={defaultColor}
            style={style}
          />
        );
        
      case 'antdesign':
        return (
          <AntDesign
            name={name}
            size={size}
            color={defaultColor}
            style={style}
          />
        );
        
      case 'system':
        // System ikonu için mevcut IconSymbol bileşeni kullanılabilir
        // Geçici çözüm olarak varsayılan material ikonlarını kullan
        return (
          <MaterialIcons
            name={name}
            size={size}
            color={defaultColor}
            style={style}
          />
        );
        
      default:
        // Varsayılan olarak material ikonları kullan
        return (
          <MaterialIcons
            name={name}
            size={size}
            color={defaultColor}
            style={style}
          />
        );
    }
  };
  
  try {
    return renderIcon();
  } catch (error) {
    console.error(`İkon hatası: ${type} türü için "${name}" ikonu yüklenirken hata:`, error);
    // Fallback olarak varsayılan bir icon göster
    return (
      <MaterialIcons
        name="error"
        size={size}
        color={Colors.light.error}
        style={style}
      />
    );
  }
};

// Popüler ikon renkleri için yardımcı sabitler - Material Design 3'e dayalı
export const IconColors = {
  primary: (isDark = false) => isDark ? Colors.dark.primary : Colors.light.primary,
  secondary: (isDark = false) => isDark ? Colors.dark.secondary : Colors.light.secondary,
  error: (isDark = false) => isDark ? Colors.dark.error : Colors.light.error,
  warning: (isDark = false) => isDark ? Colors.dark.warning : Colors.light.warning,
  success: (isDark = false) => isDark ? Colors.dark.success : Colors.light.success,
  info: (isDark = false) => isDark ? Colors.dark.info : Colors.light.info,
  disabled: (isDark = false) => isDark ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)',
  
  // Material renk paletinden renkleri ekle
  red: MD3Colors.error40,
  pink: MD2Colors.pink500,
  purple: MD2Colors.purple500,
  deepPurple: MD2Colors.deepPurple500,
  indigo: MD2Colors.indigo500,
  blue: MD2Colors.blue500,
  lightBlue: MD2Colors.lightBlue500,
  cyan: MD2Colors.cyan500,
  teal: MD2Colors.teal500,
  green: MD2Colors.green500,
  lightGreen: MD2Colors.lightGreen500,
  lime: MD2Colors.lime500,
  yellow: MD2Colors.yellow500,
  amber: MD2Colors.amber500,
  orange: MD2Colors.orange500,
  deepOrange: MD2Colors.deepOrange500,
  brown: MD2Colors.brown500,
  grey: MD2Colors.grey500,
  blueGrey: MD2Colors.blueGrey500
}; 