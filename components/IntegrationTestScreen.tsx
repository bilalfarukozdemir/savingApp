import React, { useState } from 'react';
import { View, Text, ScrollView, Button, StyleSheet, TextInput } from 'react-native';
import { financeManager, calculationService, Expense, SavingsGoal } from '@/utils';

/**
 * IntegrationTestScreen - Hesaplama mantığını test eden ekran
 * Bu ekran, hesaplama servisinin FinanceManager ve FinanceContext ile
 * uyumlu çalıştığını test eder.
 */
const IntegrationTestScreen: React.FC = () => {
  // Test sonuçları için state
  const [testResults, setTestResults] = useState<Array<{name: string, passed: boolean, message: string}>>([]);
  const [testAmount, setTestAmount] = useState('100');
  
  // Testleri temizle
  const clearTests = () => {
    setTestResults([]);
  };
  
  // Test sonucu ekle
  const addTestResult = (name: string, passed: boolean, message: string) => {
    setTestResults(prev => [...prev, { name, passed, message }]);
  };
  
  // CalculationService validasyon testi
  const testValidation = () => {
    clearTests();
    
    try {
      // Pozitif sayı validasyonu
      const positiveResult = calculationService.validatePositiveValue(50, 'Test Value');
      addTestResult(
        'Pozitif Değer Validasyonu',
        positiveResult.isValid,
        positiveResult.isValid ? 'Başarılı' : positiveResult.errorMessage || 'Hata'
      );
      
      // Negatif sayı validasyonu
      const negativeResult = calculationService.validatePositiveValue(-10, 'Test Value');
      addTestResult(
        'Negatif Değer Validasyonu',
        !negativeResult.isValid,
        !negativeResult.isValid ? 'Beklenen hata: ' + negativeResult.errorMessage : 'Hata bekleniyordu'
      );
      
      // Sıfır değer validasyonu
      const zeroResult = calculationService.validateNonZeroValue(0, 'Test Value');
      addTestResult(
        'Sıfır Değer Validasyonu',
        !zeroResult.isValid,
        !zeroResult.isValid ? 'Beklenen hata: ' + zeroResult.errorMessage : 'Hata bekleniyordu'
      );
      
    } catch (error) {
      console.error('Validasyon testi hatası:', error);
      addTestResult('Validasyon Testi', false, 'Test sırasında beklenmeyen hata: ' + String(error));
    }
  };
  
  // CalculationService hesaplama testi
  const testCalculations = () => {
    clearTests();
    
    try {
      // Test verisi oluştur
      const goal: SavingsGoal = {
        id: 'test-goal',
        name: 'Test Hedefi',
        targetAmount: 1000,
        currentAmount: 250,
        color: '#FF5722',
        createdAt: new Date()
      };
      
      // İlerleme hesaplama
      const progress = calculationService.calculateGoalProgress(goal);
      addTestResult(
        'Hedef İlerlemesi Hesaplama',
        progress === 25,
        `İlerleme: %${progress}, Beklenen: %25`
      );
      
      // Kalan miktar hesaplama
      const remaining = calculationService.calculateRemainingAmount(goal);
      addTestResult(
        'Kalan Miktar Hesaplama',
        remaining === 750,
        `Kalan: ${remaining}, Beklenen: 750`
      );
      
      // Tahmini süre hesaplama (aylık 100 birim katkı ile)
      const estimatedTime = calculationService.calculateEstimatedTime(goal, 100);
      addTestResult(
        'Tahmini Süre Hesaplama',
        estimatedTime > 0,
        `Tahmini süre: ${estimatedTime} ay`
      );
      
    } catch (error) {
      console.error('Hesaplama testi hatası:', error);
      addTestResult('Hesaplama Testi', false, 'Test sırasında beklenmeyen hata: ' + String(error));
    }
  };
  
  // FinanceManager entegrasyon testi
  const testManagerIntegration = () => {
    clearTests();
    
    try {
      // Finansal durum kontrolü
      const state = financeManager.getFinancialState();
      addTestResult(
        'Finansal Durum Kontrolü',
        state !== null,
        `Mevcut bakiye: ${state.currentBalance}`
      );
      
      // Geçersiz harcama testi (negatif değer)
      const invalidExpense = financeManager.addExpense({
        amount: -parseFloat(testAmount),
        category: 'Test',
        description: 'Test harcaması'
      });
      
      addTestResult(
        'Geçersiz Harcama Testi',
        invalidExpense === null,
        invalidExpense === null ? 'Beklenen şekilde reddedildi' : 'Geçersiz harcama kabul edildi'
      );
      
      // Geçersiz hedef testi (sıfır hedef)
      const invalidGoal = financeManager.addSavingsGoal({
        name: 'Test Hedefi',
        targetAmount: 0,
        color: '#FF5722'
      });
      
      addTestResult(
        'Geçersiz Hedef Testi',
        invalidGoal === null,
        invalidGoal === null ? 'Beklenen şekilde reddedildi' : 'Geçersiz hedef kabul edildi'
      );
      
    } catch (error) {
      console.error('Entegrasyon testi hatası:', error);
      addTestResult('Entegrasyon Testi', false, 'Test sırasında beklenmeyen hata: ' + String(error));
    }
  };
  
  // Kapsamlı hata durumları testi
  const testErrorCases = () => {
    clearTests();
    
    try {
      // Harcama hesaplaması (boş array)
      const emptyExpenses: Expense[] = [];
      const categoryTotals = calculationService.getCategoryTotals(emptyExpenses);
      
      addTestResult(
        'Boş Harcama Hesaplaması',
        Object.keys(categoryTotals).length === 0,
        'Boş harcama listesi için boş sonuç döndü'
      );
      
      // Hedef yüzde hesaplama (sıfır hedef)
      const zeroGoal: SavingsGoal = {
        id: 'zero-goal',
        name: 'Sıfır Hedef',
        targetAmount: 0,
        currentAmount: 0,
        color: '#FF5722',
        createdAt: new Date()
      };
      
      const zeroProgress = calculationService.calculateGoalProgress(zeroGoal);
      
      addTestResult(
        'Sıfır Hedef İlerlemesi',
        zeroProgress === 0,
        `Sıfır hedef için ilerleme: %${zeroProgress}, Beklenen: %0`
      );
      
    } catch (error) {
      console.error('Hata durumları testi hatası:', error);
      addTestResult('Hata Durumları Testi', false, 'Test sırasında beklenmeyen hata: ' + String(error));
    }
  };
  
  // Performans ve stres testi
  const testPerformance = () => {
    clearTests();
    
    try {
      // Çok sayıda harcama ile performans testi
      const startTime = performance.now();
      
      // 1000 harcama oluştur
      const manyExpenses: Expense[] = Array(1000).fill(null).map((_, index) => ({
        id: `test-expense-${index}`,
        amount: Math.random() * 1000,
        category: ['Gıda', 'Ulaşım', 'Eğlence', 'Sağlık', 'Diğer'][Math.floor(Math.random() * 5)],
        description: `Test Harcama ${index}`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Son 30 gün
      }));
      
      // Kategori toplamları hesapla
      calculationService.getCategoryTotals(manyExpenses);
      
      // Kategori yüzdeleri hesapla
      calculationService.getCategoryPercentages(manyExpenses);
      
      // En çok harcama yapılan kategorileri getir
      calculationService.getTopSpendingCategories(manyExpenses, 5);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      addTestResult(
        'Performans Testi',
        executionTime < 2000, // 2 saniyeden az sürerse başarılı
        `1000 harcamalı hesaplama: ${executionTime.toFixed(2)}ms`
      );
      
    } catch (error) {
      console.error('Performans testi hatası:', error);
      addTestResult('Performans Testi', false, 'Test sırasında beklenmeyen hata: ' + String(error));
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hesaplama Mantığı Entegrasyon Testi</Text>
      <Text style={styles.subtitle}>
        Calculation Service ve Finance Manager entegrasyonunu test eder
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Test Miktar</Text>
        <TextInput
          style={styles.input}
          value={testAmount}
          onChangeText={setTestAmount}
          keyboardType="numeric"
          placeholder="Test için miktar girin"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button title="Validasyon Testi" onPress={testValidation} />
        <Button title="Hesaplama Testi" onPress={testCalculations} />
        <Button title="Entegrasyon Testi" onPress={testManagerIntegration} />
        <Button title="Hata Durumları Testi" onPress={testErrorCases} />
        <Button title="Performans Testi" onPress={testPerformance} />
        <Button title="Testleri Temizle" onPress={clearTests} color="#777" />
      </View>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Test Sonuçları</Text>
        
        {testResults.length === 0 ? (
          <Text style={styles.noResult}>Henüz test çalıştırılmadı</Text>
        ) : (
          testResults.map((result, index) => (
            <View key={index} style={[styles.resultItem, { backgroundColor: result.passed ? '#e7f5e7' : '#ffecec' }]}>
              <Text style={styles.resultName}>{result.name}</Text>
              <Text style={[styles.resultStatus, { color: result.passed ? '#2e7d32' : '#c62828' }]}>
                {result.passed ? '✓ Başarılı' : '✗ Başarısız'}
              </Text>
              <Text style={styles.resultMessage}>{result.message}</Text>
            </View>
          ))
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
  buttonContainer: {
    marginBottom: 24,
    gap: 8,
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  noResult: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  resultItem: {
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultMessage: {
    fontSize: 14,
  },
});

export default IntegrationTestScreen; 