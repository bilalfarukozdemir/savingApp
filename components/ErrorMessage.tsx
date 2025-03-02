import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Animated } from 'react-native';
import { useFinance } from '@/context/FinanceContext';

interface ErrorMessageProps {
  style?: object;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ style }) => {
  const { error, clearError } = useFinance();
  const [visible, setVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    if (error) {
      setVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // 4 saniye sonra hata mesajını kaldır
      const timeout = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
          clearError();
        });
      }, 4000);
      
      return () => clearTimeout(timeout);
    }
  }, [error, clearError, fadeAnim]);
  
  if (!visible || !error) {
    return null;
  }
  
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }, style]}>
      <Text style={styles.text}>{error}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    margin: 10,
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 