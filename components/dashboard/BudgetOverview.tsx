import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import Animated, { FadeIn } from 'react-native-reanimated';
import { formatCurrency } from '@/utils';
import { 
  Surface,
  ProgressBar
} from '@/components/ui/PaperComponents';
import { 
  ThemedText, 
  TitleMedium, 
  BodyMedium, 
  BodySmall,
  LabelMedium
} from '@/components/ThemedText';

export const BudgetOverview: React.FC = () => {
  const { theme, isDark, paperTheme } = useTheme();
  const colors = Colors[theme];
  
  const { 
    financialState, 
    userProfile,
  } = useFinance();
  
  // Güvenli sayıya dönüştürme - NaN kontrolü
  const safeNumber = (value: number): number => {
    return isNaN(value) ? 0 : value;
  };
  
  // Ay sonu tahmini
  const currentBalance = safeNumber(financialState.currentBalance || 0);
  const totalExpensesThisMonth = safeNumber(financialState.totalExpensesThisMonth || 0);
  const daysInMonth = 30; // Standart ay uzunluğu
  const currentDay = Math.min(new Date().getDate(), daysInMonth);
  const remainingDays = daysInMonth - currentDay;
  
  const dailyExpense = totalExpensesThisMonth > 0 ? totalExpensesThisMonth / currentDay : 0;
  const estimatedEndOfMonth = currentBalance - (dailyExpense * remainingDays);
  
  // Aylık gelir ve harcama hesaplamaları
  const monthlyIncome = safeNumber(userProfile?.monthlyIncome || 0);
  const totalExpenses = safeNumber(totalExpensesThisMonth);
  const remainingBudget = monthlyIncome - totalExpenses;
  
  // Bütçe kullanım yüzdesi
  const budgetUsagePercentage = monthlyIncome > 0 
    ? Math.min(safeNumber(totalExpenses / monthlyIncome), 1) 
    : 0;
  
  // İlerleme çubuğu rengi
  const getProgressColor = () => {
    if (budgetUsagePercentage < 0.5) return paperTheme.colors.primary;
    if (budgetUsagePercentage < 0.75) return paperTheme.colors.warning;
    return paperTheme.colors.error;
  };
  
  return (
    <Animated.View
      entering={FadeIn.duration(600).delay(200)}
    >
      <View style={styles.container}>
        <View style={styles.budgetRow}>
          <View style={styles.budgetItem}>
            <LabelMedium style={styles.label}>Aylık Gelir</LabelMedium>
            <BodyMedium style={[styles.value, { color: paperTheme.colors.primary }]}>
              {formatCurrency(monthlyIncome)}
            </BodyMedium>
          </View>
          
          <View style={styles.budgetItem}>
            <LabelMedium style={styles.label}>Toplam Harcama</LabelMedium>
            <BodyMedium style={[styles.value, { color: paperTheme.colors.error }]}>
              {formatCurrency(totalExpenses)}
            </BodyMedium>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelContainer}>
            <BodySmall style={styles.progressLabel}>Bütçe Kullanımı</BodySmall>
            <BodySmall style={styles.progressPercentage}>
              {Math.round(safeNumber(budgetUsagePercentage * 100))}%
            </BodySmall>
          </View>
          <ProgressBar 
            progress={safeNumber(budgetUsagePercentage)} 
            color={getProgressColor()} 
            style={styles.progressBar}
          />
        </View>
        
        <Surface style={styles.remainingBudget}>
          <View>
            <LabelMedium style={styles.remainingLabel}>
              Kalan Bütçe
            </LabelMedium>
            <BodyMedium style={[
              styles.remainingValue,
              { color: remainingBudget >= 0 ? paperTheme.colors.primary : paperTheme.colors.error }
            ]}>
              {formatCurrency(remainingBudget)}
            </BodyMedium>
          </View>
          
          <View>
            <LabelMedium style={styles.remainingLabel}>
              Tahmini Ay Sonu
            </LabelMedium>
            <BodyMedium style={[
              styles.remainingValue,
              { color: estimatedEndOfMonth >= 0 ? paperTheme.colors.primary : paperTheme.colors.error }
            ]}>
              {formatCurrency(estimatedEndOfMonth)}
            </BodyMedium>
          </View>
        </Surface>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetItem: {
    flex: 1,
  },
  label: {
    marginBottom: 4,
    opacity: 0.7,
  },
  value: {
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    opacity: 0.7,
  },
  progressPercentage: {
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  remainingBudget: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  remainingLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  remainingValue: {
    fontWeight: '600',
  },
}); 