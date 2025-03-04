import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, formatDate } from '@/utils';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Transaction } from '@/utils/models/types';
import { EmptyState } from './ui/EmptyState';

interface SavingsGoalDetailProps {
  goalId: string;
  onAddFunds?: () => void;
  onWithdraw?: () => void;
}

const SavingsGoalDetail: React.FC<SavingsGoalDetailProps> = ({ 
  goalId, 
  onAddFunds, 
  onWithdraw 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { 
    savingsGoals, 
    calculateGoalProgress, 
    calculateRemainingAmount,
    calculateEstimatedTime,
    getGoalTransactions,
    hasTransactionsData,
    markDataAsSeen
  } = useFinance();
  
  // Hedef bilgisini al
  const goal = savingsGoals.find(g => g.id === goalId);
  
  // Hedef işlemleri - useMemo ile sarmalayarak performans iyileştirmesi yapıyoruz
  const transactions = useMemo(() => {
    return goal ? getGoalTransactions(goalId) : [];
  }, [goal, goalId, getGoalTransactions]);
  
  const showTransactions = transactions.length > 0;
  
  // İşlemleri görünür olarak işaretle (kullanıcının işlem eklediği durumda)
  React.useEffect(() => {
    const markSeen = async () => {
      if (transactions.length > 0) {
        await markDataAsSeen('transactions');
      }
    };
    
    markSeen();
  }, [transactions, markDataAsSeen]);
  
  // Hedef bulunamadıysa hata mesajı göster
  if (!goal) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Tasarruf hedefi bulunamadı.
        </Text>
      </View>
    );
  }
  
  // İlerleme yüzdesini hesapla
  const progress = calculateGoalProgress(goalId);
  
  // Kalan miktar
  const remainingAmount = calculateRemainingAmount(goalId);
  
  // Tahmini tamamlanma süresi (aylık 500 TL tasarruf varsayımı)
  const estimatedMonths = calculateEstimatedTime(goalId, 500);
  
  // Hedef rengini belirle
  const goalColor = goal.color || '#4C9AFF';
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hedef Başlığı */}
      <View style={[styles.header, { backgroundColor: goalColor }]}>
        <Text style={styles.headerTitle}>{goal.name}</Text>
        <Text style={styles.headerSubtitle}>
          {goal.category || 'Genel Tasarruf Hedefi'}
        </Text>
      </View>
      
      {/* Hedef Özeti */}
      <View style={[styles.summaryContainer, { backgroundColor: colors.card }]}>
        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: colors.text }]}>Hedef Tutar</Text>
            <Text style={[styles.amountValue, { color: colors.text }]}>
              {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
          
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: colors.text }]}>Mevcut</Text>
            <Text style={[styles.amountValue, { color: colors.text }]}>
              {formatCurrency(goal.currentAmount)}
            </Text>
          </View>
          
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: colors.text }]}>Kalan</Text>
            <Text style={[styles.amountValue, { color: colors.text }]}>
              {formatCurrency(remainingAmount)}
            </Text>
          </View>
        </View>
        
        {/* İlerleme Çubuğu */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarOuter}>
            <View 
              style={[
                styles.progressBarInner, 
                { width: `${progress}%`, backgroundColor: goalColor }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text }]}>
            %{progress.toFixed(1)} tamamlandı
          </Text>
        </View>
      </View>
      
      {/* Tahminler */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hedef Tahminleri</Text>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>Oluşturma Tarihi:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {formatDate(goal.createdAt)}
          </Text>
        </View>
        
        {goal.targetDate && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Hedef Tarihi:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {formatDate(goal.targetDate)}
            </Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>Tahmini Tamamlanma:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {estimatedMonths === 0 
              ? 'Hedef tamamlandı!' 
              : estimatedMonths === Infinity 
                ? 'Belirlenemedi'
                : `${estimatedMonths} ay (aylık 500 TL tasarrufla)`}
          </Text>
        </View>
      </View>
      
      {/* İşlem Butonları */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onAddFunds}
        >
          <IconSymbol name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>Para Ekle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
          onPress={onWithdraw}
          disabled={goal.currentAmount <= 0}
        >
          <IconSymbol name="minus" size={16} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]}>Para Çek</Text>
        </TouchableOpacity>
      </View>
      
      {/* Son İşlemler */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Son İşlemler</Text>
        
        {showTransactions && hasTransactionsData() ? (
          transactions.slice(0, 5).map((transaction: Transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <Text style={[styles.transactionDate, { color: colors.text }]}>
                  {formatDate(transaction.date)}
                </Text>
                <Text style={[styles.transactionDesc, { color: colors.text }]}>
                  {transaction.description}
                </Text>
              </View>
              
              <Text 
                style={[
                  styles.transactionAmount, 
                  { 
                    color: transaction.type === 'expense' ? '#F44336' : '#4CAF50' 
                  }
                ]}
              >
                {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))
        ) : (
          <EmptyState
            title="Henüz İşlem Yok"
            message="Bu hedefe para ekleyerek veya hedeften para çekerek işlem oluşturabilirsiniz."
            icon="swap-horizontal"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  summaryContainer: {
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountItem: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarOuter: {
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 14,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionDesc: {
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '45%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default SavingsGoalDetail; 