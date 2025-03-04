import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, formatDate } from '@/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import PieChart from 'react-native-pie-chart/v3api';
import { useTheme } from '@/context/ThemeContext';
import { 
  Card, 
  Button, 
  Divider, 
  Surface, 
  IconButton,
  CardContent,
  CardTitle,
  CardActions
} from '@/components/ui/PaperComponents';
import { 
  ThemedText,
  LabelSmall,
  BodyMedium,
  BodySmall,
  TitleMedium,
  TitleLarge,
  LabelMedium
} from '@/components/ThemedText';
import { ThemeIcon } from '@/components/ui/ThemeIcon';

const { width: screenWidth } = Dimensions.get('window');

export default function ExpensesScreen() {
  const { theme, paperTheme } = useTheme();
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
        { paddingTop: insets.top }
      ]}
    >
      <Stack.Screen 
        options={{ 
          title: 'Harcamalarım',
          headerShown: false 
        }} 
      />
      
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left"
          onPress={() => router.back()}
          size={24}
        />
        <TitleLarge>Harcamalarım</TitleLarge>
        <IconButton 
          icon="plus"
          onPress={addNewExpense}
          iconColor={paperTheme.colors.primary}
          size={24}
        />
      </View>
      
      {expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="Henüz Harcama Yok"
            message="Harcamalarınızı ekleyerek finansal durumunuzu takip edin."
            icon="receipt"
          />
          <Button 
            mode="contained" 
            onPress={addNewExpense}
            icon="plus"
            style={styles.addExpenseButton}
          >
            Harcama Ekle
          </Button>
        </View>
      ) : (
        <>
          {/* Pie Chart Bölümü */}
          <Card style={styles.chartCard}>
            <CardContent>
              <TitleMedium style={styles.chartTitle}>
                Harcama Dağılımı
              </TitleMedium>
              
              <View style={styles.chartContent}>
                {/* Pie Chart */}
                <View style={styles.pieChartContainer}>
                  <PieChart
                    widthAndHeight={pieChartSize}
                    series={pieChartData}
                    sliceColor={pieChartColors}
                    coverRadius={0.65}
                    coverFill={paperTheme.colors.background}
                  />
                  <View style={styles.pieChartCenter}>
                    <TitleMedium>
                      {formatCurrency(totalExpense)}
                    </TitleMedium>
                    <LabelSmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      Toplam
                    </LabelSmall>
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
                      <BodyMedium style={styles.legendCategory}>
                        {category}
                      </BodyMedium>
                      <LabelMedium style={{ color: paperTheme.colors.onSurfaceVariant }}>
                        %{(categoryPercentages[category] || 0).toFixed(1)}
                      </LabelMedium>
                      <BodyMedium style={styles.legendAmount}>
                        {formatCurrency(amount)}
                      </BodyMedium>
                    </View>
                  ))}
                </View>
              </View>
            </CardContent>
          </Card>
          
          {/* Harcama Listesi */}
          <TitleMedium style={styles.sectionTitle}>Son Harcamalar</TitleMedium>
          
          <FlatList
            data={sortedExpenses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <Card style={styles.expenseItem}>
                <CardContent style={styles.expenseItemContent}>
                  <Surface style={[
                    styles.categoryBadge, 
                    { backgroundColor: categoryColors[item.category] || '#607D8B' }
                  ]}>
                    <ThemedText style={styles.categoryBadgeText}>{item.category.charAt(0)}</ThemedText>
                  </Surface>
                  <View style={styles.expenseDetails}>
                    <View style={styles.expenseHeader}>
                      <BodyMedium style={styles.expenseCategory}>{item.category}</BodyMedium>
                      <BodyMedium style={styles.expenseAmount}>
                        {formatCurrency(item.amount)}
                      </BodyMedium>
                    </View>
                    {item.description && (
                      <BodySmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
                        {item.description}
                      </BodySmall>
                    )}
                    <BodySmall style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      {formatDate(item.date)}
                    </BodySmall>
                  </View>
                </CardContent>
              </Card>
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
  },
  sectionTitle: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  expenseItem: {
    marginBottom: 12,
  },
  expenseItemContent: {
    flexDirection: 'row',
    padding: 8,
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
    fontWeight: '500',
  },
  expenseAmount: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  addExpenseButton: {
    marginTop: 16,
  },
  // Pie Chart Stilleri
  chartCard: {
    margin: 16,
    marginBottom: 8,
  },
  chartTitle: {
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
  },
  legendAmount: {
    fontWeight: '500',
    width: 80,
    textAlign: 'right',
  },
}); 