import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFinance } from '@/context/FinanceContext';

export default function NewExpenseScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
          backgroundColor: colors.background,
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
      <Text style={[styles.text, { color: colors.text }]}>Yönlendiriliyor...</Text>
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
    fontSize: 16,
    marginBottom: 16
  }
}); 