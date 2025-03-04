import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, Surface, Button } from '@/components/ui/PaperComponents';
import { TitleMedium, BodyMedium } from '@/components/ThemedText';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { useTheme } from '@/context/ThemeContext';
import Animated, { FadeIn, SlideInUp, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onDismiss: () => void;
  retryAction?: () => void;
}

/**
 * Animasyonlu hata modal bileşeni
 */
export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = 'Hata',
  message,
  onDismiss,
  retryAction,
}) => {
  const { theme, paperTheme } = useTheme();
  const [internalVisible, setInternalVisible] = useState(false);
  
  // Modal görünürlüğünü ayarlamak için efekt
  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      // Hata durumunda haptic feedback verilir
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      // Modal'ın kapanma animasyonu için küçük bir gecikme
      const timer = setTimeout(() => {
        setInternalVisible(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  const handleDismiss = () => {
    onDismiss();
  };
  
  const handleRetry = () => {
    if (retryAction) {
      retryAction();
    }
    onDismiss();
  };
  
  return (
    <Modal
      visible={internalVisible}
      onDismiss={handleDismiss}
      contentContainerStyle={styles.container}
    >
      {visible && (
        <Animated.View 
          style={styles.animatedContainer}
          entering={SlideInUp.duration(300).springify()}
          exiting={FadeOut.duration(200)}
        >
          <Surface style={styles.content}>
            <View style={styles.iconContainer}>
              <ThemeIcon
                name="error-outline"
                type="material"
                size={48}
                color="#F44336"
              />
            </View>
            
            <TitleMedium style={styles.title}>{title}</TitleMedium>
            
            <BodyMedium style={styles.message}>
              {message}
            </BodyMedium>
            
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleDismiss}
                style={styles.button}
              >
                Kapat
              </Button>
              
              {retryAction && (
                <Button
                  mode="contained"
                  onPress={handleRetry}
                  style={styles.button}
                >
                  Tekrar Dene
                </Button>
              )}
            </View>
          </Surface>
        </Animated.View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  animatedContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
}); 