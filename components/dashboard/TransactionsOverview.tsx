import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFinance } from '@/context/FinanceContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency, formatDate } from '@/utils';

export const TransactionsOverview: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
      case 'expense': return 'arrow-down';
      case 'income': return 'arrow-up';
      case 'transfer': return 'swap-horizontal';
      default: return 'document-text';
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
      <Animated.View 
        entering={FadeIn.duration(500)} 
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <EmptyState
          title="Henüz İşlem Yok"
          message="Harcama ve tasarruf işlemleriniz burada görüntülenecek."
          icon="document-text"
          containerStyle={{ backgroundColor: 'transparent' }}
        />
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
          <Text style={[styles.tutorialTitle, { color: colors.text }]}>İşlem Geçmişiniz</Text>
          <Text style={[styles.tutorialText, { color: colors.textMuted }]}>
            Burada tüm finansal işlemlerinizi kronolojik olarak görebilirsiniz.
            Harcamalar, gelirler ve tasarruf işlemleri burada listelenir.
          </Text>
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>Son İşlemler</Text>
        
        <View style={styles.transactionsContainer}>
          {latestTransactions.map((transaction, index) => (
            <View key={index} style={styles.transactionItem}>
              <View style={[styles.iconContainer, { backgroundColor: `${getTransactionColor(transaction.type)}20` }]}>
                <IconSymbol 
                  name={getTransactionIcon(transaction.type)} 
                  size={16} 
                  color={getTransactionColor(transaction.type)} 
                />
              </View>
              
              <View style={styles.transactionInfo}>
                <Text style={[styles.transactionCategory, { color: colors.text }]}>
                  {transaction.category}
                </Text>
                <Text style={[styles.transactionDate, { color: colors.textMuted }]}>
                  {formatDate(transaction.date)}
                </Text>
              </View>
              
              <Text 
                style={[
                  styles.transactionAmount, 
                  { color: getTransactionColor(transaction.type) }
                ]}
              >
                {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={viewAllTransactions}
        >
          <Text style={styles.buttonText}>Tüm İşlemleri Görüntüle</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
  
  // Normal görünüm - Veri var ve daha önce görüntülenmiş
  return (
    <Animated.View 
      entering={FadeIn.duration(500)} 
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Son İşlemler</Text>
      
      <View style={styles.transactionsContainer}>
        {latestTransactions.map((transaction, index) => (
          <View key={index} style={styles.transactionItem}>
            <View style={[styles.iconContainer, { backgroundColor: `${getTransactionColor(transaction.type)}20` }]}>
              <IconSymbol 
                name={getTransactionIcon(transaction.type)} 
                size={16} 
                color={getTransactionColor(transaction.type)} 
              />
            </View>
            
            <View style={styles.transactionInfo}>
              <Text style={[styles.transactionCategory, { color: colors.text }]}>
                {transaction.category}
              </Text>
              <Text style={[styles.transactionDate, { color: colors.textMuted }]}>
                {formatDate(transaction.date)}
              </Text>
            </View>
            
            <Text 
              style={[
                styles.transactionAmount, 
                { color: getTransactionColor(transaction.type) }
              ]}
            >
              {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
            </Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={viewAllTransactions}
      >
        <Text style={styles.buttonText}>Tüm İşlemleri Görüntüle</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transactionsContainer: {
    marginBottom: 16,
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
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
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
}); 