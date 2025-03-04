import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import { 
  Card, 
  Button, 
  IconButton, 
  Surface, 
  ProgressBar,
  Divider,
  ActivityIndicator,
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
import { LineChart } from 'react-native-chart-kit';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { formatCurrency } from '@/utils';
import { SavingsGoal } from '@/utils/models/types';

export default function SavingsGoalDetail() {
  const { paperTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Finance context'i kullan
  const { 
    savingsGoals, 
    addFundsToGoal, 
    withdrawFundsFromGoal,
    calculateGoalProgress,
    calculateRemainingAmount,
    calculateEstimatedTime,
  } = useFinance();

  // Seçilen hedefi bul
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactionHistory, setTransactionHistory] = useState<{
    id: string,
    goalId: string,
    amount: number,
    description?: string,
    isAddition: boolean,
    date: Date
  }[]>([]);

  // Hedefi yükle
  useEffect(() => {
    if (id) {
      const foundGoal = savingsGoals.find(g => g.id === id);
      if (foundGoal) {
        setGoal(foundGoal);
        
        // Demo amaçlı işlem geçmişi oluştur
        // Gerçek uygulamada bu bilgi API'den gelecektir
        const demoHistory = generateDemoTransactions(foundGoal);
        setTransactionHistory(demoHistory);
      }
      setLoading(false);
    }
  }, [id, savingsGoals]);

  // Demo işlem geçmişi oluştur
  const generateDemoTransactions = (goal: SavingsGoal) => {
    const now = new Date();
    const transactions = [];
    
    // Son 3 aya dağıtılmış rastgele işlemler
    for (let i = 0; i < 10; i++) {
      const isAddition = Math.random() > 0.3; // %70 ekleme, %30 çekme işlemi
      const randomAmount = Math.floor((Math.random() * 500) + 50);
      const daysAgo = Math.floor(Math.random() * 90); // Son 90 gün içinde
      const transactionDate = new Date();
      transactionDate.setDate(now.getDate() - daysAgo);
      
      transactions.push({
        id: `demo-${i}`,
        goalId: goal.id,
        amount: randomAmount,
        isAddition: isAddition,
        description: isAddition ? 'Para eklendi' : 'Para çekildi',
        date: transactionDate
      });
    }
    
    // Tarihe göre sırala (en yeni en üstte)
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  // Para ekleme işlemi
  const handleAddFunds = () => {
    if (goal) {
      // Savings sayfasındaki bottom sheet'i açacak şekilde yönlendir
      router.push({
        pathname: '/(tabs)/savings',
        params: { action: 'viewGoal', id: goal.id }
      });
    }
  };
  
  // Para çekme işlemi
  const handleWithdrawFunds = () => {
    if (goal) {
      // Savings sayfasındaki bottom sheet'i açacak şekilde yönlendir
      router.push({
        pathname: '/(tabs)/savings',
        params: { action: 'viewGoal', id: goal.id, withdraw: 'true' }
      });
    }
  };

  // Grafik verileri oluştur (demo)
  const chartData = {
    labels: ["Oca", "Şub", "Mar", "Nis", "May", "Haz"],
    datasets: [
      {
        data: goal ? [
          goal.currentAmount * 0.2,
          goal.currentAmount * 0.35,
          goal.currentAmount * 0.45,
          goal.currentAmount * 0.6,
          goal.currentAmount * 0.8,
          goal.currentAmount
        ] : [0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => goal ? goal.color : '#2196F3',
        strokeWidth: 2
      }
    ],
  };

  // Ekran genişliğini al
  const { width: screenWidth } = Dimensions.get('window');

  // İlerleme yüzdesi hesapla
  const progressPercentage = goal ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100) : 0;
  const progressValue = goal ? goal.currentAmount / goal.targetAmount : 0;

  // Kalan miktar
  const remainingAmount = goal ? goal.targetAmount - goal.currentAmount : 0;

  // Yükleniyor durumu
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ title: 'Tasarruf Hedefi', headerShown: true }} />
        <ActivityIndicator animating={true} size="large" />
        <BodyMedium style={styles.loadingText}>Yükleniyor...</BodyMedium>
      </View>
    );
  }

  // Hedef bulunamadı
  if (!goal) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ title: 'Tasarruf Hedefi', headerShown: true }} />
        <ThemeIcon name="alert-circle" size={48} color={paperTheme.colors.error} type="material-community" />
        <TitleMedium style={{ marginTop: 16, marginBottom: 8 }}>Hedef Bulunamadı</TitleMedium>
        <BodyMedium style={{ textAlign: 'center', paddingHorizontal: 40 }}>
          Aradığınız tasarruf hedefi bulunamadı veya silinmiş olabilir.
        </BodyMedium>
        <Button 
          mode="contained" 
          icon="arrow-left"
          onPress={() => router.back()}
          style={{ marginTop: 24 }}
        >
          Geri Dön
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
      <Stack.Screen 
        options={{ 
          title: goal.name,
          headerTintColor: paperTheme.colors.onBackground,
          headerStyle: {
            backgroundColor: paperTheme.colors.background,
          },
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hedef Kartı */}
        <Animated.View entering={FadeIn.duration(800).delay(300)}>
          <Card style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleContainer}>
                <Surface style={[styles.goalIconContainer, { backgroundColor: `${goal.color}30` }]}>
                  <ThemeIcon 
                    name={goal.icon || 'star'} 
                    size={28} 
                    color={goal.color} 
                    type="material-community" 
                  />
                </Surface>
                <TitleLarge style={{ marginLeft: 12 }}>{goal.name}</TitleLarge>
              </View>
              
              <View style={styles.goalActions}>
                <IconButton
                  icon="pencil"
                  mode="outlined"
                  size={20}
                  onPress={() => alert('Düzenleme özelliği henüz yapım aşamasında')}
                  style={{ marginLeft: 8 }}
                />
              </View>
            </View>
            
            <View style={styles.goalAmountsContainer}>
              <View style={styles.goalAmountItem}>
                <TitleMedium>{formatCurrency(goal.currentAmount)}</TitleMedium>
                <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>Mevcut Tutar</LabelSmall>
              </View>
              
              <View style={styles.goalDivider} />
              
              <View style={styles.goalAmountItem}>
                <TitleMedium>{formatCurrency(goal.targetAmount)}</TitleMedium>
                <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>Hedef Tutar</LabelSmall>
              </View>
              
              <View style={styles.goalDivider} />
              
              <View style={styles.goalAmountItem}>
                <TitleMedium>{formatCurrency(remainingAmount)}</TitleMedium>
                <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>Kalan</LabelSmall>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={progressValue} 
                color={goal.color} 
                style={styles.progressBar} 
              />
              <View style={styles.progressLabelContainer}>
                <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
                  %{progressPercentage} tamamlandı
                </LabelSmall>
                
                {goal.targetDate && (
                  <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    Hedef: {new Date(goal.targetDate).toLocaleDateString('tr-TR')}
                  </LabelSmall>
                )}
              </View>
            </View>
            
            <View style={styles.cardActionContainer}>
              <Button 
                mode="outlined" 
                icon="plus"
                onPress={handleAddFunds}
                style={[styles.actionButton, { borderColor: '#4CAF50' }]}
                textColor="#4CAF50"
              >
                Para Ekle
              </Button>
              
              <Button 
                mode="outlined" 
                icon="minus"
                onPress={handleWithdrawFunds}
                style={[styles.actionButton, { borderColor: '#F44336' }]}
                textColor="#F44336"
              >
                Para Çek
              </Button>
            </View>
          </Card>
        </Animated.View>
        
        {/* İlerleme Grafiği */}
        <Animated.View entering={FadeIn.duration(800).delay(400)}>
          <Card style={styles.chartCard}>
            <TitleMedium style={styles.cardTitle}>Tasarruf İlerlemesi</TitleMedium>
            <Divider style={styles.divider} />
            
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  backgroundColor: paperTheme.colors.background,
                  backgroundGradientFrom: paperTheme.colors.background,
                  backgroundGradientTo: paperTheme.colors.background,
                  decimalPlaces: 0,
                  color: (opacity = 1) => goal.color,
                  labelColor: (opacity = 1) => paperTheme.colors.onSurface,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: goal.color
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </View>
            
            <View style={styles.analyticsSummary}>
              <View style={styles.analyticItem}>
                <ThemeIcon 
                  name="trending-up" 
                  size={24} 
                  color="#4CAF50" 
                  type="material-community" 
                  style={{ marginBottom: 4 }} 
                />
                <BodyMedium style={styles.analyticValue}>%15</BodyMedium>
                <LabelSmall style={styles.analyticLabel}>Aylık Artış</LabelSmall>
              </View>
              
              <View style={styles.analyticItem}>
                <ThemeIcon 
                  name="calendar-clock" 
                  size={24} 
                  color="#FF9800" 
                  type="material-community" 
                  style={{ marginBottom: 4 }} 
                />
                <BodyMedium style={styles.analyticValue}>185</BodyMedium>
                <LabelSmall style={styles.analyticLabel}>Kalan Gün</LabelSmall>
              </View>
              
              <View style={styles.analyticItem}>
                <ThemeIcon 
                  name="piggy-bank" 
                  size={24} 
                  color="#2196F3" 
                  type="material-community" 
                  style={{ marginBottom: 4 }} 
                />
                <BodyMedium style={styles.analyticValue}>{formatCurrency(remainingAmount / 6)}</BodyMedium>
                <LabelSmall style={styles.analyticLabel}>Aylık Tasarruf</LabelSmall>
              </View>
            </View>
          </Card>
        </Animated.View>
        
        {/* Tasarruf Önerileri */}
        <Animated.View entering={FadeIn.duration(800).delay(500)}>
          <Card style={styles.tipsCard}>
            <TitleMedium style={styles.cardTitle}>Tasarruf Tavsiyeleri</TitleMedium>
            <Divider style={styles.divider} />
            
            <View style={styles.tipItem}>
              <ThemeIcon 
                name="lightbulb-on" 
                size={24} 
                color="#FF9800" 
                type="material-community" 
                style={styles.tipIcon} 
              />
              <View style={styles.tipContent}>
                <BodyMedium style={styles.tipTitle}>Otomatik Tasarruf</BodyMedium>
                <BodySmall style={styles.tipDescription}>
                  Maaşınızın %15'ini otomatik olarak bu hedefe aktarın. 
                  Bu düzenli tasarruf alışkanlığı oluşturmanıza yardımcı olacaktır.
                </BodySmall>
              </View>
            </View>
            
            <View style={styles.tipItem}>
              <ThemeIcon 
                name="cash-multiple" 
                size={24} 
                color="#4CAF50" 
                type="material-community" 
                style={styles.tipIcon} 
              />
              <View style={styles.tipContent}>
                <BodyMedium style={styles.tipTitle}>Küçük Harcamalardan Tasarruf</BodyMedium>
                <BodySmall style={styles.tipDescription}>
                  Günlük kahve alışkanlığınızı azaltarak aylık yaklaşık {formatCurrency(300)} tasarruf edebilirsiniz.
                </BodySmall>
              </View>
            </View>
            
            <View style={styles.tipItem}>
              <ThemeIcon 
                name="timer-sand" 
                size={24} 
                color="#9C27B0" 
                type="material-community" 
                style={styles.tipIcon} 
              />
              <View style={styles.tipContent}>
                <BodyMedium style={styles.tipTitle}>Hedefe Ulaşma Süresi</BodyMedium>
                <BodySmall style={styles.tipDescription}>
                  Mevcut tasarruf hızınızla, hedefinize {goal.targetDate ? 'belirlediğiniz tarihten önce' : '6 ay içinde'} ulaşabilirsiniz.
                </BodySmall>
              </View>
            </View>
          </Card>
        </Animated.View>
        
        {/* İşlem Geçmişi */}
        <Animated.View entering={FadeIn.duration(800).delay(600)}>
          <Card style={styles.historyCard}>
            <TitleMedium style={styles.cardTitle}>İşlem Geçmişi</TitleMedium>
            <Divider style={styles.divider} />
            
            {transactionHistory.length === 0 ? (
              <View style={styles.emptyHistoryContainer}>
                <ThemeIcon 
                  name="history" 
                  size={48} 
                  color={paperTheme.colors.onSurfaceVariant} 
                  type="material-community" 
                />
                <BodyMedium style={styles.emptyHistoryText}>
                  Henüz işlem bulunmuyor
                </BodyMedium>
              </View>
            ) : (
              <FlatList
                data={transactionHistory}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      <Surface 
                        style={[
                          styles.transactionIconBg, 
                          { backgroundColor: item.isAddition ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)' }
                        ]}
                      >
                        <ThemeIcon 
                          name={item.isAddition ? 'plus' : 'minus'} 
                          size={18} 
                          color={item.isAddition ? '#4CAF50' : '#F44336'} 
                          type="material-community" 
                        />
                      </Surface>
                    </View>
                    
                    <View style={styles.transactionInfo}>
                      <BodyMedium style={styles.transactionTitle}>
                        {item.isAddition ? 'Para Eklendi' : 'Para Çekildi'}
                      </BodyMedium>
                      <BodySmall style={styles.transactionDate}>
                        {item.date.toLocaleDateString('tr-TR', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </BodySmall>
                    </View>
                    
                    <BodyMedium 
                      style={[
                        styles.transactionAmount, 
                        { color: item.isAddition ? '#4CAF50' : '#F44336' }
                      ]}
                    >
                      {item.isAddition ? '+' : '-'}{formatCurrency(item.amount)}
                    </BodyMedium>
                  </View>
                )}
                scrollEnabled={false}
                nestedScrollEnabled={true}
                style={{ maxHeight: 400 }}
              />
            )}
            
            {transactionHistory.length > 5 && (
              <Button 
                mode="text"
                onPress={() => alert('Tüm işlemler özelliği henüz yapım aşamasında')}
                style={styles.viewAllButton}
              >
                Tüm İşlemleri Görüntüle
              </Button>
            )}
          </Card>
        </Animated.View>
      </ScrollView>
      
      {/* Düzenleme FAB */}
      <FAB
        icon="pencil"
        style={[styles.fab, { backgroundColor: goal.color }]}
        onPress={() => alert('Düzenleme özelliği henüz yapım aşamasında')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  goalCard: {
    margin: 16,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalActions: {
    flexDirection: 'row',
  },
  goalAmountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  goalAmountItem: {
    flex: 1,
    alignItems: 'center',
  },
  goalDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  analyticsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  analyticItem: {
    alignItems: 'center',
    flex: 1,
  },
  analyticValue: {
    fontWeight: 'bold',
  },
  analyticLabel: {
    color: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
  },
  tipsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tipIcon: {
    marginRight: 12,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipDescription: {
    color: 'rgba(0,0,0,0.6)',
  },
  historyCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyHistoryText: {
    marginTop: 12,
    color: 'rgba(0,0,0,0.6)',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  transactionIcon: {
    marginRight: 12,
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
  },
  transactionTitle: {
    fontWeight: '500',
  },
  transactionDate: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  transactionAmount: {
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 