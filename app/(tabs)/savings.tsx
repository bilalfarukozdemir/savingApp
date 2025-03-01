import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, FlatList, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeIn, ZoomIn, SlideInRight } from 'react-native-reanimated';
import PieChart from 'react-native-pie-chart/v3api';

const { width: screenWidth } = Dimensions.get('window');

// Tasarruf hedefi tipini tanımla
type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
};

// Tasarruf hedefi kartı bileşeni
const SavingsGoalCard = ({ 
  goal, 
  colors, 
  onAddFunds, 
  onWithdrawFunds 
}: { 
  goal: SavingsGoal; 
  colors: any; 
  onAddFunds: (id: string) => void; 
  onWithdrawFunds: (id: string) => void; 
}) => {
  // Her kart için kendi animasyon hook'unu kullan
  const animatedStyle = useAnimatedStyle(() => {
    const progress = goal.currentAmount / goal.targetAmount;
    return {
      width: withTiming(`${Math.min(progress * 100, 100)}%`, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      height: '100%',
      backgroundColor: goal.color,
      borderRadius: 4,
    };
  });

  const progressPercentage = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);

  return (
    <Animated.View 
      entering={FadeIn.duration(800).delay(300)}
      style={[styles.goalCard, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A' }]}
    >
      <View style={styles.goalHeader}>
        <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
        <View style={[styles.goalIconContainer, { backgroundColor: `${goal.color}20` }]}>
          <IconSymbol name="star.fill" size={20} color={goal.color} />
        </View>
      </View>
      
      <View style={styles.goalAmountsContainer}>
        <View style={styles.goalAmountItem}>
          <Text style={[styles.goalAmountLabel, { color: colors.icon }]}>Hedef</Text>
          <Text style={[styles.goalAmountValue, { color: colors.text }]}>₺{goal.targetAmount.toLocaleString()}</Text>
        </View>
        
        <View style={styles.goalAmountItem}>
          <Text style={[styles.goalAmountLabel, { color: colors.icon }]}>Mevcut</Text>
          <Text style={[styles.goalAmountValue, { color: colors.text }]}>₺{goal.currentAmount.toLocaleString()}</Text>
        </View>
        
        <View style={styles.goalAmountItem}>
          <Text style={[styles.goalAmountLabel, { color: colors.icon }]}>Kalan</Text>
          <Text style={[styles.goalAmountValue, { color: colors.text }]}>₺{(goal.targetAmount - goal.currentAmount).toLocaleString()}</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={animatedStyle} />
        </View>
        <Text style={[styles.progressText, { color: colors.icon }]}>
          {progressPercentage}% tamamlandı
        </Text>
      </View>
      
      <View style={styles.goalActions}>
        <TouchableOpacity 
          style={[styles.goalActionButton, { backgroundColor: '#4CAF5020' }]}
          onPress={() => onAddFunds(goal.id)}
        >
          <IconSymbol name="plus.circle.fill" size={16} color="#4CAF50" />
          <Text style={[styles.goalActionText, { color: colors.text }]}>Para Ekle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.goalActionButton, { backgroundColor: '#F4433620' }]}
          onPress={() => onWithdrawFunds(goal.id)}
        >
          <IconSymbol name="minus.circle.fill" size={16} color="#F44336" />
          <Text style={[styles.goalActionText, { color: colors.text }]}>Para Çek</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];

  // Tasarruf hedefleri
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    { id: '1', name: 'Yeni Araba', targetAmount: 20000, currentAmount: 5000, color: '#4CAF50' },
    { id: '2', name: 'Tatil', targetAmount: 5000, currentAmount: 1500, color: '#2196F3' },
    { id: '3', name: 'Ev Dekorasyonu', targetAmount: 3000, currentAmount: 2000, color: '#FFC107' },
  ]);
  
  // Modal durumları
  const [newGoalModalVisible, setNewGoalModalVisible] = useState(false);
  const [fundModalVisible, setFundModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isAddingFunds, setIsAddingFunds] = useState(true);
  
  // Form state'leri
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [fundAmount, setFundAmount] = useState('');

  // Toplam tasarruf ve hedef
  const [totalSavings, setTotalSavings] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);

  // Hesaplamaları yapalım
  useEffect(() => {
    const savingsTotal = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const targetTotal = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    
    setTotalSavings(savingsTotal);
    setTotalTarget(targetTotal);
  }, [savingsGoals]);

  // Pie chart verilerini hazırla
  const pieChartData = savingsGoals.map(goal => goal.currentAmount);
  const pieChartColors = savingsGoals.map(goal => goal.color);
  const pieChartSize = screenWidth < 380 ? 150 : 160;

  // Yeni hedef ekleme
  const addNewGoal = () => {
    if (newGoalName && newGoalAmount && parseFloat(newGoalAmount) > 0) {
      // Hedef için rastgele renk seç
      const colors = ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#F44336', '#FF9800'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newGoal = {
        id: (savingsGoals.length + 1).toString(),
        name: newGoalName,
        targetAmount: parseFloat(newGoalAmount),
        currentAmount: 0,
        color: randomColor,
      };
      
      setSavingsGoals([...savingsGoals, newGoal]);
      setNewGoalModalVisible(false);
      setNewGoalName('');
      setNewGoalAmount('');
    }
  };

  // Para ekleme modalını aç
  const handleAddFunds = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsAddingFunds(true);
    setFundAmount('');
    setFundModalVisible(true);
  };

  // Para çekme modalını aç
  const handleWithdrawFunds = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsAddingFunds(false);
    setFundAmount('');
    setFundModalVisible(true);
  };

  // Para ekleme veya çekme
  const processFunds = () => {
    if (selectedGoalId && fundAmount && parseFloat(fundAmount) > 0) {
      const amount = parseFloat(fundAmount);
      
      setSavingsGoals(prevGoals => prevGoals.map(goal => {
        if (goal.id === selectedGoalId) {
          if (isAddingFunds) {
            return { ...goal, currentAmount: goal.currentAmount + amount };
          } else {
            const newAmount = Math.max(0, goal.currentAmount - amount);
            return { ...goal, currentAmount: newAmount };
          }
        }
        return goal;
      }));
      
      setFundModalVisible(false);
      setFundAmount('');
      setSelectedGoalId(null);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >      
      {/* Toplam Tasarruf Özeti */}
      <Animated.View 
        entering={FadeIn.duration(800).delay(200)}
        style={[styles.summaryCard, { backgroundColor: colors.tint }]}
      >
        <Text style={styles.summaryTitle}>Toplam Tasarruf Durumu</Text>
        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Şu Anki Tasarruf</Text>
            <Text style={styles.summaryValue}>₺{totalSavings.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Toplam Hedef</Text>
            <Text style={styles.summaryValue}>₺{totalTarget.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tamamlanan</Text>
            <Text style={styles.summaryValue}>
              %{totalTarget > 0 ? Math.round((totalSavings / totalTarget) * 100) : 0}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Pasta Grafiği ile Dağılım */}
      {savingsGoals.length > 0 && (
        <Animated.View 
          entering={ZoomIn.duration(800).delay(400)}
          style={[styles.chartCard, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A' }]}
        >
          <Text style={[styles.chartTitle, { color: colors.text }]}>Tasarruf Dağılımı</Text>
          
          <View style={styles.chartContent}>
            {/* Pasta Grafiği */}
            <View style={styles.pieChartContainer}>
              <PieChart
                widthAndHeight={pieChartSize}
                series={pieChartData as any}
                sliceColor={pieChartColors}
                coverRadius={0.65}
                coverFill={colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A'}
              />
              <View style={styles.pieChartCenter}>
                <Text style={[styles.pieChartCenterValue, { color: colors.text }]}>
                  ₺{totalSavings.toLocaleString()}
                </Text>
                <Text style={[styles.pieChartCenterLabel, { color: colors.icon }]}>
                  Toplam
                </Text>
              </View>
            </View>
            
            {/* Grafiğin Açıklaması */}
            <View style={styles.chartLegend}>
              {savingsGoals.map((goal, index) => (
                <View key={`legend-${index}`} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: goal.color }]} />
                  <View style={styles.legendInfo}>
                    <Text style={[styles.legendName, { color: colors.text }]}>{goal.name}</Text>
                    <Text style={[styles.legendAmount, { color: colors.icon }]}>
                      ₺{goal.currentAmount.toLocaleString()} ({Math.round((goal.currentAmount / totalSavings) * 100)}%)
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      )}

      {/* Tasarruf Hedefleri Başlığı */}
      <Animated.View
        entering={SlideInRight.duration(600).delay(500)}
        style={styles.sectionHeader}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tasarruf Hedefleri</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={() => setNewGoalModalVisible(true)}
        >
          <IconSymbol name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Yeni Ekle</Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Tasarruf Hedefleri Listesi */}
      {savingsGoals.map((goal) => (
        <SavingsGoalCard 
          key={goal.id}
          goal={goal} 
          colors={colors} 
          onAddFunds={handleAddFunds} 
          onWithdrawFunds={handleWithdrawFunds} 
        />
      ))}

      {/* Yeni Tasarruf Hedefi Ekleme Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={newGoalModalVisible}
        onRequestClose={() => setNewGoalModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>            
            <Text style={[styles.modalTitle, { color: colors.text }]}>Yeni Tasarruf Hedefi</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A', color: colors.text }]}              
              value={newGoalName}
              onChangeText={setNewGoalName}
              placeholder="Hedef İsmi"
              placeholderTextColor={colors.icon}
            />
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A', color: colors.text }]}              
              value={newGoalAmount}
              onChangeText={setNewGoalAmount}
              keyboardType="numeric"
              placeholder="Hedef Tutarı (₺)"
              placeholderTextColor={colors.icon}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.icon }]}
                onPress={() => setNewGoalModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton, { backgroundColor: colors.tint }]}
                onPress={addNewGoal}
              >
                <Text style={styles.submitButtonText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Para Ekleme/Çekme Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={fundModalVisible}
        onRequestClose={() => setFundModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>            
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {isAddingFunds ? 'Para Ekle' : 'Para Çek'}
            </Text>
            
            <Text style={[styles.modalSubtitle, { color: colors.icon }]}>
              {isAddingFunds 
                ? 'Hedefinize eklenecek tutarı girin' 
                : 'Hedefinizden çekilecek tutarı girin'}
            </Text>
            
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.background === '#fff' ? '#F5F5F5' : '#2A2A2A', color: colors.text }]}              
              value={fundAmount}
              onChangeText={setFundAmount}
              keyboardType="numeric"
              placeholder="Tutar (₺)"
              placeholderTextColor={colors.icon}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.icon }]}
                onPress={() => setFundModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.submitButton, 
                  { backgroundColor: isAddingFunds ? '#4CAF50' : '#F44336' }
                ]}
                onPress={processFunds}
              >
                <Text style={styles.submitButtonText}>
                  {isAddingFunds ? 'Ekle' : 'Çek'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  // Özet Kart Stilleri
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Grafik Kart Stilleri
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pieChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth < 380 ? '100%' : '45%',
    marginBottom: screenWidth < 380 ? 16 : 0,
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
  chartLegend: {
    width: screenWidth < 380 ? '100%' : '50%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendInfo: {
    flex: 1,
  },
  legendName: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendAmount: {
    fontSize: 12,
  },
  // Bölüm Başlığı
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // Hedef Kart Stilleri
  goalCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalAmountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalAmountItem: {
    alignItems: 'center',
  },
  goalAmountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  goalAmountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  goalActionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth - 32,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  formInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 0.48,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

