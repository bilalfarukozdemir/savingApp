import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { ThemeIcon } from '../ui/ThemeIcon';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '@/utils';
import { 
  Surface, 
  Card,
  Button, 
  Divider
} from '@/components/ui/PaperComponents';
import { 
  ThemedText, 
  TitleLarge, 
  TitleMedium, 
  BodyMedium, 
  BodySmall, 
  LabelMedium 
} from '@/components/ThemedText';

export const ExpenseOverview: React.FC = () => {
  const { theme, isDark } = useTheme();
  const colors = Colors[theme];
  const router = useRouter();
  
  const { 
    expenses, 
    getCategoryTotals,
    getTopSpendingCategories,
    hasExpensesData,
    markDataAsSeen,
    showExpenseModal
  } = useFinance();
  
  // Veri durumunu kontrol et
  const hasExpenses = expenses.length > 0;
  const hasSeenExpenses = hasExpensesData();
  
  // İlk gösterim için state
  const [showTutorial, setShowTutorial] = useState(hasExpenses && !hasSeenExpenses);
  
  // Kategori toplamları
  const categoryTotals = getCategoryTotals();
  
  // En çok harcama yapılan kategoriler (ilk 3)
  const topCategories = getTopSpendingCategories(3);
  
  // Toplam harcama
  const totalExpenses = Object.values(categoryTotals).reduce((sum, current) => sum + current, 0);
  
  // Kategori renklerini tanımla
  const categoryColors: Record<string, string> = {
    'Yiyecek': '#FF9800',
    'Ulaşım': '#2196F3',
    'Barınma': '#9C27B0',
    'Sağlık': '#F44336',
    'Eğitim': '#4CAF50',
    'Eğlence': '#00BCD4',
    'Giyim': '#E91E63',
    'Alışveriş': '#FFEB3B',
    'Faturalar': '#795548',
    'Diğer': '#607D8B'
  };
  
  const viewExpenseDetails = async () => {
    if (hasExpenses) {
      // Verinin görüldüğünü işaretle
      await markDataAsSeen('expenses');
      // Ayrıntılar sayfasına yönlendir
      router.push('/expenses');
    }
  };
  
  const addNewExpense = () => {
    showExpenseModal();
  };
  
  if (!hasExpenses) {
    return (
      <Card style={styles.card}>
        <View style={{padding: 16}}>
          <TitleMedium style={styles.header}>Harcamalar</TitleMedium>
          <EmptyState 
            message="Henüz harcama kaydı bulunmuyor."
            icon="cart.fill"
            action={{
              title: "Harcama Ekle",
              onPress: addNewExpense
            }}
          />
        </View>
      </Card>
    );
  }
  
  return (
    <Card style={styles.card}>
      <Animated.View entering={FadeIn.duration(500)}>
        <View style={styles.headerRow}>
          <TitleMedium style={styles.header}>Harcamalar</TitleMedium>
          <Button 
            mode="text" 
            onPress={viewExpenseDetails}
            style={styles.viewAllButton}
          >
            Tümünü Gör
          </Button>
        </View>
        
        <View style={styles.totalSection}>
          <BodyMedium style={styles.totalLabel}>Toplam Harcama</BodyMedium>
          <TitleLarge style={styles.totalAmount}>
            {formatCurrency(totalExpenses)}
          </TitleLarge>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.topCategories}>
          <BodyMedium style={styles.sectionTitle}>En Çok Harcama</BodyMedium>
          
          {topCategories.map((item, index) => {
            const categoryColor = categoryColors[item.category] || colors.text;
            const percentage = Math.round((item.amount / totalExpenses) * 100);
            
            return (
              <View key={item.category} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                  <View>
                    <BodyMedium>{item.category}</BodyMedium>
                    <BodySmall style={styles.percentage}>{percentage}%</BodySmall>
                  </View>
                </View>
                <BodyMedium style={styles.categoryAmount}>
                  {formatCurrency(item.amount)}
                </BodyMedium>
              </View>
            );
          })}
        </View>
        
        <View style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={addNewExpense}
            icon="add-circle"
          >
            Harcama Ekle
          </Button>
        </View>
      </Animated.View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  viewAllButton: {
    marginRight: 8,
  },
  totalSection: {
    padding: 16,
    paddingTop: 0,
  },
  totalLabel: {
    marginBottom: 4,
    opacity: 0.7,
  },
  totalAmount: {
    fontSize: 28,
  },
  divider: {
    marginHorizontal: 16,
  },
  topCategories: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  percentage: {
    opacity: 0.6,
  },
  categoryAmount: {
    fontWeight: '500',
  },
  actions: {
    padding: 16,
    paddingTop: 8,
  },
}); 