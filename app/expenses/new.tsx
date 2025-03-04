import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { ActivityIndicator } from '@/components/ui/PaperComponents';
import { BodyMedium } from '@/components/ThemedText';

export default function NewExpenseScreen() {
  const { paperTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showExpenseModal } = useFinance();

  React.useEffect(() => {
    // Harcama ekleme modalını göster ve ana sayfaya dön
    showExpenseModal();
    router.replace('/(tabs)');
  }, [router, showExpenseModal]);

  return (
    <View 
      style={[
        styles.container, 
        { 
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right
        }
      ]}
    >
      <Stack.Screen 
        options={{ 
          title: 'Yeni Harcama',
          headerShown: false 
        }} 
      />
      <ActivityIndicator animating={true} size="large" />
      <BodyMedium style={styles.text}>Yönlendiriliyor...</BodyMedium>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 16
  }
}); 