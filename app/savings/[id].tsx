import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SavingsGoalDetail() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  React.useEffect(() => {
    // Bu sayfaya geldiğinde otomatik olarak ana sayfaya yönlendir
    // ve oradaki hedefi görüntülemek için id parametresi ekle
    router.replace({
      pathname: '/(tabs)/savings',
      params: { action: 'viewGoal', id }
    });
  }, [router, id]);

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
          title: 'Tasarruf Hedefi',
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