import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { TitleLarge } from '@/components/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import ThemeDemoScreen from '@/components/ThemeDemoScreen';
import { Button } from '@/components/ui/PaperComponents';

export default function TestsScreen() {
  const { theme, isDark } = useTheme();
  const colors = Colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TitleLarge style={styles.title}>React Native Paper Test Sayfası</TitleLarge>
      
      <Button
        mode="contained"
        onPress={() => {}}
        style={styles.button}
      >
        React Native Paper Entegre Edildi
      </Button>
      
      <ScrollView style={styles.scrollView}>
        <ThemeDemoScreen />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    padding: 16,
  },
  button: {
    margin: 16,
  },
  scrollView: {
    flex: 1,
  }
}); 