import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import { 
  Card, 
  Button, 
  Surface, 
  Divider, 
  Switch,
  IconButton
} from '@/components/ui/PaperComponents';
import { 
  TitleLarge, 
  TitleMedium, 
  BodyMedium, 
  BodySmall, 
  LabelMedium, 
  LabelSmall 
} from '@/components/ThemedText';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { formatCurrency } from '@/utils';
import Animated, { FadeIn } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NewSavingsGoal() {
  const { paperTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Finance context'i kullan
  const { addSavingsGoal } = useFinance();

  // Form state'leri
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#2196F3');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [deductFromBalance, setDeductFromBalance] = useState(false);
  
  // Hata state'leri
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Tarih seçici için state'ler
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const isAndroid = Platform.OS === 'android';

  // Kategori seçenekleri
  const categories = [
    { label: 'Ev', value: 'home', color: '#4CAF50', icon: 'home' },
    { label: 'Seyahat', value: 'travel', color: '#2196F3', icon: 'airplane' },
    { label: 'Teknoloji', value: 'tech', color: '#9C27B0', icon: 'laptop' },
    { label: 'Eğitim', value: 'education', color: '#FF9800', icon: 'school' },
    { label: 'Araba', value: 'car', color: '#F44336', icon: 'car' },
    { label: 'Diğer', value: 'other', color: '#607D8B', icon: 'star' },
  ];
  
  // İkon seçenekleri (kategori dışında ek ikonlar)
  const icons = [
    'piggy-bank', 'cash-multiple', 'bank', 'wallet', 'cart', 
    'gift', 'heart', 'briefcase', 'food', 'medical-bag', 
    'tree', 'baby-face', 'book', 'cellphone', 'diamond',
    'gamepad-variant', 'music', 'movie', 'shopping', 'sale'
  ];
  
  // Renk seçenekleri
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
    '#FF5722', '#795548', '#9E9E9E', '#607D8B', '#000000'
  ];

  // Tarih seçici gösterme işlemi
  const handleShowDatePicker = () => {
    if (isAndroid) {
      // Android için DatePicker'ı göster
      setIsDatePickerVisible(true);
    } else {
      // iOS için DatePicker'ı göster (iOS'da DatePicker direkt olarak görünür)
      setIsDatePickerVisible(true);
    }
  };
  
  // Tarih değişikliği işlemi
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || targetDate || new Date();
    setIsDatePickerVisible(false);
    if (selectedDate) {
      setTargetDate(currentDate);
    }
  };

  // Kategori seçme
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    
    // Kategorinin rengini ve ikonunu varsayılan olarak ayarla
    const categoryObj = categories.find(cat => cat.value === category);
    if (categoryObj) {
      setColor(categoryObj.color);
      setIcon(categoryObj.icon);
    }
    
    // Kategori hatasını temizle
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };
  
  // İkon seçme
  const handleIconSelect = (selectedIcon: string) => {
    setIcon(selectedIcon);
  };
  
  // Renk seçme
  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
  };

  // Form doğrulama
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'Hedef ismi zorunludur';
    }
    
    if (!targetAmount || isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) <= 0) {
      newErrors.targetAmount = 'Geçerli bir hedef tutar giriniz';
    }
    
    if (currentAmount && (isNaN(parseFloat(currentAmount)) || parseFloat(currentAmount) < 0)) {
      newErrors.currentAmount = 'Geçerli bir mevcut tutar giriniz';
    }
    
    if (currentAmount && parseFloat(currentAmount) > parseFloat(targetAmount)) {
      newErrors.currentAmount = 'Mevcut tutar hedef tutardan büyük olamaz';
    }
    
    if (!selectedCategory) {
      newErrors.category = 'Lütfen bir kategori seçiniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Tasarruf hedefi ekleme
  const handleAddSavingsGoal = () => {
    if (!validateForm()) {
      return;
    }
    
    const newGoal = {
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      category: selectedCategory,
      color: color,
      icon: icon,
      targetDate: targetDate || undefined,
      deductFromBalance: currentAmount && parseFloat(currentAmount) > 0 ? deductFromBalance : false,
    };
    
    try {
      const result = addSavingsGoal(newGoal);
      
      if (result) {
        Alert.alert(
          'Başarılı',
          'Tasarruf hedefi başarıyla eklendi!',
          [
            { 
              text: 'Tamam', 
              onPress: () => router.replace('/(tabs)/savings') 
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Hata',
        error instanceof Error ? error.message : 'Bir hata oluştu',
        [{ text: 'Tamam' }]
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
      <Stack.Screen 
        options={{ 
          title: 'Yeni Tasarruf Hedefi',
          headerTintColor: paperTheme.colors.onBackground,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <Card style={styles.formCard}>
            {/* Form Başlığı */}
            <TitleMedium style={styles.formTitle}>Tasarruf Hedefi Bilgileri</TitleMedium>
            <Divider style={styles.divider} />
            
            {/* İsim Alanı */}
            <View style={styles.formGroup}>
              <LabelMedium style={styles.label}>Hedef İsmi</LabelMedium>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    borderColor: errors.name ? paperTheme.colors.error : paperTheme.colors.outline,
                    color: paperTheme.colors.onBackground,
                    backgroundColor: paperTheme.colors.surface
                  }
                ]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) {
                    setErrors(prev => ({ ...prev, name: '' }));
                  }
                }}
                placeholder="Örn: Tatil Fonu, Araba Alımı..."
                placeholderTextColor={paperTheme.colors.onSurfaceVariant}
              />
              {errors.name ? <BodySmall style={{ color: paperTheme.colors.error }}>{errors.name}</BodySmall> : null}
            </View>
            
            {/* Kategori Seçimi */}
            <View style={styles.formGroup}>
              <LabelMedium style={styles.label}>Kategori</LabelMedium>
              <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.categoryItem,
                      { 
                        borderColor: selectedCategory === category.value 
                          ? category.color 
                          : paperTheme.colors.outline,
                        backgroundColor: selectedCategory === category.value 
                          ? `${category.color}20` 
                          : paperTheme.colors.surface
                      }
                    ]}
                    onPress={() => handleCategorySelect(category.value)}
                  >
                    <ThemeIcon 
                      name={category.icon}
                      size={22}
                      color={selectedCategory === category.value ? category.color : paperTheme.colors.onSurfaceVariant}
                      type="material-community"
                      style={styles.categoryIcon}
                    />
                    <BodySmall 
                      style={[
                        styles.categoryText,
                        { 
                          color: selectedCategory === category.value 
                            ? category.color 
                            : paperTheme.colors.onBackground
                        }
                      ]}
                    >
                      {category.label}
                    </BodySmall>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.category ? <BodySmall style={{ color: paperTheme.colors.error }}>{errors.category}</BodySmall> : null}
            </View>
            
            {/* Tutar Alanları */}
            <View style={styles.formGroup}>
              <LabelMedium style={styles.label}>Hedef Tutar</LabelMedium>
              <View style={styles.currencyInputContainer}>
                <Text style={styles.currencySymbol}>₺</Text>
                <TextInput
                  style={[
                    styles.currencyInput, 
                    { 
                      borderColor: errors.targetAmount ? paperTheme.colors.error : paperTheme.colors.outline,
                      color: paperTheme.colors.onBackground,
                      backgroundColor: paperTheme.colors.surface
                    }
                  ]}
                  value={targetAmount}
                  onChangeText={(text) => {
                    setTargetAmount(text);
                    if (errors.targetAmount) {
                      setErrors(prev => ({ ...prev, targetAmount: '' }));
                    }
                  }}
                  placeholder="0.00"
                  placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                  keyboardType="numeric"
                />
              </View>
              {errors.targetAmount ? <BodySmall style={{ color: paperTheme.colors.error }}>{errors.targetAmount}</BodySmall> : null}
            </View>
            
            <View style={styles.formGroup}>
              <LabelMedium style={styles.label}>Mevcut Tutar (İsteğe Bağlı)</LabelMedium>
              <View style={styles.currencyInputContainer}>
                <Text style={styles.currencySymbol}>₺</Text>
                <TextInput
                  style={[
                    styles.currencyInput, 
                    { 
                      borderColor: errors.currentAmount ? paperTheme.colors.error : paperTheme.colors.outline,
                      color: paperTheme.colors.onBackground,
                      backgroundColor: paperTheme.colors.surface
                    }
                  ]}
                  value={currentAmount}
                  onChangeText={(text) => {
                    setCurrentAmount(text);
                    if (errors.currentAmount) {
                      setErrors(prev => ({ ...prev, currentAmount: '' }));
                    }
                  }}
                  placeholder="0.00"
                  placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                  keyboardType="numeric"
                />
              </View>
              {errors.currentAmount ? <BodySmall style={{ color: paperTheme.colors.error }}>{errors.currentAmount}</BodySmall> : null}
              
              {/* Bakiyeden düşme seçeneği */}
              {currentAmount && parseFloat(currentAmount) > 0 && (
                <View style={styles.switchContainer}>
                  <BodySmall>Mevcut bakiyeden düş</BodySmall>
                  <Switch
                    value={deductFromBalance}
                    onValueChange={setDeductFromBalance}
                  />
                </View>
              )}
            </View>
            
            {/* Hedef Tarihi */}
            <View style={styles.formGroup}>
              <LabelMedium style={styles.label}>Hedef Tarihi (İsteğe Bağlı)</LabelMedium>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  { 
                    borderColor: paperTheme.colors.outline,
                    backgroundColor: paperTheme.colors.surface
                  }
                ]}
                onPress={handleShowDatePicker}
              >
                <ThemeIcon 
                  name="calendar"
                  size={20}
                  color={paperTheme.colors.onSurfaceVariant}
                  type="material-community"
                  style={{ marginRight: 10 }}
                />
                <BodyMedium style={{ color: targetDate ? paperTheme.colors.onBackground : paperTheme.colors.onSurfaceVariant }}>
                  {targetDate ? targetDate.toLocaleDateString('tr-TR') : 'Tarih Seçin'}
                </BodyMedium>
              </TouchableOpacity>
              
              {isDatePickerVisible && (
                <DateTimePicker
                  value={targetDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
          </Card>
        </Animated.View>
        
        <Animated.View entering={FadeIn.duration(500).delay(100)}>
          <Card style={styles.formCard}>
            <TitleMedium style={styles.formTitle}>Görsel Özelleştirme</TitleMedium>
            <Divider style={styles.divider} />
            
            {/* İkon Seçimi */}
            <View style={styles.formGroup}>
              <LabelMedium style={styles.label}>Hedef İkonu</LabelMedium>
              <View style={styles.iconPreviewContainer}>
                <Surface style={[styles.iconPreview, { backgroundColor: `${color}20` }]}>
                  <ThemeIcon 
                    name={icon || 'star'}
                    size={30}
                    color={color}
                    type="material-community"
                  />
                </Surface>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.iconsScrollView}
                contentContainerStyle={styles.iconsContainer}
              >
                {icons.map((iconName) => (
                  <TouchableOpacity
                    key={iconName}
                    style={[
                      styles.iconItem,
                      { 
                        borderColor: icon === iconName ? color : 'transparent',
                        backgroundColor: icon === iconName ? `${color}20` : paperTheme.colors.surfaceVariant
                      }
                    ]}
                    onPress={() => handleIconSelect(iconName)}
                  >
                    <ThemeIcon 
                      name={iconName}
                      size={24}
                      color={icon === iconName ? color : paperTheme.colors.onSurfaceVariant}
                      type="material-community"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Renk Seçimi */}
            <View style={styles.formGroup}>
              <LabelMedium style={styles.label}>Hedef Rengi</LabelMedium>
              <View style={styles.colorsContainer}>
                {colors.map((colorOption) => (
                  <TouchableOpacity
                    key={colorOption}
                    style={[
                      styles.colorItem,
                      { 
                        backgroundColor: colorOption,
                        borderColor: color === colorOption ? paperTheme.colors.onBackground : 'transparent',
                      }
                    ]}
                    onPress={() => handleColorSelect(colorOption)}
                  />
                ))}
              </View>
            </View>
          </Card>
        </Animated.View>
        
        {/* Butonlar */}
        <View style={styles.buttonsContainer}>
          <Button 
            mode="outlined"
            onPress={() => router.back()}
            style={[styles.button, styles.cancelButton]}
          >
            İptal
          </Button>
          
          <Button 
            mode="contained"
            onPress={handleAddSavingsGoal}
            style={[styles.button, styles.saveButton, { backgroundColor: color }]}
          >
            Hedef Oluştur
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  formCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  formTitle: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 4,
    marginBottom: 8,
    width: '31%',
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
  },
  iconPreviewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconsScrollView: {
    marginHorizontal: -8,
  },
  iconsContainer: {
    paddingHorizontal: 8,
  },
  iconItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  colorItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    
  },
}); 