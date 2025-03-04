import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, FlatList, Dimensions, ScrollView, SafeAreaView, Platform, Pressable, Alert, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeIn, ZoomIn, SlideInRight, runOnJS } from 'react-native-reanimated';
import PieChart from 'react-native-pie-chart/v3api';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useFinance } from '@/context/FinanceContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { 
  Card, 
  Button, 
  IconButton, 
  Surface, 
  ProgressBar,
  Checkbox,
  Divider,
  Chip,
  CardContent,
  FAB
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
import { SavingsGoal } from '@/utils/models/types';
import { Switch as PaperSwitch } from 'react-native-paper';

const { width: screenWidth } = Dimensions.get('window');

// Hedef için genişletilmiş tip (bildirim özelliklerini içeren)
interface ExtendedSavingsGoal extends SavingsGoal {
  notificationsEnabled?: boolean;
  notificationThreshold?: number;
}

// Tasarruf hedefi kartı bileşeni
const SavingsGoalCard = ({ 
  goal, 
  onAddFunds, 
  onWithdrawFunds 
}: { 
  goal: SavingsGoal; 
  onAddFunds: (id: string) => void; 
  onWithdrawFunds: (id: string) => void; 
}) => {
  const { paperTheme } = useTheme();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  
  // Genişletilmiş hedef nesnesini tip olarak belirt
  const extendedGoal = goal as ExtendedSavingsGoal;
  const [notificationEnabled, setNotificationEnabled] = useState(extendedGoal.notificationsEnabled || false);
  const [notificationThreshold, setNotificationThreshold] = useState(extendedGoal.notificationThreshold || 90);
  
  // Animasyon için gereken değerleri sabitlerle tanımlayalım
  const currentAmount = goal.currentAmount;
  const targetAmount = goal.targetAmount;
  const goalColor = goal.color;
  
  // Hedefin tamamlanma yüzdesi
  const progressPercentage = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
  const progressValue = currentAmount / targetAmount;
  
  // Kalan miktar
  const remainingAmount = targetAmount - currentAmount;
  
  // Hedef tarihine olan süreyi hesapla
  const calculateTimeToTarget = () => {
    if (!goal.targetDate) return null;
    
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    
    // Eğer hedef tarih geçmişse null döndür
    if (targetDate < today) return null;
    
    // İki tarih arasındaki gün farkını hesapla
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Haftalık ve aylık tasarruf önerilerini hesapla
  const calculateSavingSuggestions = () => {
    // Eğer hedef tarihi yoksa varsayılan olarak 1 yıllık süre kullan
    const remainingDays = goal.targetDate ? calculateTimeToTarget() : 365;
    
    if (!remainingDays || remainingDays <= 0) return null;
    
    const remainingWeeks = Math.ceil(remainingDays / 7);
    const remainingMonths = Math.ceil(remainingDays / 30);
    
    const weeklyAmount = remainingAmount / remainingWeeks;
    const monthlyAmount = remainingAmount / remainingMonths;
    
    return {
      weekly: weeklyAmount,
      monthly: monthlyAmount,
      days: remainingDays
    };
  };
  
  const savingSuggestions = calculateSavingSuggestions();
  const timeToTarget = calculateTimeToTarget();
  
  // Her kart için kendi animasyon hook'unu kullan
  const animatedStyle = useAnimatedStyle(() => {
    const progress = currentAmount / targetAmount;
    return {
      width: withTiming(`${Math.min(progress * 100, 100)}%`, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      height: '100%',
      backgroundColor: goalColor,
      borderRadius: 4,
    };
  }, [currentAmount, targetAmount, goalColor]); // Bağımlılıkları belirt

  // Bildirim ayarlarını kaydet
  const saveNotificationSettings = () => {
    // Buraya bildirim ayarlarını kaydetme mantığı eklenmeli
    // Bu fonksiyon FinanceContext içinde tanımlanmalı
    alert('Bildirim ayarları kaydedildi');
    setShowNotificationSettings(false);
  };

  return (
    <Animated.View entering={FadeIn.duration(800).delay(300)}>
      <Card style={styles.goalCard}>
        <CardContent>
          <View style={styles.goalHeader}>
            <TitleMedium>{goal.name}</TitleMedium>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                onPress={() => setShowNotificationSettings(!showNotificationSettings)}
                style={{ marginRight: 8 }}
              >
                <ThemeIcon 
                  name={notificationEnabled ? "bell" : "bell-off"} 
                  size={20} 
                  color={notificationEnabled ? goalColor : paperTheme.colors.onSurfaceVariant} 
                  type="material-community" 
                />
              </TouchableOpacity>
              <Surface style={[styles.goalIconContainer, { backgroundColor: `${goalColor}30` }]}>
                <ThemeIcon 
                  name={goal.icon || 'star'} 
                  size={20} 
                  color={goalColor} 
                  type="material-community" 
                />
              </Surface>
            </View>
          </View>
          
          {/* Bildirim Ayarları */}
          {showNotificationSettings && (
            <View style={styles.notificationSettingsContainer}>
              <Divider style={{ marginVertical: 8 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <BodyMedium>Bildirimler</BodyMedium>
                <PaperSwitch
                  value={notificationEnabled}
                  onValueChange={setNotificationEnabled}
                />
              </View>
              
              {notificationEnabled && (
                <>
                  <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant, marginTop: 8 }}>
                    Hedefin yüzdesi ne zaman bildirim gönderilsin?
                  </LabelSmall>
                  
                  <View style={{ flexDirection: 'row', marginTop: 8, justifyContent: 'space-between' }}>
                    {[25, 50, 75, 90, 100].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.thresholdButton,
                          { 
                            backgroundColor: notificationThreshold === value 
                              ? `${goalColor}30` 
                              : paperTheme.colors.surfaceVariant 
                          }
                        ]}
                        onPress={() => setNotificationThreshold(value)}
                      >
                        <BodySmall style={{ color: notificationThreshold === value ? goalColor : paperTheme.colors.onSurfaceVariant }}>
                          %{value}
                        </BodySmall>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <Button 
                    mode="contained" 
                    onPress={saveNotificationSettings}
                    style={[styles.saveNotificationButton, { backgroundColor: goalColor }]}
                    labelStyle={{ fontSize: 14 }}
                  >
                    Kaydet
                  </Button>
                </>
              )}
              <Divider style={{ marginVertical: 8 }} />
            </View>
          )}
          
          <View style={styles.goalAmountsContainer}>
            <View style={styles.goalAmountItem}>
              <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>Hedef</LabelSmall>
              <BodyMedium>{formatCurrency(targetAmount)}</BodyMedium>
            </View>
            
            <View style={styles.goalAmountItem}>
              <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>Mevcut</LabelSmall>
              <BodyMedium>{formatCurrency(currentAmount)}</BodyMedium>
            </View>
            
            <View style={styles.goalAmountItem}>
              <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>Kalan</LabelSmall>
              <BodyMedium>{formatCurrency(remainingAmount)}</BodyMedium>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progressValue} 
              color={goalColor} 
              style={styles.progressBar} 
            />
            <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 4 }}>
              %{progressPercentage} tamamlandı
            </LabelSmall>
          </View>
          
          {/* Analiz Bölümü - Tıklandığında açılıp kapanır */}
          <TouchableOpacity 
            style={styles.analysisToggle}
            onPress={() => setShowAnalysis(!showAnalysis)}
          >
            <LabelSmall style={{ color: paperTheme.colors.primary }}>
              {showAnalysis ? 'Analizi Gizle' : 'Tasarruf Analizi Göster'}
            </LabelSmall>
            <ThemeIcon 
              name={showAnalysis ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={paperTheme.colors.primary} 
              type="material-community" 
            />
          </TouchableOpacity>
          
          {showAnalysis && (
            <View style={styles.analysisContainer}>
              <Divider style={{ marginVertical: 8 }} />
              
              <View style={styles.analysisRow}>
                <View style={styles.analysisItem}>
                  <ThemeIcon 
                    name="calendar-clock" 
                    size={18} 
                    color={paperTheme.colors.primary} 
                    type="material-community" 
                  />
                  <View style={{ marginLeft: 8 }}>
                    <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      {goal.targetDate ? 'Kalan Süre' : 'Hedef Tarihi Yok'}
                    </LabelSmall>
                    {goal.targetDate ? (
                      <BodyMedium>
                        {timeToTarget} gün
                      </BodyMedium>
                    ) : (
                      <BodyMedium>Belirlenmemiş</BodyMedium>
                    )}
                  </View>
                </View>
                
                <View style={styles.analysisItem}>
                  <ThemeIcon 
                    name="calendar-month" 
                    size={18} 
                    color={paperTheme.colors.primary} 
                    type="material-community" 
                  />
                  <View style={{ marginLeft: 8 }}>
                    <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      Hedef Tarihi
                    </LabelSmall>
                    <BodyMedium>
                      {goal.targetDate 
                        ? new Date(goal.targetDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) 
                        : 'Belirlenmemiş'
                      }
                    </BodyMedium>
                  </View>
                </View>
              </View>
              
              {savingSuggestions && (
                <View style={styles.savingSuggestionsContainer}>
                  <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant, marginBottom: 8 }}>
                    Hedefe Ulaşma Önerileri
                  </LabelSmall>
                  
                  <View style={styles.savingSuggestionRow}>
                    <View style={styles.savingSuggestionItem}>
                      <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>Aylık Tasarruf</LabelSmall>
                      <BodyMedium style={{ color: goalColor, fontWeight: 'bold' }}>
                        {formatCurrency(savingSuggestions.monthly)}
                      </BodyMedium>
                    </View>
                    
                    <View style={styles.savingSuggestionItem}>
                      <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>Haftalık Tasarruf</LabelSmall>
                      <BodyMedium style={{ color: goalColor, fontWeight: 'bold' }}>
                        {formatCurrency(savingSuggestions.weekly)}
                      </BodyMedium>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.goalActions}>
            <Button 
              mode="outlined" 
              icon="plus"
              onPress={() => onAddFunds(goal.id)}
              style={[styles.goalActionButton, { borderColor: '#4CAF50' }]}
              textColor="#4CAF50"
            >
              Para Ekle
            </Button>
            
            <Button 
              mode="outlined" 
              icon="minus"
              onPress={() => onWithdrawFunds(goal.id)}
              style={[styles.goalActionButton, { borderColor: '#F44336' }]}
              textColor="#F44336"
            >
              Para Çek
            </Button>
          </View>
        </CardContent>
      </Card>
    </Animated.View>
  );
};

export default function TabTwoScreen() {
  const { theme, paperTheme } = useTheme();
  const insets = useSafeAreaInsets();
  
  // URL parametrelerini al
  const { action, id } = useLocalSearchParams<{ action?: string, id?: string }>();
  
  // Finance context'i kullan
  const { 
    savingsGoals, 
    addSavingsGoal, 
    addFundsToGoal, 
    withdrawFundsFromGoal,
    calculateGoalProgress,
    calculateRemainingAmount,
    calculateEstimatedTime,
    calculateOverallSavingsProgress,
    hasSavingsData,
    markDataAsSeen
  } = useFinance();
  
  // Veri durumunu kontrol et
  const hasGoals = savingsGoals.length > 0;
  const hasSeenGoals = hasSavingsData();
  
  // İlk gösterim için state
  const [showTutorial, setShowTutorial] = useState(hasGoals && !hasSeenGoals);
  
  // Bottom sheet ref'leri
  const newGoalBottomSheetRef = useRef<BottomSheet>(null);
  const fundBottomSheetRef = useRef<BottomSheet>(null);
  
  // Bottom sheet snap noktaları
  const snapPoints = ['50%', '80%'];
  
  // Modal durumları - artık görünürlük yerine bottom sheet açma/kapama durumları
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedGoalName, setSelectedGoalName] = useState<string>('');
  const [isAddingFunds, setIsAddingFunds] = useState(true);
  
  // Yeni hedef için form değerleri
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalCurrentAmount, setNewGoalCurrentAmount] = useState('');
  const [deductFromBalance, setDeductFromBalance] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [fundAmount, setFundAmount] = useState('');
  
  // İşlem geçmişi state'i
  const [transactionHistory, setTransactionHistory] = useState<{
    id: string,
    goalId: string,
    amount: number,
    description?: string,
    isAddition: boolean,
    date: Date
  }[]>([]);
  
  // Toplam tasarruf ve hedef
  const [totalSavings, setTotalSavings] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);

  // Platform kontrolü
  const isAndroid = Platform.OS === 'android';

  // DateTimePicker için state
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Kategori seçenekleri
  const categories = [
    { label: 'Ev', value: 'home', color: '#4CAF50', icon: 'home' },
    { label: 'Seyahat', value: 'travel', color: '#2196F3', icon: 'airplane' },
    { label: 'Teknoloji', value: 'tech', color: '#9C27B0', icon: 'laptop' },
    { label: 'Eğitim', value: 'education', color: '#FF9800', icon: 'school' },
    { label: 'Araba', value: 'car', color: '#F44336', icon: 'car' },
    { label: 'Diğer', value: 'other', color: '#607D8B', icon: 'star' },
  ];

  // Tarih seçici gösterme işlemi
  const handleShowDatePicker = () => {
    if (isAndroid) {
      // Android için doğrudan tarih seçiciyi göster
      setIsDatePickerVisible(true);
    } else {
      // iOS için tarih seçiciyi göster
      setShowDatePicker(true);
    }
  };
  
  // Tarih değişikliği işlemi
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || targetDate || new Date();
    setIsDatePickerVisible(false);
    setShowDatePicker(false);
    if (selectedDate) {
      setTargetDate(currentDate);
    }
  };
  
  // Para ekleme/çekme işlemi
  const handleAddFunds = (goalId: string) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal) {
      setSelectedGoalId(goalId);
      setSelectedGoalName(goal.name);
      setIsAddingFunds(true);
      fundBottomSheetRef.current?.expand();
    }
  };
  
  const handleWithdrawFunds = (goalId: string) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal) {
      setSelectedGoalId(goalId);
      setSelectedGoalName(goal.name);
      setIsAddingFunds(false);
      fundBottomSheetRef.current?.expand();
    }
  };
  
  // Hızlı miktar seçimi
  const selectQuickAmount = (amount: number) => {
    setFundAmount(amount.toString());
  };
  
  // Para ekleme/çekme işlemi uygulama
  const processFundAction = () => {
    if (!selectedGoalId || !fundAmount) return;
    
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    try {
      if (isAddingFunds) {
        addFundsToGoal(selectedGoalId, amount);
      } else {
        withdrawFundsFromGoal(selectedGoalId, amount);
      }
      
      // İşlem başarılı olduğunda
      fundBottomSheetRef.current?.close();
      
      // İşlem geçmişine ekle
      const newTransaction = {
        id: Date.now().toString(),
        goalId: selectedGoalId,
        amount: amount,
        isAddition: isAddingFunds,
        date: new Date()
      };
      
      setTransactionHistory([newTransaction, ...transactionHistory]);
      
    } catch (error) {
      // Hata durumunda kullanıcıya bilgi ver
      alert(error instanceof Error ? error.message : 'Bir hata oluştu');
    }
  };
  
  // İşlemi geri alma
  const undoTransaction = (transactionId: string) => {
    const transaction = transactionHistory.find(t => t.id === transactionId);
    if (!transaction) return;
    
    try {
      if (transaction.isAddition) {
        // Ekleme işlemini geri al (para çek)
        withdrawFundsFromGoal(transaction.goalId, transaction.amount);
      } else {
        // Çekme işlemini geri al (para ekle)
        addFundsToGoal(transaction.goalId, transaction.amount);
      }
      
      // İşlemi geçmişten kaldır
      setTransactionHistory(transactionHistory.filter(t => t.id !== transactionId));
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'İşlem geri alınamadı');
    }
  };

  // Bottom sheet için callback fonksiyonları
  const handleNewGoalSheetChanges = useCallback((index: number) => {
    setNewGoalOpen(index > -1);
    if (index === -1) {
      // Bottom sheet kapandığında formu sıfırla
      resetForm();
    }
  }, []);

  const handleFundSheetChanges = useCallback((index: number) => {
    setFundOpen(index > -1);
    if (index === -1) {
      // Bottom sheet kapandığında formu sıfırla
      setFundAmount('');
      setSelectedGoalId(null);
      setSelectedGoalName('');
      setIsAddingFunds(true);
    }
  }, []);

  // Bottom sheet backdrop bileşeni
  const renderBackdrop = useCallback((props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.9}
    />
  ), []);

  // Form alanlarını temizleme
  const resetForm = () => {
    setNewGoalName('');
    setNewGoalAmount('');
    setNewGoalCurrentAmount('');
    setDeductFromBalance(false);
    setSelectedCategory('');
    setTargetDate(null);
    setFormErrors({});
  };

  // Form doğrulama
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!newGoalName.trim()) {
      errors.name = 'Hedef ismi boş olamaz';
    }
    
    const amount = parseFloat(newGoalAmount);
    if (isNaN(amount) || amount <= 0) {
      errors.targetAmount = 'Geçerli bir hedef tutar giriniz';
    }
    
    const currentAmount = parseFloat(newGoalCurrentAmount);
    if (newGoalCurrentAmount && (isNaN(currentAmount) || currentAmount < 0)) {
      errors.currentAmount = 'Geçerli bir mevcut tutar giriniz';
    }
    
    if (currentAmount > amount) {
      errors.currentAmount = 'Mevcut tutar hedef tutardan büyük olamaz';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Yeni hedef ekleme
  const addNewGoal = () => {
    if (!validateForm()) {
      return;
    }
    
    const targetAmount = parseFloat(newGoalAmount);
    const currentAmount = parseFloat(newGoalCurrentAmount) || 0;
    
    // Seçilen kategorinin rengini bul
    const selectedCategoryObj = categories.find(cat => cat.value === selectedCategory);
    const categoryColor = selectedCategoryObj ? selectedCategoryObj.color : '#2196F3';
    
    const newGoal = {
      name: newGoalName.trim(),
      targetAmount: targetAmount,
      currentAmount: currentAmount,
      color: categoryColor,
      category: selectedCategory,
      targetDate: targetDate || undefined,
      deductFromBalance: currentAmount > 0 ? deductFromBalance : false,
    };
    
    const result = addSavingsGoal(newGoal);
    
    if (result) {
      // Formu temizle
      resetForm();
      // Bottom sheet'i kapat
      newGoalBottomSheetRef.current?.close();
      
      // Bildirim göster
      Alert.alert('Başarılı', 'Tasarruf hedefi başarıyla eklendi!');
    } else {
      Alert.alert('Hata', 'Tasarruf hedefi eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Pie chart için veri hazırlama 
  const pieChartSize = screenWidth < 380 ? 150 : 180;
  const pieChartData = savingsGoals.length > 0 
    ? savingsGoals.map(goal => goal.currentAmount) 
    : [1];
  const pieChartColors = savingsGoals.length > 0 
    ? savingsGoals.map(goal => goal.color) 
    : ['#E0E0E0'];
  
  const hasPieChartData = savingsGoals.some(goal => goal.currentAmount > 0);
  const safePieChartData = hasPieChartData ? pieChartData : [1];
  const safePieChartColors = hasPieChartData ? pieChartColors : ['#E0E0E0'];
  
  // Toplam tasarruf ve hedef tutarlarını hesapla
  useEffect(() => {
    if (savingsGoals.length > 0) {
      const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
      const totalGoal = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
      
      setTotalSavings(totalSaved);
      setTotalTarget(totalGoal);
    } else {
      setTotalSavings(0);
      setTotalTarget(0);
    }
  }, [savingsGoals]);

  // URL parametrelerine göre modal aç
  useEffect(() => {
    if (action === 'newGoal') {
      // Yeni hedef ekleme modalı aç
      newGoalBottomSheetRef.current?.expand();
    } else if (action === 'viewGoal' && id) {
      // Belirli bir hedefin detayını görüntüle
      const goalToView = savingsGoals.find(g => g.id === id);
      if (goalToView) {
        setSelectedGoalId(id);
        setSelectedGoalName(goalToView.name);
        setIsAddingFunds(true); // Varsayılan olarak para ekleme seçili
        fundBottomSheetRef.current?.expand();
      }
    }
  }, [action, id, savingsGoals]);

  // Sıralama modu state'i
  const [reorderMode, setReorderMode] = useState(false);

  // Sürükle-bırak işlemi için sıralama state'i
  const [orderedGoals, setOrderedGoals] = useState<SavingsGoal[]>([]);

  // Arayüz öğelerini kullanıcı hareketlerine göre güncellemek için state'ler
  const activeIndexValue = useSharedValue(-1); // Sürüklenen öğenin indeksi

  // savingsGoals değiştiğinde orderedGoals'ı güncelle
  useEffect(() => {
    setOrderedGoals([...savingsGoals]);
  }, [savingsGoals]);

  // Sürükleme başladığında
  const onDragStart = (index: number) => {
    // Aktif indeksi güncelle
    activeIndexValue.value = index;
  };

  // Sürükleme sırasında pozisyon değişince
  const onDragPositionChange = (fromIndex: number, toIndex: number) => {
    // Eğer indisler aynıysa veya geçersizse işlem yapma
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
        fromIndex >= orderedGoals.length || toIndex >= orderedGoals.length) {
      return;
    }

    // Sıralamayı güncelle
    const newGoals = [...orderedGoals];
    const item = newGoals.splice(fromIndex, 1)[0]; // Taşınan öğeyi kaldır
    newGoals.splice(toIndex, 0, item); // Yeni konuma ekle
    
    setOrderedGoals(newGoals);
    activeIndexValue.value = toIndex;
  };

  // Sürükleme bittiğinde
  const onDragEnd = () => {
    // Aktif indeksi sıfırla
    activeIndexValue.value = -1;
    
    // Sıralamayı kaydet
    reorderGoals(orderedGoals);
  };
  
  // Sıralama modunu değiştir
  const toggleReorderMode = () => {
    if (reorderMode) {
      // Sıralama modundan çıkılıyor, değişiklikleri kaydet
      reorderGoals(orderedGoals);
      setReorderMode(false);
    } else {
      // Sıralama moduna giriliyor
      setReorderMode(true);
    }
  };

  // Sıralama fonksiyonu
  const reorderGoals = (newOrder: SavingsGoal[]) => {
    // Burada normalde context'e erişip sıralamayı kaydetmek gerekiyor
    // Şimdilik sadece konsola log
    console.log('Hedefler yeniden sıralandı', newOrder.map(g => g.id));
    // TODO: FinanceContext'e reorderSavingsGoals fonksiyonu eklendikten sonra bu kısmı güncelleyin
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer, 
          { paddingTop: insets.top }
        ]}
        showsVerticalScrollIndicator={false}
      >      
        {/* Tasarruf Hedefleri Başlığı */}
        <Animated.View
          entering={SlideInRight.duration(600).delay(500)}
          style={styles.sectionHeader}
        >
          <TitleLarge>Tasarruf Hedefleri</TitleLarge>
          <View style={{ flexDirection: 'row' }}>
            {hasGoals && (
              <Button 
                mode="outlined" 
                onPress={toggleReorderMode}
                icon={reorderMode ? "check" : "sort"}
                style={[styles.reorderButton, { marginRight: 8 }]}
              >
                {reorderMode ? "Kaydet" : "Sırala"}
              </Button>
            )}
            <Button 
              mode="contained" 
              onPress={() => newGoalBottomSheetRef.current?.expand()}
              icon="plus"
              style={styles.addButton}
            >
              Yeni Ekle
            </Button>
          </View>
        </Animated.View>
        
        {/* Boş Durum Gösterimi */}
        {!hasGoals ? (
          <Animated.View 
            entering={FadeIn.duration(800).delay(300)}
            style={styles.emptyStateContainer}
          >
            <EmptyState
              title="Henüz Tasarruf Hedefiniz Yok"
              message="Finansal hedeflerinize ulaşmak için bir tasarruf hedefi belirleyin."
              icon="piggy-bank"
            />
            <Button 
              mode="contained" 
              onPress={() => newGoalBottomSheetRef.current?.expand()}
              icon="plus"
              style={{ marginTop: 16 }}
            >
              Hedef Ekle
            </Button>
          </Animated.View>
        ) : showTutorial ? (
          <Animated.View 
            entering={FadeIn.duration(800).delay(300)}
            style={styles.tutorialContainer}
          >
            <Card style={styles.tutorialCard}>
              <CardContent>
                <ThemeIcon 
                  name="lightbulb" 
                  size={32} 
                  color={paperTheme.colors.primary} 
                  style={styles.tutorialIcon} 
                  type="material-community"
                />
                <TitleMedium style={styles.tutorialTitle}>Tasarruf Hedefleriniz</TitleMedium>
                <BodyMedium style={{ color: paperTheme.colors.onSurfaceVariant }}>
                  Burada tüm tasarruf hedeflerinizi ve ilerlemenizi görebilirsiniz. 
                  Hedeflerinize para ekleyebilir ve ilerlemenizi takip edebilirsiniz.
                </BodyMedium>
                
                <Button 
                  mode="contained" 
                  onPress={async () => {
                    await markDataAsSeen('savings');
                    setShowTutorial(false);
                  }}
                  icon="check"
                  style={{ marginTop: 16 }}
                >
                  Anladım
                </Button>
              </CardContent>
            </Card>
          </Animated.View>
        ) : (
          <>
            {/* Toplam Tasarruf Özeti */}
            <Animated.View 
              entering={FadeIn.duration(800).delay(200)}
            >
              <Card style={[styles.summaryCard, { backgroundColor: '#2196F3' }]}>
                <CardContent>
                  <TitleMedium style={{ color: 'white' }}>Toplam Tasarruf Durumu</TitleMedium>
                  <View style={styles.summaryContent}>
                    <View style={styles.summaryItem}>
                      <LabelSmall style={{ color: 'rgba(255,255,255,0.8)' }}>Şu Anki Tasarruf</LabelSmall>
                      <BodyMedium style={{ color: 'white' }}>{formatCurrency(totalSavings)}</BodyMedium>
                    </View>
                    <View style={styles.summaryItem}>
                      <LabelSmall style={{ color: 'rgba(255,255,255,0.8)' }}>Toplam Hedef</LabelSmall>
                      <BodyMedium style={{ color: 'white' }}>{formatCurrency(totalTarget)}</BodyMedium>
                    </View>
                    <View style={styles.summaryItem}>
                      <LabelSmall style={{ color: 'rgba(255,255,255,0.8)' }}>Tamamlanan</LabelSmall>
                      <BodyMedium style={{ color: 'white' }}>
                        %{totalTarget > 0 ? Math.round((totalSavings / totalTarget) * 100) : 0}
                      </BodyMedium>
                    </View>
                  </View>
                </CardContent>
              </Card>
            </Animated.View>

            {/* Pasta Grafiği ile Dağılım */}
            {savingsGoals.length > 0 && (
              <Animated.View 
                entering={ZoomIn.duration(800).delay(400)}
              >
                <Card style={styles.chartCard}>
                  <CardContent>
                    <TitleMedium style={styles.chartTitle}>Tasarruf Dağılımı</TitleMedium>
                    
                    <View style={styles.chartContent}>
                      {/* Pasta Grafiği */}
                      <View style={styles.pieChartContainer}>
                        <PieChart
                          widthAndHeight={pieChartSize}
                          series={safePieChartData}
                          sliceColor={safePieChartColors}
                          coverRadius={0.65}
                          coverFill={paperTheme.colors.background}
                        />
                        <View style={styles.pieChartCenter}>
                          <TitleMedium>
                            {formatCurrency(totalSavings)}
                          </TitleMedium>
                          <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
                            Toplam
                          </LabelSmall>
                        </View>
                      </View>
                      
                      {/* Grafiğin Açıklaması */}
                      <View style={styles.chartLegend}>
                        {savingsGoals.map((goal) => {
                          const percentage = hasPieChartData 
                            ? Math.round((goal.currentAmount / totalSavings) * 100) || 0
                            : 0;
                          return (
                            <View key={goal.id} style={styles.legendItem}>
                              <View style={[styles.legendColor, { backgroundColor: goal.color }]} />
                              <View style={styles.legendInfo}>
                                <BodyMedium>{goal.name}</BodyMedium>
                                <BodySmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
                                  {formatCurrency(goal.currentAmount)} ({percentage}%)
                                </BodySmall>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </Animated.View>
            )}
            
            {/* Tasarruf Hedefleri Listesi */}
            {reorderMode ? (
              // Sıralama modunda
              <View style={{ marginHorizontal: 20 }}>
                <Card style={styles.reorderCard}>
                  <CardContent>
                    <BodyMedium style={{ textAlign: 'center', marginBottom: 12, color: paperTheme.colors.primary }}>
                      Hedefleri sıralamak için sürükleyip bırakın
                    </BodyMedium>
                    
                    {orderedGoals.map((goal, index) => {
                      // Her bir öğe için bir sürükleme animasyonu değeri oluştur
                      const itemPosition = useSharedValue(0);
                      const isDragging = useSharedValue(false);
                      
                      // Sürükleme hareketi tanımla
                      const dragGesture = Gesture.Pan()
                        .onBegin(() => {
                          isDragging.value = true;
                          runOnJS(onDragStart)(index);
                        })
                        .onChange((event) => {
                          // Dikey hareket
                          itemPosition.value = event.translationY;
                          
                          // Pozisyon değişimini hesapla
                          const newPosition = Math.floor(itemPosition.value / 60);
                          const newIndex = Math.max(0, Math.min(orderedGoals.length - 1, index + newPosition));
                          
                          if (newIndex !== index) {
                            runOnJS(onDragPositionChange)(index, newIndex);
                          }
                        })
                        .onFinalize(() => {
                          isDragging.value = false;
                          itemPosition.value = 0;
                          runOnJS(onDragEnd)();
                        });
                        
                      // Animasyon stilini tanımla
                      const animatedStyle = useAnimatedStyle(() => {
                        return {
                          transform: [
                            { translateY: itemPosition.value },
                          ],
                          backgroundColor: isDragging.value ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                          zIndex: isDragging.value ? 1 : 0,
                        };
                      });
                      
                      return (
                        <GestureDetector key={goal.id} gesture={dragGesture}>
                          <Animated.View style={[styles.reorderItem, animatedStyle]}>
                            <ThemeIcon 
                              name="drag" 
                              size={20} 
                              color={paperTheme.colors.onSurfaceVariant} 
                              type="material-community" 
                              style={{ marginRight: 10 }}
                            />
                            <Surface style={[styles.reorderIcon, { backgroundColor: `${goal.color}30` }]}>
                              <ThemeIcon 
                                name={goal.icon || 'star'} 
                                size={16} 
                                color={goal.color} 
                                type="material-community" 
                              />
                            </Surface>
                            <BodyMedium style={{ flex: 1, marginLeft: 10 }}>{goal.name}</BodyMedium>
                            <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
                              {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                            </LabelSmall>
                          </Animated.View>
                        </GestureDetector>
                      );
                    })}
                  </CardContent>
                </Card>
              </View>
            ) : (
              // Normal mod
              savingsGoals.map((goal) => (
                <SavingsGoalCard 
                  key={goal.id}
                  goal={goal} 
                  onAddFunds={handleAddFunds} 
                  onWithdrawFunds={handleWithdrawFunds} 
                />
              ))
            )}
            
            {/* İşlem Geçmişi Bölümü */}
            {transactionHistory.length > 0 && (
              <Animated.View 
                entering={FadeIn.duration(800).delay(500)}
              >
                <Card style={styles.historyCard}>
                  <CardContent>
                    <View style={styles.historyCardHeader}>
                      <TitleMedium>İşlem Geçmişi</TitleMedium>
                      {transactionHistory.length > 5 && (
                        <Button 
                          mode="text" 
                          onPress={() => alert('Tüm işlemler sayfası henüz yapım aşamasında')}
                          compact
                        >
                          Tümünü Gör
                        </Button>
                      )}
                    </View>
                    
                    <Divider style={{ marginVertical: 10 }} />
                    
                    {transactionHistory.length === 0 ? (
                      <View style={styles.emptyHistoryContainer}>
                        <BodyMedium style={{ textAlign: 'center', marginTop: 10, color: paperTheme.colors.onSurfaceVariant }}>
                          Henüz işlem kaydı bulunmuyor.
                        </BodyMedium>
                      </View>
                    ) : (
                      transactionHistory.slice(0, 5).map(transaction => {
                        const goal = savingsGoals.find(g => g.id === transaction.goalId);
                        if (!goal) return null;
                        
                        return (
                          <View key={transaction.id} style={styles.transactionItem}>
                            <View style={styles.transactionIcon}>
                              <Surface 
                                style={[
                                  styles.transactionIconBg, 
                                  { 
                                    backgroundColor: transaction.isAddition 
                                      ? 'rgba(76, 175, 80, 0.2)' 
                                      : 'rgba(244, 67, 54, 0.2)'
                                  }
                                ]}
                              >
                                <ThemeIcon 
                                  name={transaction.isAddition ? 'plus' : 'minus'} 
                                  size={18} 
                                  color={transaction.isAddition ? '#4CAF50' : '#F44336'} 
                                  type="material-community"
                                />
                              </Surface>
                            </View>
                            
                            <View style={styles.transactionInfo}>
                              <BodyMedium style={styles.transactionGoal}>{goal.name}</BodyMedium>
                              <BodySmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
                                {transaction.date.toLocaleDateString('tr-TR', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit'
                                })}
                              </BodySmall>
                            </View>
                            
                            <View style={styles.transactionAmount}>
                              <BodyMedium 
                                style={{ 
                                  fontWeight: 'bold', 
                                  color: transaction.isAddition ? '#4CAF50' : '#F44336' 
                                }}
                              >
                                {transaction.isAddition ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </BodyMedium>
                              
                              <TouchableOpacity
                                onPress={() => undoTransaction(transaction.id)}
                                style={styles.undoTransactionButton}
                              >
                                <BodySmall style={{ color: paperTheme.colors.primary }}>
                                  Geri Al
                                </BodySmall>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
      
      {/* FAB ile yeni hedef ekleme */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => newGoalBottomSheetRef.current?.expand()}
      />

      {/* Yeni Tasarruf Hedefi Bottom Sheet */}
      <BottomSheet
        ref={newGoalBottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleNewGoalSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
          <View style={[styles.modalHeader, { backgroundColor: '#2196F3' }]}>
            <TitleMedium style={{ color: 'white' }}>Yeni Tasarruf Hedefi</TitleMedium>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: paperTheme.colors.text }]}>Hedef İsmi</Text>
            <View style={[styles.inputContainer, formErrors.name ? styles.inputError : null]}>
              <IconSymbol name={'star.fill' as IconSymbolName} size={18} color={paperTheme.colors.icon} style={styles.inputIcon} />
              <BottomSheetTextInput
                style={[styles.formInput, { backgroundColor: paperTheme.colors.background === '#fff' ? '#F2F2F2' : '#333333', color: paperTheme.colors.text }]}
                value={newGoalName}
                onChangeText={(text) => {
                  setNewGoalName(text);
                  if (formErrors.name) {
                    setFormErrors({...formErrors, name: ''});
                  }
                }}
                placeholder="Örn: Yeni Araba, Tatil Fonu..."
                placeholderTextColor={paperTheme.colors.icon}
              />
            </View>
            {formErrors.name ? (
              <Text style={styles.errorText}>{formErrors.name}</Text>
            ) : null}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: paperTheme.colors.text }]}>Hedef Tutarı</Text>
            <View style={[styles.inputContainer, formErrors.targetAmount ? styles.inputError : null]}>
              <IconSymbol name={'plus.circle.fill' as IconSymbolName} size={18} color={paperTheme.colors.icon} style={styles.inputIcon} />
              <BottomSheetTextInput
                style={[styles.formInput, { backgroundColor: paperTheme.colors.background === '#fff' ? '#F2F2F2' : '#333333', color: paperTheme.colors.text }]}
                value={newGoalAmount}
                onChangeText={(text) => {
                  setNewGoalAmount(text);
                  if (formErrors.targetAmount) {
                    setFormErrors({...formErrors, targetAmount: ''});
                  }
                }}
                keyboardType="numeric"
                placeholder="₺ Örn: 10000"
                placeholderTextColor={paperTheme.colors.icon}
              />
            </View>
            {formErrors.targetAmount ? (
              <Text style={styles.errorText}>{formErrors.targetAmount}</Text>
            ) : null}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: paperTheme.colors.text }]}>Mevcut Tasarruf Bakiyesi (İsteğe Bağlı)</Text>
            <View style={styles.inputContainer}>
              <IconSymbol name={'plus.circle.fill' as IconSymbolName} size={18} color={paperTheme.colors.icon} style={styles.inputIcon} />
              <BottomSheetTextInput
                style={[styles.formInput, { backgroundColor: paperTheme.colors.background === '#fff' ? '#F2F2F2' : '#333333', color: paperTheme.colors.text }]}
                value={newGoalCurrentAmount}
                onChangeText={setNewGoalCurrentAmount}
                keyboardType="numeric"
                placeholder="₺ Örn: 1000"
                placeholderTextColor={paperTheme.colors.icon}
              />
            </View>
            
            {parseFloat(newGoalCurrentAmount) > 0 && (
              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={[styles.checkbox, deductFromBalance ? { backgroundColor: '#2196F3', borderColor: '#2196F3' } : { borderColor: paperTheme.colors.icon }]} 
                  onPress={() => setDeductFromBalance(!deductFromBalance)}
                >
                  {deductFromBalance && (
                    <IconSymbol name="checkmark" size={14} color="white" />
                  )}
                </TouchableOpacity>
                <Text style={[styles.checkboxLabel, { color: paperTheme.colors.text }]}>Mevcut bakiyeden düş</Text>
              </View>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: paperTheme.colors.text }]}>Kategori</Text>
            <View style={[styles.categoryContainer, formErrors.category ? styles.inputError : null]}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryItem,
                    { backgroundColor: paperTheme.colors.background === '#fff' ? '#F2F2F2' : '#333333' },
                    selectedCategory === category.value && {
                      backgroundColor: `${category.color}20`,
                      borderColor: category.color,
                    },
                  ]}
                  onPress={() => {
                    setSelectedCategory(category.value);
                    if (formErrors.category) {
                      setFormErrors({...formErrors, category: ''});
                    }
                  }}
                >
                  <IconSymbol
                    name={category.icon}
                    size={18}
                    color={selectedCategory === category.value ? category.color : paperTheme.colors.icon}
                    style={styles.categoryIcon}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      { color: selectedCategory === category.value ? category.color : paperTheme.colors.text },
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {formErrors.category ? (
              <Text style={styles.errorText}>{formErrors.category}</Text>
            ) : null}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: paperTheme.colors.text }]}>Hedef Tarihi (İsteğe Bağlı)</Text>
            <TouchableOpacity
              style={[styles.inputContainer, styles.datePickerButton, { backgroundColor: paperTheme.colors.background === '#fff' ? '#F2F2F2' : '#333333' }]}
              onPress={handleShowDatePicker}
            >
              <IconSymbol name="calendar" size={18} color={paperTheme.colors.icon} style={styles.inputIcon} />
              <Text style={[styles.datePickerText, { color: targetDate ? paperTheme.colors.text : paperTheme.colors.icon }]}>
                {targetDate ? targetDate.toLocaleDateString('tr-TR') : 'Tarih seçiniz'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: paperTheme.colors.background === '#fff' ? '#F2F2F2' : '#333333', borderColor: 'rgba(0, 0, 0, 0.2)' }]}
              onPress={() => {
                resetForm();
                newGoalBottomSheetRef.current?.close();
              }}
            >
              <Text style={[styles.cancelButtonText, { color: paperTheme.colors.text }]}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton, { backgroundColor: '#2196F3' }]}
              onPress={addNewGoal}
            >
              <Text style={styles.submitButtonText}>Hedef Oluştur</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Para Ekleme/Çekme Bottom Sheet */}
      <BottomSheet
        ref={fundBottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleFundSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
          <View style={[styles.modalHeader, { backgroundColor: isAddingFunds ? '#4CAF50' : '#F44336' }]}>
            <TitleMedium style={{ color: 'white' }}>
              {isAddingFunds ? 'Para Ekle' : 'Para Çek'}: {selectedGoalName}
            </TitleMedium>
          </View>
          
          <View style={styles.amountContainer}>
            <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
              {isAddingFunds ? 'Eklenecek Tutar' : 'Çekilecek Tutar'}
            </LabelSmall>
            
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencyPrefix}>₺</Text>
              <BottomSheetTextInput
                style={[styles.amountInput, { color: paperTheme.colors.text, borderBottomColor: paperTheme.colors.outline }]}
                value={fundAmount}
                onChangeText={setFundAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={paperTheme.colors.placeholder}
              />
            </View>
          </View>
          
          <View style={styles.quickAmountContainer}>
            {[100, 200, 500, 1000].map(amount => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickAmountButton,
                  { 
                    borderColor: paperTheme.colors.outline,
                    backgroundColor: fundAmount === amount.toString() 
                      ? (isAddingFunds ? '#E8F5E9' : '#FFEBEE') 
                      : paperTheme.colors.surface 
                  }
                ]}
                onPress={() => selectQuickAmount(amount)}
              >
                <Text 
                  style={[
                    styles.quickAmountText, 
                    { 
                      color: fundAmount === amount.toString() 
                        ? (isAddingFunds ? '#4CAF50' : '#F44336') 
                        : paperTheme.colors.text 
                    }
                  ]}
                >
                  {formatCurrency(amount)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.cancelActionButton,
                { 
                  backgroundColor: paperTheme.colors.surface,
                  borderWidth: 1,
                  borderColor: paperTheme.colors.outline
                }
              ]}
              onPress={() => fundBottomSheetRef.current?.close()}
            >
              <Text style={[styles.cancelActionText, { color: paperTheme.colors.text }]}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.confirmActionButton,
                { 
                  backgroundColor: isAddingFunds ? '#4CAF50' : '#F44336',
                }
              ]}
              onPress={processFundAction}
            >
              <IconSymbol name={isAddingFunds ? 'plus' : 'minus'} size={18} color="#FFFFFF" />
              <Text style={styles.confirmActionText}>
                {isAddingFunds ? 'Para Ekle' : 'Para Çek'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Seçilen hedefe ait işlem geçmişi */}
          {transactionHistory.length > 0 && selectedGoalId && (
            <View style={styles.historyContainer}>
              <TitleMedium style={{ marginBottom: 12 }}>Son İşlemler</TitleMedium>
              
              {transactionHistory
                .filter(transaction => transaction.goalId === selectedGoalId)
                .slice(0, 5)
                .map(transaction => {
                  const goal = savingsGoals.find(g => g.id === transaction.goalId);
                  if (!goal) return null;
                  
                  return (
                    <View key={transaction.id} style={styles.historyItem}>
                      <View style={styles.historyItemDetails}>
                        <BodyMedium style={styles.historyGoalName}>{goal.name}</BodyMedium>
                        <BodySmall style={styles.historyItemDate}>
                          {transaction.date.toLocaleDateString('tr-TR')}
                        </BodySmall>
                      </View>
                      <View style={styles.historyItemActions}>
                        <BodyMedium 
                          style={[
                            styles.historyItemAmount,
                            { color: transaction.isAddition ? '#4CAF50' : '#F44336' }
                          ]}
                        >
                          {transaction.isAddition ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </BodyMedium>
                        <TouchableOpacity 
                          style={styles.undoButton}
                          onPress={() => undoTransaction(transaction.id)}
                        >
                          <BodySmall style={styles.undoButtonText}>Geri Al</BodySmall>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 50,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  addButton: {
    borderRadius: 8,
  },
  reorderButton: {
    borderRadius: 8,
  },
  reorderCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  reorderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  reorderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  summaryItem: {
    alignItems: 'center',
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 5,
  },
  chartTitle: {
    marginBottom: 15,
  },
  chartContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pieChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth < 380 ? 160 : 200,
    height: screenWidth < 380 ? 160 : 200,
  },
  pieChartCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  chartLegend: {
    flex: 1,
    paddingLeft: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendInfo: {
    flex: 1,
  },
  tutorialContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateContainer: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tutorialCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  tutorialIcon: {
    marginBottom: 10,
  },
  tutorialTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bottomSheetIndicator: {
    backgroundColor: 'white',
  },
  bottomSheetBackground: {
    backgroundColor: '#1E1E1E',
  },
  bottomSheetContent: {
    padding: 0,
    paddingBottom: 24,
  },
  modalHeader: {
    width: '100%',
    padding: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  formInput: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 0,
    borderWidth: 0,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 10,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
  },
  datePickerButton: {
    paddingVertical: 14,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
  },
  datePickerContainer: {
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  datePickerCloseText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerDoneText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  dateOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  dateOptionText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  customDateButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  customDateText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
  },
  modalButton: {
    flex: 0.48,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  goalCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalAmountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalAmountItem: {
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  analysisToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  analysisContainer: {
    marginBottom: 10,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingSuggestionsContainer: {
    marginTop: 8,
  },
  savingSuggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savingSuggestionItem: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    width: '48%',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalActionButton: {
    marginTop: 8,
    marginHorizontal: 4,
  },
  historyCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    padding: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  transactionIcon: {
    marginRight: 12,
    justifyContent: 'center',
  },
  transactionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionGoal: {
    fontWeight: '500',
  },
  transactionAmount: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  undoTransactionButton: {
    marginTop: 4,
    padding: 2,
  },
  amountContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  currencyPrefix: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 5,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 120,
    padding: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#DDD',
  },
  quickAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
  },
  quickAmountButton: {
    width: '23%',
    borderRadius: 50,
    paddingVertical: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickAmountText: {
    fontWeight: '600',
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cancelActionButton: {
    width: '47%',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmActionButton: {
    width: '47%',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 5,
  },
  historyContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  historyItemDetails: {
    flex: 1,
  },
  historyGoalName: {
    fontSize: 15,
    fontWeight: '500',
  },
  historyItemDate: {
    fontSize: 12,
    marginTop: 3,
  },
  historyItemActions: {
    alignItems: 'flex-end',
  },
  historyItemAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  undoButton: {
    marginTop: 5,
    padding: 5,
  },
  undoButtonText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '500',
  },
  notificationSettingsContainer: {
    marginBottom: 10,
  },
  thresholdButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveNotificationButton: {
    marginTop: 12,
    height: 36,
  },
});

