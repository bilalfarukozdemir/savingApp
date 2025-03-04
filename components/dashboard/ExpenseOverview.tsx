import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { formatCurrency } from '@/utils';
import { Surface, Divider } from '@/components/ui/PaperComponents';
import { BodyMedium, BodySmall, LabelMedium } from '@/components/ThemedText';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import Animated, { 
  FadeIn, 
  FadeInUp,
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing
} from 'react-native-reanimated';
import { EmptyState } from '@/components/ui/EmptyState';
import { PieChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';

// Ekran genişliğinden pasta grafik boyutu için
const { width: screenWidth } = Dimensions.get('window');
const chartSize = Math.min(screenWidth * 0.5, 160);

// Örnek kategori verileri
const SAMPLE_CATEGORIES = [
  { id: '1', name: 'Yiyecek', amount: 350, color: '#4CAF50', icon: 'restaurant' },
  { id: '2', name: 'Alışveriş', amount: 240, color: '#2196F3', icon: 'shopping-cart' },
  { id: '3', name: 'Ulaşım', amount: 180, color: '#FFC107', icon: 'directions-car' },
  { id: '4', name: 'Sağlık', amount: 120, color: '#F44336', icon: 'local-hospital' },
  { id: '5', name: 'Eğlence', amount: 100, color: '#9C27B0', icon: 'movie' },
];

export const ExpenseOverview: React.FC = () => {
  const { theme, isDark, paperTheme } = useTheme();
  const colors = Colors[theme];
  const router = useRouter();
  
  // Güvenli sayıya dönüştürme - NaN kontrolü
  const safeNumber = (value: number): number => {
    return isNaN(value) ? 0 : value;
  };
  
  // Animasyon değeri
  const animatedValue = useSharedValue(0);
  
  // Örnek veri kullanımı - gerçek FinanceContext'in fonksiyonları olmadığı için
  const expenseCategories = SAMPLE_CATEGORIES;
  const totalExpenses = SAMPLE_CATEGORIES.reduce((sum, cat) => sum + cat.amount, 0);
  
  // İlk 5 kategoriyi göster (en yüksek harcamalar)
  const topExpenseCategories = [...expenseCategories]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  // Pasta grafik veri formatı
  const chartData = topExpenseCategories.map(item => ({
    name: item.name,
    amount: item.amount,
    color: item.color || '#CCCCCC',
    legendFontColor: isDark ? '#FFFFFF' : '#333333',
    legendFontSize: 12
  }));
  
  // Kategori detayına gitme
  const viewCategoryDetails = (categoryId: string) => {
    // Router için tip hatası, geçici olarak onTap işlevini devre dışı bırakıyoruz
    // router.push(`/categories/${categoryId}`);
    console.log('Kategori detayı görüntülenecek:', categoryId);
  };
  
  // Animasyonlari başlat
  useEffect(() => {
    animatedValue.value = withTiming(1, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, []);
  
  // Animasyon stili
  const chartAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedValue.value,
      transform: [
        { scale: animatedValue.value }
      ]
    };
  });
  
  // Yüzde hesaplama
  const calculatePercentage = (amount: number) => {
    if (totalExpenses <= 0) return 0;
    return ((amount / totalExpenses) * 100).toFixed(1);
  };
  
  // Kategori kartı
  const renderCategoryItem = (category: any, index: number) => {
    const percentage = calculatePercentage(category.amount);
    
    return (
      <Animated.View
        key={category.id}
        entering={FadeInUp.delay(200 + index * 100).duration(300)}
        style={styles.categoryItem}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => viewCategoryDetails(category.id)}
          style={styles.categoryContent}
        >
          <Surface style={[styles.iconContainer, { backgroundColor: `${category.color}15` }]}>
            <ThemeIcon
              name={category.icon || 'category'}
              size={16}
              color={category.color}
              type="material"
            />
          </Surface>
          
          <View style={styles.categoryInfo}>
            <BodyMedium numberOfLines={1} style={styles.categoryName}>
              {category.name}
            </BodyMedium>
            
            <View style={styles.categoryDetails}>
              <BodySmall style={styles.categoryAmount}>
                {formatCurrency(category.amount)}
              </BodySmall>
              <View style={styles.percentageContainer}>
                <BodySmall style={styles.categoryPercentage}>
                  {percentage}%
                </BodySmall>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.container}
    >
      <View style={styles.chartRow}>
        {/* Pasta grafik */}
        <Animated.View style={[styles.chartContainer, chartAnimationStyle]}>
          <PieChart
            data={chartData}
            width={chartSize}
            height={chartSize}
            chartConfig={{
              backgroundColor: 'transparent',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="0"
            absolute
            hasLegend={false}
            center={[chartSize / 2, chartSize / 2]}
          />
          
          {/* Toplam harcama merkez bilgi etiketi */}
          <View style={styles.totalContainer}>
            <BodySmall style={styles.totalLabel}>Toplam</BodySmall>
            <BodyMedium style={styles.totalAmount}>{formatCurrency(totalExpenses)}</BodyMedium>
          </View>
        </Animated.View>
        
        {/* Kategori listesi */}
        <View style={styles.categoriesContainer}>
          {topExpenseCategories.map((category, index) => renderCategoryItem(category, index))}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  chartContainer: {
    width: chartSize,
    height: chartSize,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  totalContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalLabel: {
    opacity: 0.7,
    fontSize: 10,
  },
  totalAmount: {
    fontWeight: '600',
  },
  categoriesContainer: {
    flex: 1,
    minWidth: 150,
    paddingLeft: 16,
  },
  categoryItem: {
    marginBottom: 8,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryAmount: {
    fontSize: 12,
    opacity: 0.8,
  },
  percentageContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryPercentage: {
    fontSize: 10,
    fontWeight: '600',
  },
}); 