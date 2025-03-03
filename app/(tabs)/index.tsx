import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Switch, Modal, TextInput, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFinance } from '@/context/FinanceContext';
import PieChart from 'react-native-pie-chart/v3api';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing, FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';
import { SavingsOverview } from '@/components/dashboard/SavingsOverview';
import { ExpenseOverview } from '@/components/dashboard/ExpenseOverview';
import { TransactionsOverview } from '@/components/dashboard/TransactionsOverview';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

// Ekran genişliğini al
const { width: screenWidth } = Dimensions.get('window');

// Dairesel grafik için açı hesaplama fonksiyonu
const calculateAngle = (percentage: number) => {
  return percentage * 3.6; // 360 derece / 100 = 3.6
};

// Son işlemler için örnek veri
const recentTransactions = [
  { id: '1', category: 'Yiyecek', amount: 45, date: '1 Mart', description: 'Market alışverişi' },
  { id: '2', category: 'Ulaşım', amount: 25, date: '28 Şubat', description: 'Taksi' },
  { id: '3', category: 'Eğlence', amount: 120, date: '27 Şubat', description: 'Sinema bileti' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const colors = Colors[theme];
  const { 
    userProfile, 
    financialState, 
    addExpense: addExpenseToContext, 
    addToBalance,
    isExpenseModalVisible,
    showExpenseModal,
    hideExpenseModal 
  } = useFinance();
  
  // URL parametrelerini al
  const { action } = useLocalSearchParams<{ action?: string }>();
  
  // Modal state'leri - expenseModalVisible artık FinanceContext'ten geliyor
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  
  // Form state'leri
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [savingsGoalAmount, setSavingsGoalAmount] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceDescription, setBalanceDescription] = useState('');
  
  // Animasyon değerleri
  const progressAnimation = useSharedValue(0);
  const balanceAnimation = useSharedValue(0);
  
  // Örnek veri - gerçek uygulamada bu veriler bir API veya yerel depodan gelecektir
  const currentBalance = 5250;
  const savingsGoal = 10000;
  const savingsProgress = (currentBalance / savingsGoal) * 100;
  const monthlyExpenses = 3200;
  const monthlySavings = 1800;
  const dailyBudget = 150;
  const todaySpent = 85;
  const remainingBudget = dailyBudget - todaySpent;
  
  const categories = [
    { 
      name: 'Yiyecek', 
      amount: 1200, 
      budget: 1500, 
      icon: 'cart.fill', 
      color: '#4CAF50', 
      percentage: 37.5,
      remaining: 300,
      transactions: 15
    },
    { 
      name: 'Ulaşım', 
      amount: 600, 
      budget: 700, 
      icon: 'car.fill', 
      color: '#2196F3', 
      percentage: 18.75,
      remaining: 100,
      transactions: 8
    },
    { 
      name: 'Faturalar', 
      amount: 800, 
      budget: 800, 
      icon: 'bolt.fill', 
      color: '#FFC107', 
      percentage: 25,
      remaining: 0,
      transactions: 5
    },
    { 
      name: 'Eğlence', 
      amount: 400, 
      budget: 350, 
      icon: 'tv.fill', 
      color: '#9C27B0', 
      percentage: 12.5,
      remaining: -50,
      transactions: 7
    },
    { 
      name: 'Diğer', 
      amount: 200, 
      budget: 300, 
      icon: 'ellipsis.circle.fill', 
      color: '#607D8B', 
      percentage: 6.25,
      remaining: 100,
      transactions: 3
    },
  ];

  // Toplam harcama
  const totalExpenses = categories.reduce((sum, category) => sum + category.amount, 0);

  // Pie Chart için verileri hazırla
  const pieChartData = categories.map(category => category.amount);
  const pieChartColors = categories.map(category => category.color);
  const pieChartSize = screenWidth < 380 ? 150 : 160;

  // Animasyonları başlat
  React.useEffect(() => {
    progressAnimation.value = withTiming(savingsProgress / 100, {
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    balanceAnimation.value = withSpring(1, {
      damping: 12,
      stiffness: 90,
    });
  }, []);
  
  // Animasyon stilleri
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnimation.value * 100}%`,
      height: '100%',
      backgroundColor: '#fff',
      borderRadius: 4,
    };
  });
  
  const balanceCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: balanceAnimation.value }],
      opacity: balanceAnimation.value,
    };
  });
  
  // URL parametreleri için effect
  useEffect(() => {
    if (action === 'newExpense') {
      // Harcama ekleme modalını aç
      showExpenseModal();
    }
  }, [action, showExpenseModal]);

  // Harcama ekleme
  const addExpense = () => {
    if (
      expenseAmount &&
      expenseCategory
    ) {
      const expenseData = {
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        description: expenseDescription || 'Harcama',
      };
      
      const newExpense = addExpenseToContext(expenseData);
      
      if (newExpense) {
        // Başarıyla eklendiğinde
        setExpenseAmount('');
        setExpenseCategory('');
        setExpenseDescription('');
        hideExpenseModal();
        
        // Bildirim göster
        Alert.alert('Başarılı', 'Harcama başarıyla eklendi!');
      }
    } else {
      // Hata bildirimi
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun!');
    }
  };
  
  // Tasarruf hedefi güncelleme fonksiyonu
  const updateSavingsGoal = () => {
    // Gerçek uygulamada burada tasarruf hedefi güncelleme işlemi yapılır
    setGoalModalVisible(false);
    setSavingsGoalAmount('');
  };

  // Bakiye ekleme fonksiyonu
  const addBalance = () => {
    if (balanceAmount && parseFloat(balanceAmount) > 0) {
      const amount = parseFloat(balanceAmount);
      const description = balanceDescription || 'Bakiye eklendi';
      
      const success = addToBalance(amount, description);
      
      if (success) {
        setBalanceAmount('');
        setBalanceDescription('');
        setBalanceModalVisible(false);
        
        // Bildirim göster
        Alert.alert('Başarılı', 'Bakiyeye para başarıyla eklendi!');
      } else {
        Alert.alert('Hata', 'Bakiye eklenirken bir hata oluştu!');
      }
    } else {
      Alert.alert('Hata', 'Lütfen geçerli bir miktar girin!');
    }
  };

  // Modal açma fonksiyonları
  const openExpenseModal = () => {
    showExpenseModal();
  };

  const openGoalModal = () => {
    setGoalModalVisible(true);
  };
  
  const openBalanceModal = () => {
    setBalanceModalVisible(true);
  };

  return (
    <SafeAreaView style={[
      styles.container, 
      { 
        backgroundColor: colors.background,
        // Explicitly set padding for status bar
        paddingTop: insets.top,
      }
    ]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Merhaba, {userProfile?.name || 'Kullanıcı'}
            </Text>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          
          <View style={styles.themeToggle}>
            <Text style={{ color: colors.text, marginRight: 8 }}>
              {isDark ? '🌙' : '☀️'}
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={isDark ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Bakiye Kartı */}
        <Animated.View style={[styles.balanceCard, { backgroundColor: colors.card }, balanceCardStyle]}>
          <View style={styles.balanceCardHeader}>
            <Text style={[styles.balanceLabel, { color: colors.text }]}>Mevcut Bakiye</Text>
            <TouchableOpacity
              style={[styles.balanceAddButton, { backgroundColor: colors.primary }]}
              onPress={openBalanceModal}
            >
              <Text style={styles.balanceAddButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.balanceAmount, { color: colors.text }]}>
            ₺{financialState.currentBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </Animated.View>

        {/* Yeni Dashboard Bileşenleri */}
        
        {/* Tasarruf Hedefleri Özeti */}
        <SavingsOverview />
        
        {/* Harcama Analizi */}
        <ExpenseOverview />
        
        {/* Son İşlemler */}
        <TransactionsOverview />

        {/* Eski İçerik Kaldırıldı */}
        
        {/* Modals */}
        {isExpenseModalVisible && (
          <View style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 9999,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
              activeOpacity={1}
              onPress={hideExpenseModal}
            />
            <View style={{
              width: '100%',
              backgroundColor: colors.background,
              borderRadius: 20,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 15,
              maxWidth: 450,
            }}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Harcama Ekle</Text>
                <TouchableOpacity 
                  onPress={hideExpenseModal}
                >
                  <IconSymbol name="xmark.circle.fill" size={24} color={colors.icon} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Miktar (₺)</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A', color: colors.text }]}
                  value={expenseAmount}
                  onChangeText={setExpenseAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colors.icon}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Kategori</Text>
                <View style={styles.categoryButtons}>
                  {categories.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.categoryButton,
                        { backgroundColor: expenseCategory === category.name ? category.color + '30' : colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A' }
                      ]}
                      onPress={() => setExpenseCategory(category.name)}
                    >
                      <IconSymbol name={category.icon as any} size={20} color={category.color} />
                      <Text style={[styles.categoryButtonText, { color: colors.text }]}>{category.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Açıklama</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A', color: colors.text }]}
                  value={expenseDescription}
                  onChangeText={setExpenseDescription}
                  placeholder="Açıklama girin"
                  placeholderTextColor={colors.icon}
                />
              </View>
              
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={addExpense}
              >
                <Text style={styles.submitButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Hedef Güncelleme Modalı */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={goalModalVisible}
          onRequestClose={() => setGoalModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Tasarruf Hedefi Güncelle</Text>
                <TouchableOpacity 
                  style={[styles.modalCloseButton, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => setGoalModalVisible(false)}
                >
                  <Text style={[styles.modalCloseButtonText, { color: colors.text }]}>İptal</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Yeni Hedef Miktar (₺)</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A', color: colors.text }]}
                  value={savingsGoalAmount}
                  onChangeText={setSavingsGoalAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colors.icon}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.modalActionButton, { backgroundColor: colors.primary }]}
                onPress={updateSavingsGoal}
              >
                <Text style={styles.modalActionButtonText}>Güncelle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* Bakiye Ekleme Modalı */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={balanceModalVisible}
          onRequestClose={() => setBalanceModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Bakiye Ekle</Text>
                <TouchableOpacity 
                  style={[styles.modalCloseButton, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => setBalanceModalVisible(false)}
                >
                  <Text style={[styles.modalCloseButtonText, { color: colors.text }]}>İptal</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Miktar (₺)</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A', color: colors.text }]}
                  value={balanceAmount}
                  onChangeText={setBalanceAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colors.icon}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Açıklama (isteğe bağlı)</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A', color: colors.text }]}
                  value={balanceDescription}
                  onChangeText={setBalanceDescription}
                  placeholder="Açıklama girin"
                  placeholderTextColor={colors.icon}
                />
              </View>
              
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={addBalance}
              >
                <Text style={styles.submitButtonText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Today's Summary Styles
  todaySummaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  todayDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  todayItem: {
    alignItems: 'center',
  },
  todayLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  todayAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  todayProgressContainer: {
    marginTop: 8,
  },
  todayProgressBackground: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  todayProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  todayProgressText: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  // Pie Chart Styles
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 13,
    marginBottom: 10,
  },
  chartContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  pieChartWrapper: {
    marginBottom: 4,
    alignItems: 'center',
    width: screenWidth < 380 ? '100%' : '45%',
  },
  pieChartOverlay: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieChartCenterText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pieChartCenterSubtext: {
    fontSize: 10,
  },
  legendContainer: {
    width: screenWidth < 380 ? '100%' : '50%',
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 8,
  },
  legendTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendCategoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendPercentage: {
    fontSize: 14,
    marginRight: 8,
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Balance Card Styles
  card: {
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  balanceAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  balanceAddButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Monthly Summary Styles
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  // Categories Styles
  sectionContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  // Category Cards Styles
  categoryCardsContainer: {
    marginBottom: 16,
  },
  categoryCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  categoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryCardTitleContainer: {
    flex: 1,
  },
  categoryCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryCardTransactions: {
    fontSize: 12,
  },
  categoryCardBody: {
    padding: 16,
  },
  categoryCardAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryCardAmountItem: {
    alignItems: 'center',
  },
  categoryCardAmountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  categoryCardAmountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryCardProgressContainer: {
    marginTop: 8,
  },
  categoryCardProgressBackground: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryCardProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryCardProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryCardProgressText: {
    fontSize: 12,
  },
  categoryCardOverBudget: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Quick Actions Styles
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Recent Transactions Styles
  recentTransactionsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  recentTransactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTransactionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
  },
  transactionsList: {
    paddingBottom: 8,
  },
  transactionCard: {
    width: 200,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionCategory: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transactionDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  transactionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  transactionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionActionText: {
    fontSize: 12,
    marginLeft: 4,
  },
  
  // Enhanced Quick Actions
  enhancedActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  enhancedActionButton: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  categoryButtonText: {
    marginLeft: 8,
    fontSize: 14,
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    width: '48%',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalActionButton: {
    width: '48%',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalActionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

