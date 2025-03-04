import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { 
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';

import { useColorScheme } from '@/hooks/useColorScheme';
import { FinanceProvider } from '@/context/FinanceContext';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Layout navigator
function RootLayoutNav() {
  const { isDark } = useTheme();
  
  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          // Gelişmiş geçiş animasyonu ayarları
          animation: 'slide_from_right',
          presentation: 'card',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animationTypeForReplace: 'push',
          // Animasyon süresi azaltılarak daha hızlı ve akıcı geçişler sağlanır
          animationDuration: 250,
          // Dokunmatik geri gitme (swipe back) hareketini iyileştirme
          fullScreenGestureEnabled: true,
        }}
      >
        {/* Ana sayfa index.tsx'te yönlendirme yapılacak */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            headerShown: false,
            animation: 'fade',
            presentation: 'transparentModal'
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            // Tab'a geçerken aşağıdan yukarı kaydırma efekti
            animation: 'slide_from_bottom',
            presentation: 'card'
          }} 
        />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  // SpaceMono yazı tipi için
  const [spaceMono] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Inter yazı tipleri için
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (spaceMono && interLoaded) {
      SplashScreen.hideAsync();
    }
  }, [spaceMono, interLoaded]);

  if (!spaceMono || !interLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <FinanceProvider>
            <RootLayoutNav />
            <StatusBar style="auto" />
            <ErrorMessage />
          </FinanceProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
