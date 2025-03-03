import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Switch, Modal, TextInput, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFinance } from '@/context/FinanceContext';
import PieChart from 'react-native-pie-chart/v3api';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing, FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';

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
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile } = useFinance();
  
  // Tema değiştirme state'i
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  
  // Modal state'leri
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  
  // Form state'leri
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [savingsGoalAmount, setSavingsGoalAmount] = useState('');
  
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
  
  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Gerçek uygulamada burada tema değiştirme işlemi yapılır
  };
  
  // Harcama ekleme fonksiyonu
  const addExpense = () => {
    // Gerçek uygulamada burada harcama ekleme işlemi yapılır
    console.log('Harcama eklendi:', { expenseAmount, expenseCategory, expenseDescription });
    setExpenseModalVisible(false);
    setExpenseAmount('');
    setExpenseCategory('');
    setExpenseDescription('');
  };
  
  // Tasarruf hedefi güncelleme fonksiyonu
  const updateSavingsGoal = () => {
    // Gerçek uygulamada burada tasarruf hedefi güncelleme işlemi yapılır
    console.log('Tasarruf hedefi güncellendi:', savingsGoalAmount);
    setGoalModalVisible(false);
    setSavingsGoalAmount('');
  };

  // Modal açma fonksiyonları
  const openExpenseModal = () => {
    console.log('Harcama modalı açılıyor');
    setExpenseModalVisible(true);
  };

  const openGoalModal = () => {
    console.log('Hedef modalı açılıyor');
    setGoalModalVisible(true);
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
              {isDarkMode ? '🌙' : '☀️'}
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Kayan Güncelleme Kartı - Son İşlemler */}
        <Animated.View 
          entering={FadeIn.duration(800).delay(300)}
          style={[styles.card, styles.recentTransactionsCard, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A' }]}
        >
          <View style={styles.recentTransactionsHeader}>
            <Text style={[styles.recentTransactionsTitle, { color: colors.text }]}>Son İşlemler</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.tint }]}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={recentTransactions}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Animated.View 
                entering={SlideInRight.duration(400).delay(parseInt(item.id) * 100)}
                style={[styles.transactionCard, { backgroundColor: colors.background }]}
              >
                <View style={styles.transactionHeader}>
                  <Text style={[styles.transactionCategory, { color: colors.text }]}>{item.category}</Text>
                  <Text style={[styles.transactionDate, { color: colors.icon }]}>{item.date}</Text>
                </View>
                <Text style={[styles.transactionAmount, { color: colors.text }]}>₺{item.amount}</Text>
                <Text style={[styles.transactionDescription, { color: colors.icon }]}>{item.description}</Text>
                <View style={styles.transactionActions}>
                  <TouchableOpacity style={styles.transactionAction}>
                    <IconSymbol name="pencil" size={16} color={colors.tint} />
                    <Text style={[styles.transactionActionText, { color: colors.tint }]}>Düzenle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.transactionAction}>
                    <IconSymbol name="trash" size={16} color="#F44336" />
                    <Text style={[styles.transactionActionText, { color: "#F44336" }]}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
            contentContainerStyle={styles.transactionsList}
          />
        </Animated.View>

        {/* Today's Summary */}
        <Animated.View 
          entering={FadeIn.duration(800).delay(400)}
          style={[styles.card, styles.todaySummaryCard, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A' }]}
        >
          <Text style={[styles.todayTitle, { color: colors.text }]}>Bugün</Text>
          <View style={styles.todayDetails}>
            <View style={styles.todayItem}>
              <Text style={[styles.todayLabel, { color: colors.icon }]}>Günlük Bütçe</Text>
              <Text style={[styles.todayAmount, { color: colors.text }]}>₺{dailyBudget}</Text>
            </View>
            <View style={styles.todayItem}>
              <Text style={[styles.todayLabel, { color: colors.icon }]}>Harcanan</Text>
              <Text style={[styles.todayAmount, { color: '#F44336' }]}>₺{todaySpent}</Text>
            </View>
            <View style={styles.todayItem}>
              <Text style={[styles.todayLabel, { color: colors.icon }]}>Kalan</Text>
              <Text style={[styles.todayAmount, { color: '#4CAF50' }]}>₺{remainingBudget}</Text>
            </View>
          </View>
          <View style={styles.todayProgressContainer}>
            <View style={styles.todayProgressBackground}>
              <View 
                style={[
                  styles.todayProgressBar, 
                  { 
                    width: `${(todaySpent / dailyBudget) * 100}%`,
                    backgroundColor: todaySpent > dailyBudget ? '#F44336' : '#4CAF50'
                  }
                ]} 
              />
            </View>
            <Text style={[styles.todayProgressText, { color: colors.icon }]}>
              {Math.round((todaySpent / dailyBudget) * 100)}% kullanıldı
            </Text>
          </View>
        </Animated.View>

        {/* Balance Card with Animation - Simplified */}
        <View style={[styles.card, { 
          backgroundColor: '#2196F3', 
          marginTop: 16,
          marginBottom: 16,
          padding: 16,
        }]}>
          <Text style={{ 
            fontSize: 16, 
            color: 'rgba(255, 255, 255, 0.9)', 
            marginBottom: 6,
            fontWeight: '500'
          }}>Toplam Bakiye</Text>
          
          <Text style={{ 
            fontSize: 32, 
            fontWeight: 'bold', 
            color: '#fff', 
            marginBottom: 16 
          }}>₺{currentBalance.toLocaleString()}</Text>
          
          <View style={{ marginTop: 8 }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              marginBottom: 8 
            }}>
              <Text style={{ 
                fontSize: 14, 
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500'
              }}>Tasarruf Hedefi</Text>
              <Text style={{ 
                fontSize: 14, 
                color: '#fff',
                fontWeight: '600'
              }}>₺{savingsGoal.toLocaleString()}</Text>
            </View>
            
            <View style={{ 
              height: 8, 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: 4, 
              overflow: 'hidden' 
            }}>
              <View style={{ 
                width: `${savingsProgress}%`, 
                height: '100%', 
                backgroundColor: '#fff', 
                borderRadius: 4 
              }} />
            </View>
            
            <Text style={{ 
              fontSize: 12, 
              color: 'rgba(255, 255, 255, 0.9)', 
              textAlign: 'right', 
              marginTop: 4 
            }}>
              {Math.round(savingsProgress)}% tamamlandı
            </Text>
          </View>
        </View>

        {/* Monthly Summary */}
        <Animated.View 
          entering={FadeIn.duration(800).delay(700)}
          style={[styles.summaryContainer, { marginTop: 8 }]}
        >
          <View style={[styles.summaryCard, { backgroundColor: colors.background }]}>
            <View style={[styles.iconContainer, { backgroundColor: '#4CAF5020' }]}>
              <IconSymbol name="arrow.down.circle.fill" size={24} color="#4CAF50" />
            </View>
            <Text style={[styles.summaryAmount, { color: colors.text }]}>₺{monthlyExpenses.toLocaleString()}</Text>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>Aylık Harcama</Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: colors.background }]}>
            <View style={[styles.iconContainer, { backgroundColor: '#2196F320' }]}>
              <IconSymbol name="arrow.up.circle.fill" size={24} color="#2196F3" />
            </View>
            <Text style={[styles.summaryAmount, { color: colors.text }]}>₺{monthlySavings.toLocaleString()}</Text>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>Aylık Tasarruf</Text>
          </View>
        </Animated.View>

        {/* Expense Visualization - Pie Chart */}
        <Animated.View 
          entering={FadeIn.duration(800).delay(600)}
          style={[styles.card, { 
            backgroundColor: colors.background === '#fff' ? '#fff' : '#2A2A2A', 
            padding: 12, 
            paddingBottom: 6,
            marginBottom: 0
          }]}
        >
          <Text style={[styles.chartTitle, { color: colors.text }]}>Harcama Dağılımı</Text>
          <Text style={[styles.chartSubtitle, { color: colors.icon }]}>Toplam: ₺{totalExpenses.toLocaleString()}</Text>
          
          <View style={styles.chartContainer}>
            {/* Pie Chart */}
            <View style={styles.pieChartWrapper}>
              <View style={styles.pieChartOverlay}>
                <PieChart
                  widthAndHeight={pieChartSize}
                  series={pieChartData as any}
                  sliceColor={pieChartColors}
                  coverRadius={0.65}
                  coverFill={colors.background === '#fff' ? '#fff' : '#2A2A2A'}
                />
                <View style={styles.pieChartCenter}>
                  <Text style={[styles.pieChartCenterText, { color: colors.text }]}>
                    {monthlyExpenses.toLocaleString()}₺
                  </Text>
                  <Text style={[styles.pieChartCenterSubtext, { color: colors.icon }]}>
                    Bu Ay
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Legend */}
            <View style={styles.legendContainer}>
              {categories.map((category, index) => (
                <View key={`legend-${index}`} style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: category.color }]} />
                  <View style={styles.legendTextContainer}>
                    <Text style={[styles.legendCategoryName, { color: colors.text }]}>
                      {category.name}
                    </Text>
                    <View style={styles.legendDetails}>
                      <Text style={[styles.legendPercentage, { color: colors.icon }]}>
                        {category.percentage}%
                      </Text>
                      <Text style={[styles.legendAmount, { color: colors.text }]}>
                        ₺{category.amount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Expense Categories - Modern Card UI */}
        <Animated.View 
          entering={FadeIn.duration(800).delay(800)}
          style={styles.sectionContainer}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Harcama Kategorileri</Text>
          
          {/* Category Cards */}
          <View style={styles.categoryCardsContainer}>
            {categories.map((category, index) => {
              const usagePercentage = (category.amount / category.budget) * 100;
              const isOverBudget = category.remaining < 0;
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.categoryCard, 
                    { 
                      backgroundColor: colors.background === '#fff' ? '#fff' : '#2A2A2A',
                      borderLeftColor: category.color,
                    }
                  ]}
                >
                  <View style={styles.categoryCardHeader}>
                    <View style={[styles.categoryCardIcon, { backgroundColor: category.color + '20' }]}>
                      <IconSymbol name={category.icon as any} size={24} color={category.color} />
                    </View>
                    <View style={styles.categoryCardTitleContainer}>
                      <Text style={[styles.categoryCardTitle, { color: colors.text }]}>{category.name}</Text>
                      <Text style={[styles.categoryCardTransactions, { color: colors.icon }]}>
                        {category.transactions} işlem
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.categoryCardBody}>
                    <View style={styles.categoryCardAmounts}>
                      <View style={styles.categoryCardAmountItem}>
                        <Text style={[styles.categoryCardAmountLabel, { color: colors.icon }]}>Harcama</Text>
                        <Text style={[styles.categoryCardAmountValue, { color: colors.text }]}>
                          ₺{category.amount.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.categoryCardAmountItem}>
                        <Text style={[styles.categoryCardAmountLabel, { color: colors.icon }]}>Bütçe</Text>
                        <Text style={[styles.categoryCardAmountValue, { color: colors.text }]}>
                          ₺{category.budget.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.categoryCardAmountItem}>
                        <Text style={[styles.categoryCardAmountLabel, { color: colors.icon }]}>Kalan</Text>
                        <Text 
                          style={[
                            styles.categoryCardAmountValue, 
                            { color: isOverBudget ? '#F44336' : '#4CAF50' }
                          ]}
                        >
                          {isOverBudget ? '-' : ''}₺{Math.abs(category.remaining).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.categoryCardProgressContainer}>
                      <View style={styles.categoryCardProgressBackground}>
                        <View 
                          style={[
                            styles.categoryCardProgressBar, 
                            { 
                              width: `${Math.min(usagePercentage, 100)}%`,
                              backgroundColor: isOverBudget ? '#F44336' : category.color
                            }
                          ]} 
                        />
                      </View>
                      <View style={styles.categoryCardProgressLabels}>
                        <Text style={[styles.categoryCardProgressText, { color: colors.icon }]}>
                          {Math.round(usagePercentage)}% kullanıldı
                        </Text>
                        {isOverBudget && (
                          <Text style={[styles.categoryCardOverBudget, { color: '#F44336' }]}>
                            Bütçe aşıldı
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Enhanced Quick Actions */}
        <Animated.View 
          entering={FadeIn.duration(800).delay(900)}
          style={styles.sectionContainer}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hızlı İşlemler</Text>
          
          <View style={styles.enhancedActionsContainer}>
            <TouchableOpacity 
              style={[styles.enhancedActionButton, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A' }]}
              onPress={openExpenseModal}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#4CAF5020' }]}>
                <IconSymbol name="plus.circle.fill" size={24} color="#4CAF50" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Harcama Ekle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.enhancedActionButton, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A' }]}
              onPress={openGoalModal}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFC10720' }]}>
                <IconSymbol name="star.fill" size={24} color="#FFC107" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Hedef Güncelle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.enhancedActionButton, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A' }]}>
              <View style={[styles.actionIcon, { backgroundColor: '#2196F320' }]}>
                <IconSymbol name="chart.bar.fill" size={24} color="#2196F3" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Rapor Görüntüle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.enhancedActionButton, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A' }]}>
              <View style={[styles.actionIcon, { backgroundColor: '#9C27B020' }]}>
                <IconSymbol name="bell.fill" size={24} color="#9C27B0" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Hatırlatıcı Kur</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Harcama Ekleme Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={expenseModalVisible}
        onRequestClose={() => {
          console.log('Modal kapatıldı');
          setExpenseModalVisible(false);
        }}
        statusBarTranslucent={true}
      >
        <View style={[styles.modalOverlay, { zIndex: 1000 }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Harcama Ekle</Text>
              <TouchableOpacity 
                onPress={() => {
                  console.log('Modal kapatma butonuna tıklandı');
                  setExpenseModalVisible(false);
                }}
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
              style={[styles.submitButton, { backgroundColor: colors.tint }]}
              onPress={() => {
                console.log('Kaydet butonuna tıklandı');
                addExpense();
              }}
            >
              <Text style={styles.submitButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Tasarruf Hedefi Güncelleme Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={goalModalVisible}
        onRequestClose={() => {
          console.log('Hedef modal kapatıldı');
          setGoalModalVisible(false);
        }}
        statusBarTranslucent={true}
      >
        <View style={[styles.modalOverlay, { zIndex: 1000 }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Tasarruf Hedefi Güncelle</Text>
              <TouchableOpacity 
                onPress={() => {
                  console.log('Hedef modal kapatma butonuna tıklandı');
                  setGoalModalVisible(false);
                }}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.icon} />
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
              style={[styles.submitButton, { backgroundColor: colors.tint }]}
              onPress={() => {
                console.log('Güncelle butonuna tıklandı');
                updateSavingsGoal();
              }}
            >
              <Text style={styles.submitButtonText}>Güncelle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 16,
    marginTop: 6,
    backgroundColor: '#2196F3',
  },
  balanceTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  savingsGoalContainer: {
    marginTop: 8,
  },
  savingsLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  savingsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  savingsGoalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  savingsProgressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
    marginTop: 4,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  formInput: {
    borderRadius: 8,
    padding: 12,
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
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

