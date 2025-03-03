import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFinance } from '@/context/FinanceContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { formatCurrency, formatDate } from '@/utils';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabType = 'all' | 'income' | 'expense';

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  // Tab state - default seçili tab "tüm işlemler"
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  const { 
    recentTransactions,
    markDataAsSeen
  } = useFinance();
  
  useEffect(() => {
    // İşlemler görüntülendiğinde verilerin görüldüğünü işaretle
    markDataAsSeen('transactions');
  }, []);
  
  // İşlem tipine göre ikon ve renk belirleme
  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'expense': return 'arrow-down';
      case 'income': return 'arrow-up';
      case 'transfer': return 'swap-horizontal';
      case 'deposit': return 'arrow-up';
      case 'withdrawal': return 'arrow-down';
      default: return 'document-text';
    }
  };
  
  const getTransactionColor = (type: string) => {
    switch(type) {
      case 'expense': return '#F44336'; // Kırmızı
      case 'income': return '#4CAF50';  // Yeşil
      case 'transfer': return '#2196F3'; // Mavi
      case 'deposit': return '#4CAF50';  // Yeşil
      case 'withdrawal': return '#F44336'; // Kırmızı
      default: return '#607D8B'; // Gri
    }
  };
  
  const getAmountPrefix = (type: string) => {
    return (type === 'expense' || type === 'withdrawal') ? '-' : '+';
  };
  
  // İşlem tipine göre filtreleme
  const filterTransactions = () => {
    switch(activeTab) {
      case 'income':
        return recentTransactions.filter(
          t => t.type === 'income' || t.type === 'deposit'
        );
      case 'expense':
        return recentTransactions.filter(
          t => t.type === 'expense' || t.type === 'withdrawal'
        );
      default:
        return recentTransactions;
    }
  };
  
  // Filtrelenmiş işlemler
  const filteredTransactions = filterTransactions();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tüm İşlemler</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Tab Bar */}
      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'all' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]} 
          onPress={() => setActiveTab('all')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'all' ? colors.primary : colors.textMuted }
          ]}>
            Tümü
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'income' && { borderBottomColor: '#4CAF50', borderBottomWidth: 2 }
          ]} 
          onPress={() => setActiveTab('income')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'income' ? '#4CAF50' : colors.textMuted }
          ]}>
            Gelirler
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'expense' && { borderBottomColor: '#F44336', borderBottomWidth: 2 }
          ]} 
          onPress={() => setActiveTab('expense')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'expense' ? '#F44336' : colors.textMuted }
          ]}>
            Giderler
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item, index) => `transaction-${item.id || index}`}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={[styles.transactionItem, { borderBottomColor: colors.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${getTransactionColor(item.type)}20` }]}>
              <IconSymbol 
                name={getTransactionIcon(item.type)} 
                size={20} 
                color={getTransactionColor(item.type)} 
              />
            </View>
            
            <View style={styles.transactionInfo}>
              <View style={styles.transactionHeader}>
                <Text style={[styles.transactionCategory, { color: colors.text }]}>
                  {item.category}
                </Text>
                <Text 
                  style={[
                    styles.transactionAmount, 
                    { color: getTransactionColor(item.type) }
                  ]}
                >
                  {getAmountPrefix(item.type)}{formatCurrency(item.amount)}
                </Text>
              </View>
              
              <View style={styles.transactionDetails}>
                <Text style={[styles.transactionDate, { color: colors.textMuted }]}>
                  {formatDate(item.date)}
                </Text>
                {item.description && (
                  <Text style={[styles.transactionDescription, { color: colors.textMuted }]}>
                    {item.description}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <IconSymbol name="document-text" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {activeTab === 'income' 
                ? 'Henüz gelir işlemi bulunmuyor.' 
                : activeTab === 'expense' 
                  ? 'Henüz gider işlemi bulunmuyor.'
                  : 'Henüz işlem bulunmuyor.'
              }
            </Text>
          </View>
        )}
      />
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDetails: {
    flexDirection: 'column',
  },
  transactionDate: {
    fontSize: 14,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
}); 