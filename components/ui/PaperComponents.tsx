/**
 * Paper UI Bileşenleri
 * React Native Paper bileşenlerinin özelleştirilmiş versiyonları
 */

import React from 'react';
import { 
  Button as PaperButton, 
  Card as PaperCard,
  Checkbox as PaperCheckbox,
  TextInput as PaperTextInput,
  Divider as PaperDivider,
  FAB as PaperFAB,
  IconButton as PaperIconButton,
  List as PaperList,
  Menu as PaperMenu,
  Modal as PaperModal,
  Snackbar as PaperSnackbar,
  Switch as PaperSwitch,
  ActivityIndicator as PaperActivityIndicator,
  Surface as PaperSurface,
  RadioButton as PaperRadioButton,
  Chip as PaperChip,
  configureFonts,
  MD3Theme,
  ProgressBar as PaperProgressBar
} from 'react-native-paper';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';

// Tema doğrulaması ve hata yakalama için yardımcı fonksiyonlar
const validateStyle = (style: any, name: string) => {
  if (!style) return true;
  try {
    // Stil nesnelerini doğrulayacak kontroller eklenebilir
    return typeof style === 'object' || Array.isArray(style);
  } catch (error) {
    console.error(`${name} bileşeni için stil doğrulama hatası:`, error);
    return false;
  }
};

// BUTON BILEŞENLERI

interface ButtonProps {
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  icon?: string;
  [x: string]: any;
}

export const Button = ({
  mode = 'contained',
  style,
  labelStyle,
  onPress,
  disabled = false,
  loading = false,
  children,
  icon,
  ...rest
}: ButtonProps) => {
  // Stil doğrulama
  const validStyle = validateStyle(style, 'Button');
  const validLabelStyle = validateStyle(labelStyle, 'Button Label');

  return (
    <PaperButton
      mode={mode}
      style={validStyle ? style : undefined}
      labelStyle={validLabelStyle ? labelStyle : undefined}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      icon={icon}
      {...rest}
    >
      {children}
    </PaperButton>
  );
};

// KART BILEŞENLERI

interface CardProps {
  style?: StyleProp<ViewStyle>;
  mode?: 'elevated' | 'outlined' | 'contained';
  children: React.ReactNode;
  [x: string]: any;
}

export const Card = ({ style, mode = 'elevated', children, ...rest }: CardProps) => {
  const validStyle = validateStyle(style, 'Card');
  
  return (
    <PaperCard
      style={validStyle ? style : undefined}
      mode={mode}
      {...rest}
    >
      {children}
    </PaperCard>
  );
};

export const CardTitle = PaperCard.Title;
export const CardContent = PaperCard.Content;
export const CardActions = PaperCard.Actions;
export const CardCover = PaperCard.Cover;

// TEXT INPUT BİLEŞENLERİ

interface TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: StyleProp<ViewStyle>;
  mode?: 'flat' | 'outlined';
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad' | 'url';
  right?: React.ReactNode;
  left?: React.ReactNode;
  [x: string]: any;
}

export const TextInput = ({
  label,
  value,
  onChangeText,
  style,
  mode = 'outlined',
  disabled = false,
  error = false,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  keyboardType = 'default',
  right,
  left,
  ...rest
}: TextInputProps) => {
  const validStyle = validateStyle(style, 'TextInput');
  
  return (
    <PaperTextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      style={validStyle ? style : undefined}
      mode={mode}
      disabled={disabled}
      error={error}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      keyboardType={keyboardType}
      right={right}
      left={left}
      {...rest}
    />
  );
};

// CHECKBOX BİLEŞENLERİ

interface CheckboxProps {
  status: 'checked' | 'unchecked' | 'indeterminate';
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  [x: string]: any;
}

export const Checkbox = ({
  status,
  onPress,
  disabled = false,
  color,
  ...rest
}: CheckboxProps) => {
  return (
    <PaperCheckbox
      status={status}
      onPress={onPress}
      disabled={disabled}
      color={color}
      {...rest}
    />
  );
};

// LIST BİLEŞENLERİ

export const List = PaperList.Section;
export const ListItem = PaperList.Item;
export const ListAccordion = PaperList.Accordion;
export const ListIcon = PaperList.Icon;

// MODAL BİLEŞENİ

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  [x: string]: any;
}

export const Modal = ({
  visible,
  onDismiss,
  contentContainerStyle,
  children,
  ...rest
}: ModalProps) => {
  const validStyle = validateStyle(contentContainerStyle, 'Modal');
  
  return (
    <PaperModal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={validStyle ? contentContainerStyle : undefined}
      dismissable={true} 
      dismissableBackButton={true}
      // Modal animasyonlarını ve kullanıcı deneyimini iyileştiren ayarlar
      animationType="fade"
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
      {...rest}
    >
      {children}
    </PaperModal>
  );
};

// DİĞER TEMEL BİLEŞENLER

export const Divider = PaperDivider;
export const FAB = PaperFAB;
export const IconButton = PaperIconButton;
export const Surface = PaperSurface;
export const Chip = PaperChip;
export const RadioButton = PaperRadioButton;
export const ActivityIndicator = PaperActivityIndicator;
export const ProgressBar = PaperProgressBar;

// SNACKBAR BİLEŞENİ

interface SnackbarProps {
  visible: boolean;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  [x: string]: any;
}

export const Snackbar = ({
  visible,
  onDismiss,
  action,
  duration = 3000,
  style,
  children,
  ...rest
}: SnackbarProps) => {
  const validStyle = validateStyle(style, 'Snackbar');
  
  return (
    <PaperSnackbar
      visible={visible}
      onDismiss={onDismiss}
      action={action}
      duration={duration}
      style={validStyle ? style : undefined}
      {...rest}
    >
      {children}
    </PaperSnackbar>
  );
};

// SWITCH BİLEŞENİ

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
  [x: string]: any;
}

export const Switch = ({
  value,
  onValueChange,
  disabled = false,
  color,
  style,
  ...rest
}: SwitchProps) => {
  const validStyle = validateStyle(style, 'Switch');
  
  return (
    <PaperSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      color={color}
      style={validStyle ? style : undefined}
      {...rest}
    />
  );
}; 