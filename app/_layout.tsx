import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
      <Stack initialRouteName="index">
        {/* Ana sayfa index.tsx'te yönlendirme yapılacak */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            headerShown: false,
            animation: 'fade' 
          }} 
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FinanceProvider>
          <RootLayoutNav />
          <StatusBar style="auto" />
          <ErrorMessage />
        </FinanceProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
