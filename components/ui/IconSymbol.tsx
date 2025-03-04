// This file is an adapter for using ThemeIcon with the existing IconSymbol API.

import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';
import { ThemeIcon } from './ThemeIcon';

// SF Symbol to Material Icons mapping
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'person.fill': 'person',
  'arrow.down.circle.fill': 'arrow-circle-down',
  'arrow.up.circle.fill': 'arrow-circle-up',
  'cart.fill': 'shopping-cart',
  'car.fill': 'directions-car',
  'bolt.fill': 'bolt',
  'tv.fill': 'tv',
  'ellipsis.circle.fill': 'more-horiz',
  'plus.circle.fill': 'add-circle',
  'chart.bar.fill': 'bar-chart',
  'star.fill': 'star',
  'wrench.fill': 'build',
  'hammer.fill': 'gavel',
} as Partial<Record<string, string>>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses the new ThemeIcon component while maintaining
 * backward compatibility with the existing IconSymbol API.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight, // Ignored, but kept for API compatibility
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: any; // Kept for compatibility
}) {
  // Convert the SF Symbol name to Material Icon name
  const iconName = MAPPING[name] || 'help-outline';
  
  return (
    <ThemeIcon 
      name={iconName} 
      size={size} 
      color={typeof color === 'string' ? color : color?.toString()} 
      style={style}
      type="material" 
    />
  );
}
