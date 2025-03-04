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
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { CardContent, CardActions, Divider } from '@/components/ui/PaperComponents';
import { TitleLarge, TitleMedium, BodyMedium, BodySmall } from '@/components/ThemedText';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { Button, IconButton } from '@/components/ui/PaperComponents';
import { router } from 'expo-router';
import { BudgetOverview } from '@/components/dashboard/BudgetOverview';

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
    hideExpenseModal,
    refreshData
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
  }, [progressAnimation, balanceAnimation, savingsProgress]);
  
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

  const refreshDashboard = () => {
    // refreshData fonksiyonu FinanceContext'te tanımlı değilse hata vermesini engelle
    if (typeof refreshData === 'function') {
      const success = refreshData();
      if (success) {
        // Başarılı güncelleme durumunda kullanıcıya bildirim göster
        Alert.alert('Başarılı', 'Veriler başarıyla güncellendi!');
      } else {
        // Hata durumunda kullanıcıya bildirim göster
        Alert.alert('Hata', 'Veriler güncellenirken bir sorun oluştu.');
      }
    } else {
      console.log('refreshData fonksiyonu bulunamadı');
      Alert.alert('Hata', 'Veri güncelleme fonksiyonu bulunamadı.');
    }
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
        <View style={styles.header}>
          <TitleLarge>Finansal Özet</TitleLarge>
          <BodyMedium style={styles.subtitle}>
            Finansal durumunu kontrol et.
          </BodyMedium>
        </View>

        {/* Dashboard içeriği - Burada dashboard bileşenleri çağrılacak */}
        <View style={styles.dashboardContainer}>
          {/* Kullanıcı Karşılama Kartı */}
          <AnimatedCard 
            animationType="fade" 
            index={0}
            delay={100}
          >
            <CardContent>
              <TitleMedium>Hoş geldin, {userProfile?.name || 'Ziyaretçi'}</TitleMedium>
              <BodyMedium>Bugün finansal hedeflerine bir adım daha yaklaşabilirsin.</BodyMedium>
            </CardContent>
          </AnimatedCard>
          
          {/* Bütçe Özeti */}
          <AnimatedCard 
            animationType="slide" 
            index={1}
            delay={200}
          >
            <CardContent>
              <View style={styles.sectionHeader}>
                <TitleMedium>Bütçe Özeti</TitleMedium>
                <IconButton 
                  icon="refresh" 
                  onPress={refreshDashboard} 
                  size={20} 
                />
              </View>
              <BudgetOverview />
            </CardContent>
          </AnimatedCard>
          
          {/* Harcama Özeti */}
          <AnimatedCard 
            animationType="slide" 
            index={2}
            delay={300}
          >
            <CardContent>
              <View style={styles.sectionHeader}>
                <TitleMedium>Harcama Özeti</TitleMedium>
              </View>
              <ExpenseOverview />
            </CardContent>
          </AnimatedCard>
          
          {/* Son İşlemler */}
          <AnimatedCard 
            animationType="slide" 
            index={3}
            delay={400}
          >
            <CardContent>
              <View style={styles.sectionHeader}>
                <TitleMedium>Son İşlemler</TitleMedium>
                <Button 
                  mode="text" 
                  onPress={() => router.push('/transactions')}
                >
                  Tümünü Gör
                </Button>
              </View>
              <TransactionsOverview />
            </CardContent>
          </AnimatedCard>
          
          {/* Tasarruf Hedefleri */}
          <AnimatedCard 
            animationType="zoom" 
            index={4}
            delay={500}
          >
            <CardContent>
              <View style={styles.sectionHeader}>
                <TitleMedium>Tasarruf Hedefleri</TitleMedium>
                <Button 
                  mode="text" 
                  onPress={() => router.push('/savings')}
                >
                  Tümünü Gör
                </Button>
              </View>
              <SavingsOverview />
            </CardContent>
          </AnimatedCard>
        </View>

        <Button
          mode="contained"
          onPress={toggleTheme}
          style={styles.themeButton}
        >
          {isDark ? 'Aydınlık Tema' : 'Karanlık Tema'}
        </Button>
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  dashboardContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeButton: {
    margin: 20,
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

