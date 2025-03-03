import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFinance } from '@/context/FinanceContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '@/utils';

export const ExpenseOverview: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
    'Diğer': '#607D8B'
  };
  
  // Harcama detayına git
  const viewExpenseDetails = async () => {
    await markDataAsSeen('expenses');
    setShowTutorial(false);
    router.push('/expenses');
  };
  
  // Yeni harcama ekleme sayfasına git
  const addNewExpense = () => {
    showExpenseModal();
  };
  
  // Veri yok - Boş durum
  if (!hasExpenses) {
    return (
      <Animated.View 
        entering={FadeIn.duration(500)} 
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <EmptyState
          title="Harcama Ekle"
          message="Finansal durumunuzu takip etmek için harcamalarınızı ekleyin."
          icon="receipt"
          containerStyle={{ backgroundColor: 'transparent' }}
        />
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={addNewExpense}
        >
          <IconSymbol name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>Harcama Ekle</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
  
  // Veri var ama ilk kez görüntüleniyor - Eğitim/tanıtım
  if (showTutorial) {
    return (
      <Animated.View 
        entering={FadeIn.duration(500)} 
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <View style={styles.tutorialContainer}>
          <IconSymbol name="lightbulb" size={32} color={colors.primary} style={styles.tutorialIcon} />
          <Text style={[styles.tutorialTitle, { color: colors.text }]}>Harcama Analiziniz</Text>
          <Text style={[styles.tutorialText, { color: colors.textMuted }]}>
            Burada harcamalarınızın kategorilere göre dağılımını görebilirsiniz.
            En çok harcama yaptığınız alanları takip edebilirsiniz.
          </Text>
        </View>
        
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>Harcama Analizi</Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            {formatCurrency(totalExpenses)}
          </Text>
        </View>
        
        <View style={styles.categoriesContainer}>
          {topCategories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryDot, { backgroundColor: categoryColors[category.category] || '#607D8B' }]} />
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.category}</Text>
                <Text style={[styles.categoryAmount, { color: colors.text }]}>
                  {formatCurrency(category.amount)}
                </Text>
              </View>
              <View style={styles.categoryDetailsRow}>
                <Text style={[styles.categoryPercentage, { color: colors.text }]}>
                  {`${Math.round((category.amount / totalExpenses) * 100)}%`}
                </Text>
                <Text style={[styles.categoryDescription, { color: colors.secondaryText }]}>
                  toplam harcamanın
                </Text>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary, marginRight: 8, flex: 1 }]}
            onPress={viewExpenseDetails}
          >
            <Text style={styles.buttonText}>Tüm Harcamaları Görüntüle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary, marginLeft: 8, flex: 1 }]}
            onPress={addNewExpense}
          >
            <IconSymbol name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>Harcama Ekle</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }
  
  // Normal görünüm - Veri var ve daha önce görüntülenmiş
  return (
    <Animated.View 
      entering={FadeIn.duration(500)} 
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Harcama Analizi</Text>
        <Text style={[styles.totalAmount, { color: colors.text }]}>
          {formatCurrency(totalExpenses)}
        </Text>
      </View>
      
      <View style={styles.categoriesContainer}>
        {topCategories.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryDot, { backgroundColor: categoryColors[category.category] || '#607D8B' }]} />
              <Text style={[styles.categoryName, { color: colors.text }]}>{category.category}</Text>
              <Text style={[styles.categoryAmount, { color: colors.text }]}>
                {formatCurrency(category.amount)}
              </Text>
            </View>
            <View style={styles.categoryDetailsRow}>
              <Text style={[styles.categoryPercentage, { color: colors.text }]}>
                {`${Math.round((category.amount / totalExpenses) * 100)}%`}
              </Text>
              <Text style={[styles.categoryDescription, { color: colors.secondaryText }]}>
                toplam harcamanın
              </Text>
            </View>
          </View>
        ))}
      </View>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary, marginRight: 8, flex: 1 }]}
          onPress={viewExpenseDetails}
        >
          <Text style={styles.buttonText}>Tüm Harcamaları Görüntüle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary, marginLeft: 8, flex: 1 }]}
          onPress={addNewExpense}
        >
          <IconSymbol name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>Harcama Ekle</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  categoryDescription: {
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  tutorialContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  tutorialIcon: {
    marginBottom: 12,
  },
  tutorialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tutorialText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
}); 