import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import ValidationTestScreen from '@/components/ValidationTestScreen';
import IntegrationTestScreen from '@/components/IntegrationTestScreen';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TestsScreen() {
  const [activeTest, setActiveTest] = useState<'validation' | 'integration'>('validation');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  return (
    <View style={styles.container}>
      <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
        <Button 
          title="Validasyon Testleri" 
          onPress={() => setActiveTest('validation')}
          color={activeTest === 'validation' ? colors.primary : colors.text}
        />
        <Button 
          title="Entegrasyon Testleri" 
          onPress={() => setActiveTest('integration')}
          color={activeTest === 'integration' ? colors.primary : colors.text}
        />
      </View>
      
      <ScrollView style={styles.content}>
        {activeTest === 'validation' ? (
          <ValidationTestScreen />
        ) : (
          <IntegrationTestScreen />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  content: {
    flex: 1,
  }
}); 