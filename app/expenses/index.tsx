import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFinance } from '@/context/FinanceContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { formatCurrency, formatDate } from '@/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import PieChart from 'react-native-pie-chart/v3api';

const { width: screenWidth } = Dimensions.get('window');

export default function ExpensesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { expenses, getCategoryTotals, getCategoryPercentages } = useFinance();
  
  // Harcamaları tarihe göre sırala (en yeniden en eskiye)
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Kategori bazlı toplam harcamalar
  const categoryTotals = getCategoryTotals();
  
  // Kategori yüzdeleri
  const categoryPercentages = getCategoryPercentages();
  
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
  
  // Pie chart için veri hazırlama
  const pieChartData = Object.entries(categoryTotals).map(([_, value]) => value);
  const pieChartColors = Object.entries(categoryTotals).map(([category]) => 
    categoryColors[category] || '#607D8B'
  );
  
  // Toplam harcama tutarı
  const totalExpense = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
  
  // Pie chart boyutu
  const pieChartSize = screenWidth < 380 ? 150 : 180;
  
  // Yeni harcama ekle
  const addNewExpense = () => {
    router.push('/(tabs)?action=newExpense');
  };

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right
        }
      ]}
    >
      <Stack.Screen 
        options={{ 
          title: 'Harcamalarım',
          headerShown: false 
        }} 
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Harcamalarım</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={addNewExpense}
        >
          <IconSymbol name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="Henüz Harcama Yok"
            message="Harcamalarınızı ekleyerek finansal durumunuzu takip edin."
            icon="receipt"
          />
          <TouchableOpacity 
            style={[styles.addExpenseButton, { backgroundColor: colors.primary }]}
            onPress={addNewExpense}
          >
            <IconSymbol name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.addExpenseButtonText}>Harcama Ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Pie Chart Bölümü */}
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Harcama Dağılımı
            </Text>
            
            <View style={styles.chartContent}>
              {/* Pie Chart */}
              <View style={styles.pieChartContainer}>
                <PieChart
                  widthAndHeight={pieChartSize}
                  series={pieChartData}
                  sliceColor={pieChartColors}
                  coverRadius={0.65}
                  coverFill={colors.card}
                />
                <View style={styles.pieChartCenter}>
                  <Text style={[styles.pieChartCenterValue, { color: colors.text }]}>
                    {formatCurrency(totalExpense)}
                  </Text>
                  <Text style={[styles.pieChartCenterLabel, { color: colors.textMuted }]}>
                    Toplam
                  </Text>
                </View>
              </View>
              
              {/* Pie Chart Açıklaması */}
              <View style={styles.legendContainer}>
                {Object.entries(categoryTotals).map(([category, amount], index) => (
                  <View key={index} style={styles.legendItem}>
                    <View 
                      style={[
                        styles.legendColor, 
                        { backgroundColor: categoryColors[category] || '#607D8B' }
                      ]} 
                    />
                    <Text style={[styles.legendCategory, { color: colors.text }]}>
                      {category}
                    </Text>
                    <Text style={[styles.legendPercentage, { color: colors.textMuted }]}>
                      %{(categoryPercentages[category] || 0).toFixed(1)}
                    </Text>
                    <Text style={[styles.legendAmount, { color: colors.text }]}>
                      {formatCurrency(amount)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          {/* Harcama Listesi */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Harcamalar</Text>
          
          <FlatList
            data={sortedExpenses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={[styles.expenseItem, { backgroundColor: colors.card }]}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryColors[item.category] || '#607D8B' }]}>
                  <Text style={styles.categoryBadgeText}>{item.category.charAt(0)}</Text>
                </View>
                <View style={styles.expenseDetails}>
                  <View style={styles.expenseHeader}>
                    <Text style={[styles.expenseCategory, { color: colors.text }]}>{item.category}</Text>
                    <Text style={[styles.expenseAmount, { color: colors.text }]}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                  {item.description && (
                    <Text style={[styles.expenseDescription, { color: colors.textMuted }]}>
                      {item.description}
                    </Text>
                  )}
                  <Text style={[styles.expenseDate, { color: colors.textMuted }]}>
                    {formatDate(item.date)}
                  </Text>
                </View>
              </View>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  expenseItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expenseDetails: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expenseDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  addExpenseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  // Pie Chart Stilleri
  chartCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContent: {
    flexDirection: screenWidth < 500 ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth < 500 ? '100%' : '40%',
    marginBottom: screenWidth < 500 ? 24 : 0,
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
  legendContainer: {
    width: screenWidth < 500 ? '100%' : '55%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendCategory: {
    flex: 1,
    fontSize: 14,
  },
  legendPercentage: {
    fontSize: 14,
    marginRight: 8,
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '500',
    width: 80,
    textAlign: 'right',
  },
}); 