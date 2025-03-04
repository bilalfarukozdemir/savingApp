/**
 * Tema Demo Ekranı
 * Bu bileşen, React Native Paper entegrasyonunu ve özelleştirilmiş tema bileşenlerini gösterir
 */

import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ThemedText, TitleLarge, BodyMedium, BodySmall, LabelMedium } from './ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { ThemeIcon, IconColors } from './ui/ThemeIcon';
import {
  Button,
  Card,
  CardTitle,
  CardContent,
  CardActions,
  TextInput,
  Checkbox,
  Chip,
  Divider,
  Surface,
  Switch,
  List,
  ListItem
} from './ui/PaperComponents';

export const ThemeDemoScreen: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const themeColors = Colors[theme];
  
  // Demo durumları
  const [inputText, setInputText] = useState('');
  const [checked, setChecked] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.section}>
        <TitleLarge style={styles.header}>Tema Sistemi Demo</TitleLarge>
        <BodyMedium>
          Bu ekran, React Native Paper entegrasyonunu ve yeni tema bileşenlerini göstermektedir.
        </BodyMedium>
        
        <View style={styles.themeRow}>
          <ThemedText>Mevcut Tema: {theme}</ThemedText>
          <Button onPress={toggleTheme}>
            {isDark ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
          </Button>
        </View>
      </View>
      
      <Divider style={styles.divider} />
      
      {/* Tipografi Örnekleri */}
      <Surface style={styles.section}>
        <TitleLarge>Tipografi</TitleLarge>
        
        <ThemedText variant="displayLarge">Display Large</ThemedText>
        <ThemedText variant="displayMedium">Display Medium</ThemedText>
        <ThemedText variant="displaySmall">Display Small</ThemedText>
        <ThemedText variant="headlineLarge">Headline Large</ThemedText>
        <ThemedText variant="headlineMedium">Headline Medium</ThemedText>
        <ThemedText variant="headlineSmall">Headline Small</ThemedText>
        <ThemedText variant="titleLarge">Title Large</ThemedText>
        <ThemedText variant="titleMedium">Title Medium</ThemedText>
        <ThemedText variant="titleSmall">Title Small</ThemedText>
        <ThemedText variant="bodyLarge">Body Large - Ana metin paragrafları için</ThemedText>
        <ThemedText variant="bodyMedium">Body Medium - Standart metin için</ThemedText>
        <ThemedText variant="bodySmall">Body Small - Küçük detay metinleri</ThemedText>
        <ThemedText variant="labelLarge">Label Large</ThemedText>
        <ThemedText variant="labelMedium">Label Medium</ThemedText>
        <ThemedText variant="labelSmall">Label Small</ThemedText>
      </Surface>
      
      <Divider style={styles.divider} />
      
      {/* Buton Örnekleri */}
      <Surface style={styles.section}>
        <TitleLarge>Butonlar</TitleLarge>
        
        <View style={styles.row}>
          <Button mode="contained" onPress={() => console.log('Contained')}>
            Contained
          </Button>
        </View>
        
        <View style={styles.row}>
          <Button mode="outlined" onPress={() => console.log('Outlined')}>
            Outlined
          </Button>
        </View>
        
        <View style={styles.row}>
          <Button mode="text" onPress={() => console.log('Text')}>
            Text
          </Button>
        </View>
        
        <View style={styles.row}>
          <Button 
            mode="contained-tonal" 
            icon="star"
            onPress={() => console.log('Contained Tonal')}
          >
            Icon Button
          </Button>
        </View>
        
        <View style={styles.row}>
          <Button 
            mode="contained" 
            disabled
            onPress={() => console.log('Disabled')}
          >
            Disabled
          </Button>
        </View>
        
        <View style={styles.row}>
          <Button 
            mode="contained" 
            loading
            onPress={() => console.log('Loading')}
          >
            Loading
          </Button>
        </View>
      </Surface>
      
      <Divider style={styles.divider} />
      
      {/* Kart Örnekleri */}
      <View style={styles.section}>
        <TitleLarge>Kartlar</TitleLarge>
        
        <Card style={styles.card}>
          <CardTitle 
            title="Kart Başlığı" 
            subtitle="Alt başlık" 
            left={(props) => <ThemeIcon name="credit-card" size={24} />}
          />
          <CardContent>
            <BodyMedium>
              Bu bir örnek kart içeriğidir. Kartlar genellikle ilgili bilgileri gruplamak için kullanılır.
            </BodyMedium>
          </CardContent>
          <CardActions>
            <Button onPress={() => console.log('Vazgeç')}>Vazgeç</Button>
            <Button mode="contained" onPress={() => console.log('Tamam')}>Tamam</Button>
          </CardActions>
        </Card>
        
        <Card style={styles.card} mode="outlined">
          <CardTitle 
            title="Outlined Kart" 
          />
          <CardContent>
            <BodyMedium>
              Bu bir çerçeveli kart örneğidir. Arka plan yerine kenarlıkla tanımlanır.
            </BodyMedium>
          </CardContent>
        </Card>
      </View>
      
      <Divider style={styles.divider} />
      
      {/* Giriş Alanları */}
      <Surface style={styles.section}>
        <TitleLarge>Giriş Alanları</TitleLarge>
        
        <TextInput
          label="Normal Giriş"
          placeholder="Bir şeyler yazın"
          value={inputText}
          onChangeText={setInputText}
          style={styles.input}
        />
        
        <TextInput
          label="Şifre Girişi"
          placeholder="Şifrenizi girin"
          value={inputText}
          onChangeText={setInputText}
          secureTextEntry
          style={styles.input}
        />
        
        <TextInput
          label="Hatalı Giriş"
          placeholder="Hatalı giriş örneği"
          value={inputText}
          onChangeText={setInputText}
          error={true}
          style={styles.input}
        />
        
        <TextInput
          label="Devre Dışı Giriş"
          placeholder="Bu alan devre dışı"
          value="Değiştirilemez değer"
          onChangeText={setInputText}
          disabled
          style={styles.input}
        />
      </Surface>
      
      <Divider style={styles.divider} />
      
      {/* Diğer Bileşenler */}
      <Surface style={styles.section}>
        <TitleLarge>Diğer Bileşenler</TitleLarge>
        
        <View style={styles.row}>
          <LabelMedium>Onay Kutusu:</LabelMedium>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={() => setChecked(!checked)}
          />
        </View>
        
        <View style={styles.row}>
          <LabelMedium>Anahtar:</LabelMedium>
          <Switch
            value={switchValue}
            onValueChange={setSwitchValue}
          />
        </View>
        
        <View style={styles.chipContainer}>
          <Chip icon="check" onPress={() => console.log('Pressed')}>Standart Chip</Chip>
          <Chip icon="account" selected onPress={() => console.log('Selected')}>Seçili Chip</Chip>
          <Chip disabled onPress={() => console.log('Disabled')}>Devre Dışı</Chip>
        </View>
      </Surface>
      
      <Divider style={styles.divider} />
      
      {/* İkonlar */}
      <Surface style={styles.section}>
        <TitleLarge>İkonlar</TitleLarge>
        
        <View style={styles.iconGrid}>
          <View style={styles.iconItem}>
            <ThemeIcon name="home" type="material" size={24} />
            <BodySmall>material</BodySmall>
          </View>
          
          <View style={styles.iconItem}>
            <ThemeIcon name="bell" type="font-awesome" size={24} />
            <BodySmall>font-awesome</BodySmall>
          </View>
          
          <View style={styles.iconItem}>
            <ThemeIcon name="heart" type="font-awesome5" size={24} />
            <BodySmall>font-awesome5</BodySmall>
          </View>
          
          <View style={styles.iconItem}>
            <ThemeIcon name="settings-outline" type="ionicons" size={24} />
            <BodySmall>ionicons</BodySmall>
          </View>
          
          <View style={styles.iconItem}>
            <ThemeIcon name="credit-card" type="feather" size={24} />
            <BodySmall>feather</BodySmall>
          </View>
          
          <View style={styles.iconItem}>
            <ThemeIcon name="star" type="entypo" size={24} />
            <BodySmall>entypo</BodySmall>
          </View>
          
          <View style={styles.iconItem}>
            <ThemeIcon name="github" type="antdesign" size={24} />
            <BodySmall>antdesign</BodySmall>
          </View>
          
          <View style={styles.iconItem}>
            <ThemeIcon 
              name="check-circle" 
              type="material" 
              size={24} 
              color={IconColors.success(isDark)} 
            />
            <BodySmall>success</BodySmall>
          </View>
          
          <View style={styles.iconItem}>
            <ThemeIcon 
              name="warning" 
              type="material" 
              size={24} 
              color={IconColors.warning(isDark)} 
            />
            <BodySmall>warning</BodySmall>
          </View>
          
          <View style={styles.iconItem}>
            <ThemeIcon 
              name="error" 
              type="material" 
              size={24} 
              color={IconColors.error(isDark)} 
            />
            <BodySmall>error</BodySmall>
          </View>
        </View>
      </Surface>
      
      <Divider style={styles.divider} />
      
      {/* Liste Bileşenleri */}
      <Surface style={styles.section}>
        <TitleLarge>Liste Bileşenleri</TitleLarge>
        
        <List>
          <ListItem
            title="Liste Öğesi 1"
            description="Bu bir açıklama metnidir"
            left={props => <ThemeIcon name="folder" size={24} />}
            onPress={() => console.log('Liste Öğesi 1')}
          />
          
          <ListItem
            title="Liste Öğesi 2"
            description="İkinci öğe açıklaması"
            left={props => <ThemeIcon name="file-document" type="material-community" size={24} />}
            right={props => <ThemeIcon name="arrow-right" size={24} />}
            onPress={() => console.log('Liste Öğesi 2')}
          />
          
          <ListItem
            title="Liste Öğesi 3"
            description="Üçüncü öğe açıklaması"
            left={props => <ThemeIcon name="star" size={24} />}
            onPress={() => console.log('Liste Öğesi 3')}
          />
        </List>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
  },
  header: {
    marginBottom: 16,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
  card: {
    marginVertical: 8,
  },
  input: {
    marginVertical: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  iconItem: {
    alignItems: 'center',
    margin: 8,
    width: 60,
  },
});

export default ThemeDemoScreen; 