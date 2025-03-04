import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/utils';
import { useTheme } from '@/context/ThemeContext';
import {
  Card,
  CardContent,
  CardTitle,
  Divider,
  ProgressBar,
  Surface
} from '@/components/ui/PaperComponents';
import {
  TitleLarge,
  TitleMedium,
  BodyMedium,
  BodySmall,
  LabelMedium,
  LabelSmall
} from '@/components/ThemedText';

// Grafik için renk paleti (kategori renkleri)
const CATEGORY_COLORS: Record<string, string> = {
  'Yemek': '#FF6B6B',
  'Ulaşım': '#4ECDC4',
  'Eğlence': '#FFD166',
  'Alışveriş': '#6B5CA5',
  'Ev': '#61A0AF',
  'Sağlık': '#70C1B3',
  'Eğitim': '#F9C80E',
  'Diğer': '#CCCCCC',
};

// Varsayılan renk alır veya yeni renk oluşturur
const getCategoryColor = (category: string): string => {
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }
  
  // Hash işlevi: kategori adından renk üretir
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
};

// Aylık harcama verileri için tip tanımlama
interface MonthlyExpense {
  month: string;
  amount: number;
}

const { width } = Dimensions.get('window');

const ExpenseAnalysisScreen: React.FC = () => {
  const { theme, paperTheme } = useTheme();
  
  const { 
    expenses,
    getCategoryTotals,
    getCategoryPercentages,
    getTopSpendingCategories,
    calculateOverallSavingsProgress,
    getFinancialSummary,
    getMonthlyExpenseAnalysis
  } = useFinance();
  
  // Finansal özet bilgileri
  const summary = getFinancialSummary();
  
  // Kategori bazlı harcamalar
  const categoryTotals = getCategoryTotals();
  const categoryPercentages = getCategoryPercentages();
  
  // En çok harcama yapılan 5 kategori
  const topCategories = getTopSpendingCategories(5);
  
  // Aylık harcama analizi
  const monthlyExpenses = getMonthlyExpenseAnalysis() as MonthlyExpense[];
  
  // Toplam tasarruf ilerleme yüzdesi
  const overallProgress = calculateOverallSavingsProgress();
  const overallProgressDecimal = overallProgress / 100;
  
  return (
    <ScrollView style={styles.container}>
      <TitleLarge style={styles.title}>Harcama Analizi</TitleLarge>
      
      {/* Özet Bilgiler */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <CardContent>
            <LabelMedium>Toplam Bakiye</LabelMedium>
            <TitleMedium>{formatCurrency(summary.balance)}</TitleMedium>
          </CardContent>
        </Card>
        
        <Card style={styles.summaryCard}>
          <CardContent>
            <LabelMedium>Toplam Harcama</LabelMedium>
            <TitleMedium>{formatCurrency(summary.totalExpenses)}</TitleMedium>
          </CardContent>
        </Card>
        
        <Card style={styles.summaryCard}>
          <CardContent>
            <LabelMedium>Tasarruf Oranı</LabelMedium>
            <TitleMedium>%{summary.savingsPercentage.toFixed(1)}</TitleMedium>
          </CardContent>
        </Card>
      </View>
      
      {/* Harcama Dağılımı */}
      <Card style={styles.sectionContainer}>
        <CardContent>
          <TitleMedium style={styles.sectionTitle}>Harcama Dağılımı</TitleMedium>
          
          {/* Pasta grafiği yerine basit daireler */}
          <View style={styles.pieChartContainer}>
            {topCategories.map((category, index) => (
              <View 
                key={category.category} 
                style={[
                  styles.pieSlice, 
                  { 
                    backgroundColor: getCategoryColor(category.category),
                    width: 40 + (categoryPercentages[category.category] * 0.8),
                    height: 40 + (categoryPercentages[category.category] * 0.8),
                    left: 30 + (index * 50),
                    zIndex: 10 - index
                  }
                ]} 
              />
            ))}
          </View>
        </CardContent>
      </Card>
      
      {/* Kategori listesi */}
      <Card style={styles.sectionContainer}>
        <CardContent>
          <TitleMedium style={styles.sectionTitle}>Kategoriler</TitleMedium>
          
          {topCategories.length === 0 ? (
            <BodyMedium style={styles.emptyText}>Henüz harcama kaydı yok</BodyMedium>
          ) : (
            topCategories.map(({ category, amount }) => (
              <View key={category} style={styles.categoryItem}>
                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(category) }]} />
                
                <BodyMedium style={styles.categoryName}>{category}</BodyMedium>
                
                <BodyMedium style={styles.categoryAmount}>
                  {formatCurrency(amount)}
                </BodyMedium>
                
                <LabelMedium style={styles.categoryPercentage}>
                  %{categoryPercentages[category]?.toFixed(1) || '0'}
                </LabelMedium>
                
                {/* İlerleme çubuğu */}
                <View style={styles.progressBarContainer}>
                  <ProgressBar 
                    progress={categoryPercentages[category] / 100}
                    color={getCategoryColor(category)}
                    style={styles.progressBar}
                  />
                </View>
              </View>
            ))
          )}
        </CardContent>
      </Card>
      
      {/* Aylık harcama trendi */}
      <Card style={styles.sectionContainer}>
        <CardContent>
          <TitleMedium style={styles.sectionTitle}>Aylık Harcama Trendi</TitleMedium>
          
          {monthlyExpenses.length === 0 ? (
            <BodyMedium style={styles.emptyText}>Henüz yeterli veri yok</BodyMedium>
          ) : (
            <View style={styles.barChartContainer}>
              {monthlyExpenses.map((monthData: MonthlyExpense) => (
                <View key={monthData.month} style={styles.barChartItem}>
                  <View 
                    style={[
                      styles.barChart, 
                      { 
                        height: Math.max(20, (monthData.amount / summary.totalExpenses) * 150),
                        backgroundColor: paperTheme.colors.primary,
                      }
                    ]} 
                  />
                  <LabelSmall style={styles.barChartLabel}>{monthData.month}</LabelSmall>
                </View>
              ))}
            </View>
          )}
        </CardContent>
      </Card>
      
      {/* Genel tasarruf durumu */}
      <Card style={styles.sectionContainer}>
        <CardContent>
          <TitleMedium style={styles.sectionTitle}>Tasarruf Durumu</TitleMedium>
          
          <View style={styles.savingsContainer}>
            <View style={styles.savingsInfo}>
              <BodyMedium style={styles.savingsLabel}>Tasarruf İlerlemesi</BodyMedium>
              <TitleMedium style={styles.savingsPercentage}>%{overallProgress.toFixed(1)}</TitleMedium>
            </View>
            
            <ProgressBar 
              progress={overallProgressDecimal}
              color={paperTheme.colors.primary}
              style={styles.savingsProgressBar}
            />
            
            <View style={styles.savingsStatsContainer}>
              <View style={styles.savingsStatItem}>
                <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
                  Toplam Harcama
                </LabelSmall>
                <BodyMedium>
                  {formatCurrency(summary.totalExpenses)}
                </BodyMedium>
              </View>
              
              <View style={styles.savingsStatItem}>
                <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
                  Toplam Tasarruf
                </LabelSmall>
                <BodyMedium>
                  {formatCurrency(summary.totalSavings)}
                </BodyMedium>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: (width - 40) / 3,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  pieChartContainer: {
    height: 120,
    position: 'relative',
    marginBottom: 16,
  },
  pieSlice: {
    position: 'absolute',
    borderRadius: 50,
    top: 10,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    left: 0,
    top: 4,
  },
  categoryName: {
    marginLeft: 20,
    marginBottom: 4,
  },
  categoryAmount: {
    marginLeft: 20,
    marginBottom: 4,
  },
  categoryPercentage: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  progressBarContainer: {
    marginLeft: 20,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    opacity: 0.6,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 10,
  },
  barChartItem: {
    alignItems: 'center',
    width: 30,
  },
  barChart: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  barChartLabel: {
    textAlign: 'center',
  },
  savingsContainer: {
    marginTop: 10,
  },
  savingsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  savingsLabel: {
    fontWeight: '500',
  },
  savingsPercentage: {
    fontWeight: 'bold',
  },
  savingsProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  savingsStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  savingsStatItem: {
    width: '48%',
  },
});

export default ExpenseAnalysisScreen; 