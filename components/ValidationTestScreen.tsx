import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { useFinance } from '@/context/FinanceContext';

const ValidationTestScreen: React.FC = () => {
  const { 
    addExpense, 
    addSavingsGoal, 
    addFundsToGoal, 
    withdrawFundsFromGoal,
    calculateEstimatedTime,
    error,
    savingsGoals,
    financialState
  } = useFinance();
  
  // Harcama testi için state
  const [amount, setAmount] = useState('100');
  const [category, setCategory] = useState('Gıda');
  const [description, setDescription] = useState('Test harcaması');
  
  // Tasarruf hedefi testi için state
  const [goalName, setGoalName] = useState('Test Hedefi');
  const [goalAmount, setGoalAmount] = useState('1000');
  
  // Para ekleme/çekme için state
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState('50');
  
  // Hedefe ulaşma süresi testi için state
  const [monthlyContribution, setMonthlyContribution] = useState('100');
  const [estimatedMonths, setEstimatedMonths] = useState<number | null>(null);
  
  // Test fonksiyonları
  const testAddExpense = () => {
    // Negatif sayı girerek validasyon hatası oluşturabiliriz
    addExpense({
      amount: parseFloat(amount),
      category,
      description
    });
  };
  
  const testAddGoal = () => {
    // Hedef tutarı 0 girerek validasyon hatası oluşturabiliriz
    addSavingsGoal({
      name: goalName,
      targetAmount: parseFloat(goalAmount),
      color: '#FF5722'
    });
  };
  
  const testAddFunds = () => {
    if (selectedGoalId) {
      addFundsToGoal(selectedGoalId, parseFloat(transferAmount), 'Test para ekleme');
    }
  };
  
  const testWithdrawFunds = () => {
    if (selectedGoalId) {
      withdrawFundsFromGoal(selectedGoalId, parseFloat(transferAmount), 'Test para çekme');
    }
  };
  
  const testEstimatedTime = () => {
    if (selectedGoalId) {
      const months = calculateEstimatedTime(selectedGoalId, parseFloat(monthlyContribution));
      setEstimatedMonths(months);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Validasyon Test Ekranı</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Hata: {error}</Text>
        </View>
      )}
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Mevcut Bakiye: {financialState.currentBalance}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Harcama Ekle Testi</Text>
        <Text style={styles.hint}>Negatif değer deneyerek validasyon hatası oluşturabilirsiniz</Text>
        
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="Miktar"
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="Kategori"
        />
        
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Açıklama"
        />
        
        <Button title="Harcama Ekle" onPress={testAddExpense} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasarruf Hedefi Ekle Testi</Text>
        <Text style={styles.hint}>0 veya negatif hedef tutarı deneyerek validasyon hatası oluşturabilirsiniz</Text>
        
        <TextInput
          style={styles.input}
          value={goalName}
          onChangeText={setGoalName}
          placeholder="Hedef Adı"
        />
        
        <TextInput
          style={styles.input}
          value={goalAmount}
          onChangeText={setGoalAmount}
          placeholder="Hedef Tutarı"
          keyboardType="numeric"
        />
        
        <Button title="Tasarruf Hedefi Ekle" onPress={testAddGoal} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hedefe Para Ekle/Çek</Text>
        
        {savingsGoals.length > 0 ? (
          <>
            <Text style={styles.label}>Hedef Seçin:</Text>
            {savingsGoals.map(goal => (
              <Button
                key={goal.id}
                title={`${goal.name} (${goal.currentAmount}/${goal.targetAmount})`}
                onPress={() => setSelectedGoalId(goal.id)}
                color={selectedGoalId === goal.id ? '#007AFF' : '#999'}
              />
            ))}
            
            <TextInput
              style={styles.input}
              value={transferAmount}
              onChangeText={setTransferAmount}
              placeholder="Transfer Miktarı"
              keyboardType="numeric"
            />
            
            <View style={styles.buttonRow}>
              <View style={styles.buttonContainer}>
                <Button title="Para Ekle" onPress={testAddFunds} />
              </View>
              <View style={styles.buttonContainer}>
                <Button title="Para Çek" onPress={testWithdrawFunds} />
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Hedefe Ulaşma Süresi Testi</Text>
            <TextInput
              style={styles.input}
              value={monthlyContribution}
              onChangeText={setMonthlyContribution}
              placeholder="Aylık Katkı"
              keyboardType="numeric"
            />
            
            <Button title="Süre Hesapla" onPress={testEstimatedTime} />
            
            {estimatedMonths !== null && (
              <Text style={styles.result}>
                Hedefe ulaşma süresi: {estimatedMonths} ay
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.hint}>Önce bir tasarruf hedefi eklemelisiniz</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  infoText: {
    color: '#0d47a1',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  result: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ValidationTestScreen; 