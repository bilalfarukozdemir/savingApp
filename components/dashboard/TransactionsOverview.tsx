import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency, formatDate } from '@/utils';
import { 
  Card, 
  Surface, 
  Button, 
  Divider 
} from '@/components/ui/PaperComponents';
import { 
  ThemedText, 
  TitleMedium, 
  BodyMedium, 
  BodySmall 
} from '@/components/ThemedText';
import { ThemeIcon } from '../ui/ThemeIcon';

export const TransactionsOverview: React.FC = () => {
  const { theme, isDark } = useTheme();
  const colors = Colors[theme];
  const router = useRouter();
  
  const { 
    recentTransactions, 
    hasTransactionsData,
    markDataAsSeen
  } = useFinance();
  
  // Veri durumunu kontrol et
  const hasTransactions = recentTransactions.length > 0;
  const hasSeenTransactions = hasTransactionsData();
  
  // İlk gösterim için state
  const [showTutorial, setShowTutorial] = useState(hasTransactions && !hasSeenTransactions);
  
  // Son 5 işlemi al
  const latestTransactions = recentTransactions.slice(0, 5);
  
  // İşlem tipine göre ikon ve renk belirleme
  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'expense': return 'arrow-downward';
      case 'income': return 'arrow-upward';
      case 'transfer': return 'swap-horiz';
      default: return 'receipt';
    }
  };
  
  const getTransactionColor = (type: string) => {
    switch(type) {
      case 'expense': return '#F44336'; // Kırmızı
      case 'income': return '#4CAF50';  // Yeşil
      case 'transfer': return '#2196F3'; // Mavi
      default: return '#607D8B'; // Gri
    }
  };
  
  // Tüm işlemleri görüntüle
  const viewAllTransactions = async () => {
    await markDataAsSeen('transactions');
    setShowTutorial(false);
    router.push('/transactions');
  };
  
  // Veri yok - Boş durum
  if (!hasTransactions) {
    return (
      <Card style={styles.card}>
        <View style={{padding: 16}}>
          <TitleMedium style={styles.header}>İşlemler</TitleMedium>
          <EmptyState
            message="Henüz işlem kaydı bulunmuyor."
            icon="cart.fill"
          />
        </View>
      </Card>
    );
  }
  
  return (
    <Card style={styles.card}>
      <Animated.View entering={FadeIn.duration(500)}>
        <View style={styles.headerRow}>
          <TitleMedium style={styles.header}>Son İşlemler</TitleMedium>
          <Button 
            mode="text" 
            onPress={viewAllTransactions}
            style={styles.viewAllButton}
          >
            Tümünü Gör
          </Button>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.transactionsContainer}>
          {latestTransactions.map((transaction, index) => (
            <View key={index} style={styles.transactionItem}>
              <Surface style={[
                styles.iconContainer, 
                { backgroundColor: `${getTransactionColor(transaction.type)}20` }
              ]}>
                <ThemeIcon 
                  name={getTransactionIcon(transaction.type)} 
                  size={16} 
                  color={getTransactionColor(transaction.type)} 
                  type="material"
                />
              </Surface>
              
              <View style={styles.transactionInfo}>
                <BodyMedium style={styles.transactionCategory}>
                  {transaction.category}
                </BodyMedium>
                <BodySmall style={styles.transactionDate}>
                  {formatDate(transaction.date)}
                </BodySmall>
              </View>
              
              <BodyMedium 
                style={[
                  styles.transactionAmount, 
                  { color: getTransactionColor(transaction.type) }
                ]}
              >
                {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
              </BodyMedium>
            </View>
          ))}
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
  divider: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  transactionsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 1,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    marginBottom: 2,
    fontWeight: '500',
  },
  transactionDate: {
    opacity: 0.7,
  },
  transactionAmount: {
    fontWeight: '700',
  }
}); 