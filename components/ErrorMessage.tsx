import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFinance } from '@/context/FinanceContext';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutUp } from 'react-native-reanimated';
import { BodyMedium } from '@/components/ThemedText';
import { Surface } from '@/components/ui/PaperComponents';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { useTheme } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface ErrorMessageProps {
  style?: object;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ style }) => {
  const { error, clearError } = useFinance();
  const { paperTheme } = useTheme();

  // Hata mesajı görüntülendiğinde haptic feedback ver
  useEffect(() => {
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // 5 saniye sonra hata mesajını otomatik olarak kaldır
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <Animated.View
      style={[styles.container, style]}
      entering={SlideInDown.duration(300).springify()}
      exiting={SlideOutUp.duration(200)}
    >
      <Surface style={styles.errorCard}>
        <View style={styles.iconContainer}>
          <ThemeIcon
            name="error"
            type="material"
            size={20}
            color="#FFF"
          />
        </View>
        <BodyMedium style={styles.text}>{error}</BodyMedium>
      </Surface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 9999,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 500,
    width: '100%',
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    color: '#FFFFFF',
    flex: 1,
  },
}); 