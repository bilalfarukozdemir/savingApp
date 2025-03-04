import React, { useState, useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  FadeIn,
  SlideInRight,
  ZoomIn,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { Card } from '@/components/ui/PaperComponents';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  index?: number; // Sıralı animasyonlar için
  animationType?: 'fade' | 'slide' | 'zoom' | 'none';
  delay?: number;
  duration?: number;
  onAnimationComplete?: () => void;
}

/**
 * Animasyonlu Card bileşeni
 * Fade, slide veya zoom animasyonu ile görünür olur
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  index = 0,
  animationType = 'fade',
  delay = 0,
  duration = 400,
  onAnimationComplete,
}) => {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  
  // Animasyon tamamlandığında çağrılacak callback
  const handleAnimationComplete = () => {
    setIsAnimationComplete(true);
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  // Animasyon tipine göre uygun komponenti döndürür
  const getAnimatedComponent = () => {
    // Animasyon gecikmesi, sıralama için index kullanılabilir
    const calculatedDelay = delay + (index * 100);
    
    switch (animationType) {
      case 'fade':
        return (
          <Animated.View 
            style={[styles.container, style]}
            entering={FadeIn.delay(calculatedDelay)
              .duration(duration)
              .easing(Easing.bezier(0.25, 0.1, 0.25, 1))
              .withCallback((finished) => {
                if (finished) {
                  runOnJS(handleAnimationComplete)();
                }
              })}
          >
            <Card style={styles.card}>
              {children}
            </Card>
          </Animated.View>
        );
        
      case 'slide':
        return (
          <Animated.View
            style={[styles.container, style]}
            entering={SlideInRight.delay(calculatedDelay)
              .duration(duration)
              .easing(Easing.bezier(0.25, 0.1, 0.25, 1))
              .withCallback((finished) => {
                if (finished) {
                  runOnJS(handleAnimationComplete)();
                }
              })}
          >
            <Card style={styles.card}>
              {children}
            </Card>
          </Animated.View>
        );
        
      case 'zoom':
        return (
          <Animated.View
            style={[styles.container, style]}
            entering={ZoomIn.delay(calculatedDelay)
              .duration(duration)
              .easing(Easing.bezier(0.25, 0.1, 0.25, 1))
              .withCallback((finished) => {
                if (finished) {
                  runOnJS(handleAnimationComplete)();
                }
              })}
          >
            <Card style={styles.card}>
              {children}
            </Card>
          </Animated.View>
        );
        
      case 'none':
      default:
        return (
          <Card style={[styles.container, style, styles.card]}>
            {children}
          </Card>
        );
    }
  };

  return getAnimatedComponent();
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginHorizontal: 8,
  },
  card: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
}); 