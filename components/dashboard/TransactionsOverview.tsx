import React from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { formatCurrency, formatDate } from '@/utils';
import { Card, Surface, Divider, Button } from '@/components/ui/PaperComponents';
import { BodyMedium, BodySmall, TitleMedium, LabelMedium } from '@/components/ThemedText';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { EmptyState } from '@/components/ui/EmptyState';

// Transaction tipi tanımı
interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  category: string;
  categoryId?: string; // Opsiyonel kategori ID'si
  description: string;
  date: Date;
  relatedGoalId?: string;
}

// Varsayılan kategori renkleri ve ikonları
const DEFAULT_CATEGORIES = {
  shopping: { icon: 'shopping-bag', color: '#4C9AFF' },
  food: { icon: 'restaurant', color: '#F2994A' },
  transport: { icon: 'directions-car', color: '#6FCF97' },
  entertainment: { icon: 'movie', color: '#BB6BD9' },
  health: { icon: 'favorite', color: '#EB5757' },
  home: { icon: 'home', color: '#219653' },
  other: { icon: 'receipt', color: '#828282' }
};

export const TransactionsOverview: React.FC = () => {
  const { theme, isDark, paperTheme } = useTheme();
  const colors = Colors[theme];
  const router = useRouter();
  
  const { 
    recentTransactions = [],
  } = useFinance() || {};
  
  // Son 5 işlemi gösterme
  const transactions = recentTransactions ? recentTransactions.slice(0, 5) : [];
  
  // İşlem detaylarını görüntüleme
  const viewTransactionDetails = (transactionId: string) => {
    console.log(`İşlem detayları görüntülenecek: ${transactionId}`);
    // Hata vermemesi için doğrudan yönlendirmeyi geçici olarak kaldırıyoruz
    // router.push(`/transactions/${transactionId}`);
  };
  
  // İşlemler sayfasına gitme
  const viewAllTransactions = () => {
    console.log('Tüm işlemler görüntülenecek');
    // Hata vermemesi için doğrudan yönlendirmeyi geçici olarak kaldırıyoruz
    // router.push('/transactions');
  };
  
  // Kategoriye göre ikon ve renk ayarlama - güvenli versiyonu
  const getCategoryIconAndColor = (categoryId: string) => {
    try {
      // getCategoryById fonksiyonu kaldırıldı, doğrudan varsayılan kategoriyi kullanıyoruz
      const defaultCategory = DEFAULT_CATEGORIES[categoryId as keyof typeof DEFAULT_CATEGORIES] || 
                              DEFAULT_CATEGORIES.other;
      
      return {
        icon: defaultCategory.icon,
        color: defaultCategory.color,
      };
    } catch (error) {
      console.log('Kategori bilgisi alınamadı:', error);
      return {
        icon: 'receipt',
        color: '#4C9AFF',
      };
    }
  };
  
  // İşlem kartı
  const renderTransactionItem = ({ item, index }: { item: Transaction, index: number }) => {
    const { icon, color } = getCategoryIconAndColor(item.categoryId || item.category || 'other');
    
    // Tarih değerini güvenli bir şekilde biçimlendirme
    let dateText = 'Bilinmeyen tarih';
    try {
      const date = item.date instanceof Date ? item.date : new Date(item.date);
      dateText = formatDate(date);
    } catch (e) {
      console.log('Tarih biçimlendirme hatası:', e);
    }
    
    return (
      <Animated.View
        entering={SlideInRight.delay(index * 100).duration(300)}
      >
        <TouchableOpacity
          style={styles.transactionCard}
          onPress={() => viewTransactionDetails(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.transactionHeader}>
            <Surface style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
              <ThemeIcon
                name={icon}
                size={18}
                color={color}
                type="material"
              />
            </Surface>
            
            <View style={styles.transactionInfo}>
              <BodyMedium numberOfLines={1} style={styles.transactionTitle}>
                {item.description || 'İşlem'}
              </BodyMedium>
              <BodySmall style={styles.transactionDate}>{dateText}</BodySmall>
            </View>
            
            <View style={styles.amountContainer}>
              <BodyMedium 
                style={[
                  styles.transactionAmount, 
                  { color: item.amount < 0 ? paperTheme.colors.error : paperTheme.colors.primary }
                ]}
              >
                {item.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(item.amount))}
              </BodyMedium>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // Boş durum - veri yoksa
  if (!transactions || transactions.length === 0) {
    return (
      <Animated.View entering={FadeIn.duration(400)}>
        <EmptyState
          title="İşlem Bulunamadı"
          message="Henüz bir işlem yapmadınız. İlk işleminizi ekleyin."
          icon="receipt-long"
          containerStyle={{ backgroundColor: 'transparent', height: 120 }}
        />
      </Animated.View>
    );
  }
  
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.container}
    >
      {/* Yatay kaydırmalı işlem listesi */}
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        scrollEnabled={false} // Ana sayfada kaydırmadan listeleme
      />
      
      {recentTransactions && recentTransactions.length > 5 && (
        <Button
          mode="outlined"
          onPress={viewAllTransactions}
          style={styles.viewAllButton}
          labelStyle={{ fontSize: 12 }}
        >
          Tüm İşlemleri Görüntüle
        </Button>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  separator: {
    height: 8,
  },
  scrollContainer: {
    paddingBottom: 8,
  },
  transactionCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontWeight: '500',
  },
  transactionDate: {
    opacity: 0.6,
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  transactionAmount: {
    fontWeight: '600',
  },
  viewAllButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
}); 