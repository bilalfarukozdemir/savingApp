import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/utils';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

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

const { width } = Dimensions.get('window');

const ExpenseAnalysisScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
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
  const monthlyExpenses = getMonthlyExpenseAnalysis();
  
  // Toplam tasarruf ilerleme yüzdesi
  const overallProgress = calculateOverallSavingsProgress();
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Harcama Analizi</Text>
      
      {/* Özet Bilgiler */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Toplam Bakiye</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(summary.balance)}</Text>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Toplam Harcama</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(summary.totalExpenses)}</Text>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Tasarruf Oranı</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>%{summary.savingsPercentage.toFixed(1)}</Text>
        </View>
      </View>
      
      {/* Harcama Dağılımı */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Harcama Dağılımı</Text>
        
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
      </View>
      
      {/* Kategori listesi */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Kategoriler</Text>
        
        {topCategories.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.text }]}>Henüz harcama kaydı yok</Text>
        ) : (
          topCategories.map(({ category, amount }) => (
            <View key={category} style={styles.categoryItem}>
              <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(category) }]} />
              
              <Text style={[styles.categoryName, { color: colors.text }]}>{category}</Text>
              
              <Text style={[styles.categoryAmount, { color: colors.text }]}>
                {formatCurrency(amount)}
              </Text>
              
              <Text style={[styles.categoryPercentage, { color: colors.text }]}>
                %{categoryPercentages[category]?.toFixed(1) || '0'}
              </Text>
              
              {/* İlerleme çubuğu */}
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${categoryPercentages[category]}%`,
                      backgroundColor: getCategoryColor(category) 
                    }
                  ]} 
                />
              </View>
            </View>
          ))
        )}
      </View>
      
      {/* Tasarruf İlerlemesi */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Toplam Tasarruf İlerlemesi</Text>
        
        <View style={styles.savingsContainer}>
          <View style={styles.progressBarOuterContainer}>
            <View 
              style={[
                styles.progressBarInner, 
                { 
                  width: `${overallProgress}%`,
                  backgroundColor: colors.primary 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text }]}>
            %{overallProgress.toFixed(1)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: '31%',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  pieChartContainer: {
    height: 150,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  pieSlice: {
    position: 'absolute',
    borderRadius: 50,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    flex: 2,
    fontSize: 14,
  },
  categoryAmount: {
    flex: 1.5,
    fontSize: 14,
    textAlign: 'right',
  },
  categoryPercentage: {
    flex: 0.8,
    fontSize: 14,
    textAlign: 'right',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#eaeaea',
    borderRadius: 1.5,
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  savingsContainer: {
    marginTop: 8,
  },
  progressBarOuterContainer: {
    height: 20,
    backgroundColor: '#eaeaea',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarInner: {
    height: '100%',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
});

export default ExpenseAnalysisScreen; 