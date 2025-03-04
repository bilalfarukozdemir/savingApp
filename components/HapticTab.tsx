import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { Surface } from '@/components/ui/PaperComponents';
import { StyleSheet } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const { isDark } = useTheme();
  
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
      style={[
        styles.tab,
        props.accessibilityState?.selected && styles.activeTab,
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    // Minimal effect to indicate active tab beyond color
    opacity: 1,
  }
});
