import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, FlatList, Dimensions, ScrollView, SafeAreaView, Platform, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeIn, ZoomIn, SlideInRight } from 'react-native-reanimated';
import PieChart from 'react-native-pie-chart/v3api';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useFinance } from '@/context/FinanceContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

// Tasarruf hedefi tipini tanımla
type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  category?: string; // Kategori alanı eklendi
  targetDate?: Date; // Hedef tarihi eklendi
};

// Tasarruf hedefi kartı bileşeni
const SavingsGoalCard = ({ 
  goal, 
  colors, 
  onAddFunds, 
  onWithdrawFunds 
}: { 
  goal: SavingsGoal; 
  colors: any; 
  onAddFunds: (id: string) => void; 
  onWithdrawFunds: (id: string) => void; 
}) => {
  // Animasyon için gereken değerleri sabitlerle tanımlayalım
  const currentAmount = goal.currentAmount;
  const targetAmount = goal.targetAmount;
  const goalColor = goal.color;
  
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

  const progressPercentage = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);

  return (
    <Animated.View 
      entering={FadeIn.duration(800).delay(300)}
      style={[styles.goalCard, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A' }]}
    >
      <View style={styles.goalHeader}>
        <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
        <View style={[styles.goalIconContainer, { backgroundColor: `${goalColor}30` }]}>
          <IconSymbol name="star.fill" size={20} color={goalColor} />
        </View>
      </View>
      
      <View style={styles.goalAmountsContainer}>
        <View style={styles.goalAmountItem}>
          <Text style={[styles.goalAmountLabel, { color: colors.icon }]}>Hedef</Text>
          <Text style={[styles.goalAmountValue, { color: colors.text }]}>₺{targetAmount.toLocaleString()}</Text>
        </View>
        
        <View style={styles.goalAmountItem}>
          <Text style={[styles.goalAmountLabel, { color: colors.icon }]}>Mevcut</Text>
          <Text style={[styles.goalAmountValue, { color: colors.text }]}>₺{currentAmount.toLocaleString()}</Text>
        </View>
        
        <View style={styles.goalAmountItem}>
          <Text style={[styles.goalAmountLabel, { color: colors.icon }]}>Kalan</Text>
          <Text style={[styles.goalAmountValue, { color: colors.text }]}>₺{(targetAmount - currentAmount).toLocaleString()}</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBarBackground, { backgroundColor: colors.background === '#fff' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)' }]}>
          <Animated.View style={animatedStyle} />
        </View>
        <Text style={[styles.progressText, { color: colors.icon }]}>
          {progressPercentage}% tamamlandı
        </Text>
      </View>
      
      <View style={styles.goalActions}>
        <TouchableOpacity 
          style={[styles.goalActionButton, { backgroundColor: '#4CAF5020' }]}
          onPress={() => onAddFunds(goal.id)}
        >
          <IconSymbol name="plus.circle.fill" size={16} color="#4CAF50" />
          <Text style={[styles.goalActionText, { color: colors.text }]}>Para Ekle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.goalActionButton, { backgroundColor: '#F4433620' }]}
          onPress={() => onWithdrawFunds(goal.id)}
        >
          <IconSymbol name="minus.circle.fill" size={16} color="#F44336" />
          <Text style={[styles.goalActionText, { color: colors.text }]}>Para Çek</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];
  
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

  // Kategori seçenekleri
  const categories = [
    { label: 'Ev', value: 'home', color: '#4CAF50', icon: 'house.fill' as IconSymbolName },
    { label: 'Seyahat', value: 'travel', color: '#2196F3', icon: 'paperplane.fill' as IconSymbolName },
    { label: 'Teknoloji', value: 'tech', color: '#9C27B0', icon: 'tv.fill' as IconSymbolName },
    { label: 'Eğitim', value: 'education', color: '#FF9800', icon: 'chevron.left.forwardslash.chevron.right' as IconSymbolName },
    { label: 'Araba', value: 'car', color: '#F44336', icon: 'car.fill' as IconSymbolName },
    { label: 'Diğer', value: 'other', color: '#607D8B', icon: 'star.fill' as IconSymbolName },
  ];

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
      errors.targetAmount = 'Geçerli bir hedef tutarı giriniz';
    }
    
    if (!selectedCategory) {
      errors.category = 'Lütfen bir kategori seçiniz';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Yeni hedef ekleme
  const addNewGoal = () => {
    console.log('addNewGoal çağrıldı');
    
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
    
    console.log('Yeni hedef oluşturuluyor:', newGoal);
    
    const result = addSavingsGoal(newGoal);
    
    if (result) {
      console.log('Hedef başarıyla eklendi:', result);
      // Formu temizle
      resetForm();
      // Bottom sheet'i kapat
      newGoalBottomSheetRef.current?.close();
      
      // Bildirim göster
      Alert.alert('Başarılı', 'Tasarruf hedefi başarıyla eklendi!');
    } else {
      console.error('Hedef eklenirken bir hata oluştu');
      Alert.alert('Hata', 'Tasarruf hedefi eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Para ekleme/çıkarma modalını yönet
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
  
  // Para ekleme/çıkarma işlemini gerçekleştir
  const processFundAction = () => {
    console.log('processFundAction çağrıldı, seçili hedef ID:', selectedGoalId);
    
    if (!selectedGoalId) {
      console.error('Hata: Seçili bir hedef ID yok');
      Alert.alert('Hata', 'Lütfen bir tasarruf hedefi seçin.');
      return;
    }
    
    // Seçili hedefin var olduğunu kontrol et
    const selectedGoal = savingsGoals.find(g => g.id === selectedGoalId);
    if (!selectedGoal) {
      console.error('Hata: Seçili ID ile eşleşen hedef bulunamadı:', selectedGoalId);
      console.log('Mevcut hedefler:', savingsGoals.map(g => ({ id: g.id, name: g.name })));
      Alert.alert('Hata', 'Seçilen tasarruf hedefi bulunamadı.');
      return;
    }
    
    const amount = parseFloat(fundAmount);
    
    console.log('İşlem başlatılıyor:', { 
      isAddingFunds,
      amount,
      selectedGoalId,
      selectedGoalName: selectedGoal.name
    });
    
    if (isNaN(amount) || amount <= 0) {
      console.log('Hata: Miktar geçersiz', amount);
      Alert.alert('Hata', 'Lütfen geçerli bir miktar girin.');
      return; // Miktar geçersizse işlem yapma
    }
    
    // İşlemi gerçekleştir
    let success = false;
    if (isAddingFunds) {
      console.log('Para ekleme işlemi başlatılıyor');
      success = addFundsToGoal(selectedGoalId, amount, `${selectedGoal.name} hedefine para ekleme`);
      console.log('Para ekleme işlemi sonucu:', success);
    } else {
      console.log('Para çekme işlemi başlatılıyor');
      success = withdrawFundsFromGoal(selectedGoalId, amount, `${selectedGoal.name} hedefinden para çekme`);
      console.log('Para çekme işlemi sonucu:', success);
    }
    
    if (success) {
      // İşlem başarılıysa bottom sheet'i kapat
      fundBottomSheetRef.current?.close();
      setFundAmount('');
      setSelectedGoalId(null);
      setSelectedGoalName('');
      Alert.alert('Başarılı', isAddingFunds ? 'Para başarıyla eklendi.' : 'Para başarıyla çekildi.');
    } else {
      console.log('İşlem başarısız oldu');
      Alert.alert('Hata', isAddingFunds ? 
        'Para eklenirken bir hata oluştu. Lütfen tekrar deneyin.' : 
        'Para çekilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Hızlı tutar seçme
  const selectQuickAmount = (amount: number) => {
    setFundAmount(amount.toString());
  };

  // İşlemi geri al
  const undoTransaction = (transactionId: string) => {
    // İşlemi bul
    const transaction = transactionHistory.find(t => t.id === transactionId);
    
    if (transaction) {
      // FinanceContext'teki ilgili işlemi geri alma yöntemini çağır
      if (transaction.isAddition) {
        // Eğer ekleme işlemi geri alınıyorsa, aynı miktarı çek
        withdrawFundsFromGoal(transaction.goalId, transaction.amount, "İşlem geri alındı");
      } else {
        // Eğer çekme işlemi geri alınıyorsa, aynı miktarı ekle
        addFundsToGoal(transaction.goalId, transaction.amount, "İşlem geri alındı");
      }
      
      // İşlemi geçmişten kaldır
      setTransactionHistory(transactionHistory.filter(t => t.id !== transactionId));
    }
  };

  // Hesaplamaları yapalım
  useEffect(() => {
    const savingsTotal = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const targetTotal = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    
    setTotalSavings(savingsTotal);
    setTotalTarget(targetTotal);
  }, [savingsGoals]);

  // Pie chart verilerini hazırla
  const pieChartData = savingsGoals.map(goal => goal.currentAmount);
  const pieChartColors = savingsGoals.map(goal => goal.color);
  const pieChartSize = screenWidth < 380 ? 150 : 160;

  // Pie chart için toplam kontrolü
  const totalSavingsAmount = pieChartData.reduce((sum, value) => sum + value, 0);
  const hasPieChartData = savingsGoals.length > 0 && totalSavingsAmount > 0;
  
  // Eğer toplam sıfırsa, varsayılan değer ekleyelim (grafik hatası önleme)
  const safePieChartData = hasPieChartData ? pieChartData : [1];
  const safePieChartColors = hasPieChartData ? pieChartColors : ['#CCCCCC'];

  // Tarih formatını güzelleştir
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // DateTimePicker için platform özgü kullanım
  const isAndroid = Platform.OS === 'android';

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const handleShowDatePicker = () => {
    if (isAndroid) {
      // Android için doğrudan tarih seçiciyi göster
      setIsDatePickerVisible(true);
    } else {
      // iOS için tarih seçiciyi göster
      setShowDatePicker(true);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || targetDate || new Date();
    setIsDatePickerVisible(false);
    setShowDatePicker(false);
    if (selectedDate) {
      setTargetDate(currentDate);
    }
  };

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

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        style={[
          styles.container, 
          { 
            backgroundColor: colors.background,
          }
        ]}
        contentContainerStyle={[
          styles.contentContainer, 
          { 
            paddingTop: insets.top 
          }
        ]}
        showsVerticalScrollIndicator={false}
      >      
        {/* Tasarruf Hedefleri Başlığı */}
        <Animated.View
          entering={SlideInRight.duration(600).delay(500)}
          style={styles.sectionHeader}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tasarruf Hedefleri</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => newGoalBottomSheetRef.current?.expand()}
          >
            <IconSymbol name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Yeni Ekle</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Boş Durum Gösterimi */}
        {!hasGoals ? (
          <Animated.View 
            entering={FadeIn.duration(800).delay(300)}
            style={[styles.emptyStateContainer, { backgroundColor: colors.card }]}
          >
            <EmptyState
              title="Henüz Tasarruf Hedefiniz Yok"
              message="Finansal hedeflerinize ulaşmak için bir tasarruf hedefi belirleyin."
              icon="piggy-bank"
            />
            <TouchableOpacity 
              style={[styles.addButton, { marginTop: 16 }]}
              onPress={() => newGoalBottomSheetRef.current?.expand()}
            >
              <IconSymbol name="plus" size={16} color="#fff" />
              <Text style={styles.addButtonText}>Hedef Ekle</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : showTutorial ? (
          <Animated.View 
            entering={FadeIn.duration(800).delay(300)}
            style={[styles.emptyStateContainer, { backgroundColor: colors.card }]}
          >
            <View style={styles.tutorialContainer}>
              <IconSymbol name="lightbulb" size={32} color={colors.primary} style={styles.tutorialIcon} />
              <Text style={[styles.tutorialTitle, { color: colors.text }]}>Tasarruf Hedefleriniz</Text>
              <Text style={[styles.tutorialText, { color: colors.textMuted }]}>
                Burada tüm tasarruf hedeflerinizi ve ilerlemenizi görebilirsiniz. 
                Hedeflerinize para ekleyebilir ve ilerlemenizi takip edebilirsiniz.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.addButton, { marginTop: 16 }]}
              onPress={async () => {
                await markDataAsSeen('savings');
                setShowTutorial(false);
              }}
            >
              <IconSymbol name="checkmark" size={16} color="#fff" />
              <Text style={styles.addButtonText}>Anladım</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            {/* Toplam Tasarruf Özeti */}
            <Animated.View 
              entering={FadeIn.duration(800).delay(200)}
              style={[styles.summaryCard, { backgroundColor: '#2196F3' }]}
            >
              <Text style={styles.summaryTitle}>Toplam Tasarruf Durumu</Text>
              <View style={styles.summaryContent}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Şu Anki Tasarruf</Text>
                  <Text style={styles.summaryValue}>₺{totalSavings.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Toplam Hedef</Text>
                  <Text style={styles.summaryValue}>₺{totalTarget.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Tamamlanan</Text>
                  <Text style={styles.summaryValue}>
                    %{totalTarget > 0 ? Math.round((totalSavings / totalTarget) * 100) : 0}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Pasta Grafiği ile Dağılım */}
            {savingsGoals.length > 0 && (
              <Animated.View 
                entering={ZoomIn.duration(800).delay(400)}
                style={[styles.chartCard, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A' }]}
              >
                <Text style={[styles.chartTitle, { color: colors.text }]}>Tasarruf Dağılımı</Text>
                
                <View style={styles.chartContent}>
                  {/* Pasta Grafiği */}
                  <View style={styles.pieChartContainer}>
                    <PieChart
                      widthAndHeight={pieChartSize}
                      series={safePieChartData as any}
                      sliceColor={safePieChartColors}
                      coverRadius={0.65}
                      coverFill={colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A'}
                    />
                    <View style={styles.pieChartCenter}>
                      <Text style={[styles.pieChartCenterValue, { color: colors.text }]}>
                        ₺{totalSavings.toLocaleString()}
                      </Text>
                      <Text style={[styles.pieChartCenterLabel, { color: colors.icon }]}>
                        Toplam
                      </Text>
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
                            <Text style={[styles.legendName, { color: colors.text }]}>{goal.name}</Text>
                            <Text style={[styles.legendAmount, { color: colors.icon }]}>
                              ₺{goal.currentAmount.toLocaleString()} ({percentage}%)
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </Animated.View>
            )}
            
            {/* Tasarruf Hedefleri Listesi */}
            {savingsGoals.map((goal) => (
              <SavingsGoalCard 
                key={goal.id}
                goal={goal} 
                colors={colors} 
                onAddFunds={handleAddFunds} 
                onWithdrawFunds={handleWithdrawFunds} 
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Yeni Tasarruf Hedefi Bottom Sheet */}
      <BottomSheet
        ref={newGoalBottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleNewGoalSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: 'white' }}
        backgroundStyle={{ 
          backgroundColor: colors.background === '#fff' ? '#FFFFFF' : '#1E1E1E',
        }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
          <View style={[styles.modalHeader, { backgroundColor: '#2196F3' }]}>
            <Text style={styles.modalTitle}>Yeni Tasarruf Hedefi</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Hedef İsmi</Text>
            <View style={[styles.inputContainer, formErrors.name ? styles.inputError : null]}>
              <IconSymbol name={'star.fill' as IconSymbolName} size={18} color={colors.icon} style={styles.inputIcon} />
              <BottomSheetTextInput
                style={[styles.formInput, { backgroundColor: colors.background === '#fff' ? '#F2F2F2' : '#333333', color: colors.text }]}
                value={newGoalName}
                onChangeText={(text) => {
                  setNewGoalName(text);
                  if (formErrors.name) {
                    setFormErrors({...formErrors, name: ''});
                  }
                }}
                placeholder="Örn: Yeni Araba, Tatil Fonu..."
                placeholderTextColor={colors.icon}
              />
            </View>
            {formErrors.name ? (
              <Text style={styles.errorText}>{formErrors.name}</Text>
            ) : null}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Hedef Tutarı</Text>
            <View style={[styles.inputContainer, formErrors.targetAmount ? styles.inputError : null]}>
              <IconSymbol name={'plus.circle.fill' as IconSymbolName} size={18} color={colors.icon} style={styles.inputIcon} />
              <BottomSheetTextInput
                style={[styles.formInput, { backgroundColor: colors.background === '#fff' ? '#F2F2F2' : '#333333', color: colors.text }]}
                value={newGoalAmount}
                onChangeText={(text) => {
                  setNewGoalAmount(text);
                  if (formErrors.targetAmount) {
                    setFormErrors({...formErrors, targetAmount: ''});
                  }
                }}
                keyboardType="numeric"
                placeholder="₺ Örn: 10000"
                placeholderTextColor={colors.icon}
              />
            </View>
            {formErrors.targetAmount ? (
              <Text style={styles.errorText}>{formErrors.targetAmount}</Text>
            ) : null}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Mevcut Tasarruf Bakiyesi (İsteğe Bağlı)</Text>
            <View style={styles.inputContainer}>
              <IconSymbol name={'plus.circle.fill' as IconSymbolName} size={18} color={colors.icon} style={styles.inputIcon} />
              <BottomSheetTextInput
                style={[styles.formInput, { backgroundColor: colors.background === '#fff' ? '#F2F2F2' : '#333333', color: colors.text }]}
                value={newGoalCurrentAmount}
                onChangeText={setNewGoalCurrentAmount}
                keyboardType="numeric"
                placeholder="₺ Örn: 1000"
                placeholderTextColor={colors.icon}
              />
            </View>
            
            {parseFloat(newGoalCurrentAmount) > 0 && (
              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={[styles.checkbox, deductFromBalance ? { backgroundColor: '#2196F3', borderColor: '#2196F3' } : { borderColor: colors.icon }]} 
                  onPress={() => setDeductFromBalance(!deductFromBalance)}
                >
                  {deductFromBalance && (
                    <IconSymbol name="checkmark" size={14} color="white" />
                  )}
                </TouchableOpacity>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>Mevcut bakiyeden düş</Text>
              </View>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Kategori</Text>
            <View style={[styles.categoryContainer, formErrors.category ? styles.inputError : null]}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryItem,
                    { backgroundColor: colors.background === '#fff' ? '#F2F2F2' : '#333333' },
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
                    color={selectedCategory === category.value ? category.color : colors.icon}
                    style={styles.categoryIcon}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      { color: selectedCategory === category.value ? category.color : colors.text },
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
            <Text style={[styles.formLabel, { color: colors.text }]}>Hedef Tarihi (İsteğe Bağlı)</Text>
            <TouchableOpacity
              style={[styles.inputContainer, styles.datePickerButton, { backgroundColor: colors.background === '#fff' ? '#F2F2F2' : '#333333' }]}
              onPress={handleShowDatePicker}
            >
              <IconSymbol name="calendar" size={18} color={colors.icon} style={styles.inputIcon} />
              <Text style={[styles.datePickerText, { color: targetDate ? colors.text : colors.icon }]}>
                {targetDate ? formatDate(targetDate) : 'Tarih seçiniz'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.background === '#fff' ? '#F2F2F2' : '#333333', borderColor: 'rgba(0, 0, 0, 0.2)' }]}
              onPress={() => {
                resetForm();
                newGoalBottomSheetRef.current?.close();
              }}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>İptal</Text>
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
        handleIndicatorStyle={{ backgroundColor: colors.icon }}
        backgroundStyle={{ backgroundColor: colors.background === '#fff' ? '#FFFFFF' : '#1E1E1E' }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
          <View style={[styles.modalHeader, { backgroundColor: isAddingFunds ? '#4CAF50' : '#F44336' }]}>
            <Text style={[styles.modalTitle, { color: '#FFFFFF' }]}>
              {isAddingFunds ? 'Para Ekle' : 'Para Çek'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedGoalName ? `"${selectedGoalName}" hedefine ${isAddingFunds ? 'eklenecek' : 'çekilecek'} miktar` : ''}
            </Text>
          </View>
          
          <View style={[styles.formGroup, styles.amountContainer]}>
            <Text style={[styles.formLabel, { color: colors.text, textAlign: 'center', fontSize: 16 }]}>
              {isAddingFunds 
                ? 'Ne kadar eklemek istiyorsun?' 
                : 'Ne kadar çekmek istiyorsun?'}
            </Text>
            
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencyPrefix}>₺</Text>
              <BottomSheetTextInput
                style={[styles.amountInput, { color: colors.text, fontSize: 24 }]}              
                value={fundAmount}
                onChangeText={setFundAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.icon}
              />
            </View>
            
            <View style={styles.quickAmountContainer}>
              <TouchableOpacity 
                style={[styles.quickAmountButton, { borderColor: isAddingFunds ? '#4CAF50' : '#F44336' }]} 
                onPress={() => selectQuickAmount(10)}
              >
                <Text style={[styles.quickAmountText, { color: isAddingFunds ? '#4CAF50' : '#F44336' }]}>₺10</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickAmountButton, { borderColor: isAddingFunds ? '#4CAF50' : '#F44336' }]} 
                onPress={() => selectQuickAmount(20)}
              >
                <Text style={[styles.quickAmountText, { color: isAddingFunds ? '#4CAF50' : '#F44336' }]}>₺20</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickAmountButton, { borderColor: isAddingFunds ? '#4CAF50' : '#F44336' }]} 
                onPress={() => selectQuickAmount(50)}
              >
                <Text style={[styles.quickAmountText, { color: isAddingFunds ? '#4CAF50' : '#F44336' }]}>₺50</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickAmountButton, { borderColor: isAddingFunds ? '#4CAF50' : '#F44336' }]} 
                onPress={() => selectQuickAmount(100)}
              >
                <Text style={[styles.quickAmountText, { color: isAddingFunds ? '#4CAF50' : '#F44336' }]}>₺100</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.cancelActionButton, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#333333' }]}
              onPress={() => fundBottomSheetRef.current?.close()}
            >
              <Text style={[styles.cancelActionText, { color: colors.text }]}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.confirmActionButton, 
                { backgroundColor: isAddingFunds ? '#4CAF50' : '#F44336', opacity: fundAmount ? 1 : 0.6 }
              ]}
              onPress={processFundAction}
              disabled={!fundAmount}
            >
              <IconSymbol 
                name={isAddingFunds ? 'plus.circle.fill' as IconSymbolName : 'minus.circle.fill' as IconSymbolName} 
                size={18} 
                color="#FFFFFF" 
              />
              <Text style={styles.confirmActionText}>
                {isAddingFunds ? 'Ekle' : 'Çek'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {transactionHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={[styles.historyTitle, { color: colors.text }]}>Son İşlemler</Text>
              
              {transactionHistory.slice(0, 5).map((transaction) => {
                const relatedGoal = savingsGoals.find(g => g.id === transaction.goalId);
                return (
                  <View key={transaction.id} style={styles.historyItem}>
                    <View style={styles.historyItemDetails}>
                      <Text style={[styles.historyGoalName, { color: colors.text }]}>
                        {relatedGoal?.name || 'Silinen Hedef'}
                      </Text>
                      <Text style={[styles.historyItemDate, { color: colors.icon }]}>
                        {transaction.date.toLocaleDateString('tr-TR')} {transaction.date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                      </Text>
                    </View>
                    
                    <View style={styles.historyItemActions}>
                      <Text style={[
                        styles.historyItemAmount, 
                        { color: transaction.isAddition ? '#4CAF50' : '#F44336' }
                      ]}>
                        {transaction.isAddition ? '+' : '-'}₺{transaction.amount}
                      </Text>
                      
                      <TouchableOpacity 
                        style={styles.undoButton}
                        onPress={() => undoTransaction(transaction.id)}
                      >
                        <Text style={styles.undoButtonText}>Geri Al</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      {isDatePickerVisible && isAndroid && (
        <DateTimePicker
          value={targetDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showDatePicker && !isAndroid && (
        <DateTimePicker
          value={targetDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  // Özet Kart Stilleri
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Grafik Kart Stilleri
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
    width: screenWidth < 380 ? '100%' : '45%',
    marginBottom: screenWidth < 380 ? 16 : 0,
  },
  pieChartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartCenterValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pieChartCenterLabel: {
    fontSize: 12,
  },
  chartLegend: {
    width: screenWidth < 380 ? '100%' : '50%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  legendName: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendAmount: {
    fontSize: 12,
  },
  // Bölüm Başlığı
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  // Hedef Kart Stilleri
  goalCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
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
  goalAmountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  goalAmountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  goalActionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  // Bottom Sheet Stilleri
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
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalSubtitle: {
    fontSize: 16,
    marginTop: 4,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formGroup: {
    width: '100%',
    marginBottom: 20,
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
  // Para Ekleme/Çekme stilleri
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
  // İşlem geçmişi stilleri
  historyContainer: {
    marginTop: 5,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
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
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
  },
  emptyDateContainer: {
    marginTop: 8,
  },
  dateText: {
    fontSize: 16,
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
  tutorialContainer: {
    alignItems: 'center',
    padding: 20,
  },
  tutorialIcon: {
    marginBottom: 10,
  },
  tutorialTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tutorialText: {
    fontSize: 16,
    textAlign: 'center',
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
});

