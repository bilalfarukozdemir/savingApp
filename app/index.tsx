import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { 
  Button, 
  Card, 
  CardContent,
  CardActions,
  Divider 
} from '@/components/ui/PaperComponents';
import { 
  ThemedText, 
  TitleLarge, 
  BodyMedium 
} from '@/components/ThemedText';
import { router } from 'expo-router';
import { ThemeIcon } from '@/components/ui/ThemeIcon';

// Bu, uygulama ana sayfası için React Native Paper dönüşümüne bir başlangıç örneğidir
// Bu şekilde başlayabilir ve tedricen diğer bileşenleri ekleyebilirsiniz

export default function IndexPage() {
  const { theme, isDark, toggleTheme } = useTheme();
  const colors = Colors[theme];

  // Diğer fonksiyonlar ve bileşenler buraya

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TitleLarge>React Native Paper</TitleLarge>
          <BodyMedium style={styles.subtitle}>
            Bu sayfa React Native Paper kullanılarak tasarlanmıştır.
          </BodyMedium>
          
          <Button
            mode="contained"
            onPress={toggleTheme}
            style={styles.themeButton}
            icon={isDark ? "brightness-5" : "brightness-3"}
          >
            {isDark ? 'Aydınlık Tema' : 'Karanlık Tema'}
          </Button>
        </View>
        
        <Divider style={styles.divider} />
        
        <Card style={styles.card}>
          <CardContent>
            <TitleLarge style={styles.cardTitle}>
              Tema Entegrasyonu Tamamlandı
            </TitleLarge>
            <BodyMedium>
              React Native Paper temasının uygulamanın tamamında kullanılması için
              dönüşüm çalışması devam ediyor. Bu sayfa bir örnek oluşturmaktadır.
            </BodyMedium>
          </CardContent>
          <CardActions>
            <Button onPress={() => router.push('/tests')}>
              Demo Sayfasına Git
            </Button>
          </CardActions>
        </Card>
        
        {/* Diğer bileşenler buraya */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  themeButton: {
    marginTop: 16,
  },
  divider: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
}); 