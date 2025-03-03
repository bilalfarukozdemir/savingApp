import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFinance } from '@/context/FinanceContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '@/utils';

export const SavingsOverview: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  const { 
    savingsGoals, 
    getFinancialSummary, 
    calculateGoalProgress,
    calculateOverallSavingsProgress,
    hasSavingsData,
    markDataAsSeen 
  } = useFinance();
  
  // Veri durumunu kontrol et
  const hasGoals = savingsGoals.length > 0;
  const hasSeenGoals = hasSavingsData();
  
  // İlk gösterim için bir state
  const [showTutorial, setShowTutorial] = useState(hasGoals && !hasSeenGoals);
  
  // Finansal özet
  const summary = getFinancialSummary();
  
  // Toplam ilerleme
  const overallProgress = hasGoals ? calculateOverallSavingsProgress() : 0;
  
  // Hedeflerin sayısına göre ilk 2 hedef
  const visibleGoals = savingsGoals.slice(0, 2);
  
  // Bir tasarruf hedefinin detaylarını görüntüle
  const viewGoalDetails = async (goalId: string) => {
    await markDataAsSeen('savings');
    setShowTutorial(false);
    router.push(`/savings/${goalId}`);
  };
  
  // Hedefi oluşturmaya yönlendir
  const createNewGoal = () => {
    router.push('/savings/new');
  };
  
  // Veri yok - Boş durum
  if (!hasGoals) {
    return (
      <Animated.View 
        entering={FadeIn.duration(500)} 
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <EmptyState
          title="Tasarruf Hedefi Oluştur"
          message="Finansal hedeflerinize ulaşmak için bir tasarruf hedefi belirleyin."
          icon="piggy-bank"
          containerStyle={{ backgroundColor: 'transparent' }}
        />
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={createNewGoal}
        >
          <IconSymbol name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>Hedef Ekle</Text>
        </TouchableOpacity>
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
          <Text style={[styles.tutorialTitle, { color: colors.text }]}>Tasarruf Hedefleriniz</Text>
          <Text style={[styles.tutorialText, { color: colors.textMuted }]}>
            Burada tüm tasarruf hedeflerinizi ve ilerlemenizi görebilirsiniz. 
            Hedeflerinize para ekleyebilir ve ilerlemenizi takip edebilirsiniz.
          </Text>
        </View>
        
        {visibleGoals.map(goal => (
          <TouchableOpacity 
            key={goal.id} 
            style={styles.goalItem}
            onPress={() => viewGoalDetails(goal.id)}
          >
            <View style={[styles.goalIcon, { backgroundColor: goal.color || '#4C9AFF' }]}>
              <IconSymbol name={goal.icon || 'target'} size={18} color="#FFFFFF" />
            </View>
            <View style={styles.goalInfo}>
              <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
              <View style={styles.goalStats}>
                <Text style={[styles.goalCurrent, { color: colors.text }]}>
                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                </Text>
                <Text style={[styles.goalPercentage, { color: colors.textMuted }]}>
                  %{calculateGoalProgress(goal.id).toFixed(0)}
                </Text>
              </View>
              <View style={[styles.goalProgressBg, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.goalProgressBar, 
                    { 
                      width: `${calculateGoalProgress(goal.id)}%`, 
                      backgroundColor: goal.color || '#4C9AFF' 
                    }
                  ]} 
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => viewGoalDetails(visibleGoals[0].id)}
        >
          <Text style={styles.buttonText}>Hedefleri Görüntüle</Text>
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
      <Text style={[styles.title, { color: colors.text }]}>Tasarruf Hedefleri</Text>
      
      <View style={styles.overallContainer}>
        <View style={styles.labelRow}>
          <Text style={[styles.overallLabel, { color: colors.text }]}>Toplam İlerleme</Text>
          <Text style={[styles.progressPercentage, { color: colors.text }]}>%{overallProgress.toFixed(1)}</Text>
        </View>
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${overallProgress}%`, 
                backgroundColor: colors.primary 
              }
            ]} 
          />
        </View>
      </View>
      
      {visibleGoals.map(goal => (
        <TouchableOpacity 
          key={goal.id} 
          style={styles.goalItem}
          onPress={() => viewGoalDetails(goal.id)}
        >
          <View style={[styles.goalIcon, { backgroundColor: goal.color || '#4C9AFF' }]}>
            <IconSymbol name={goal.icon || 'target'} size={18} color="#FFFFFF" />
          </View>
          <View style={styles.goalInfo}>
            <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
            <View style={styles.goalStats}>
              <Text style={[styles.goalCurrent, { color: colors.text }]}>
                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
              </Text>
              <Text style={[styles.goalPercentage, { color: colors.textMuted }]}>
                %{calculateGoalProgress(goal.id).toFixed(0)}
              </Text>
            </View>
            <View style={[styles.goalProgressBg, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.goalProgressBar, 
                  { 
                    width: `${calculateGoalProgress(goal.id)}%`, 
                    backgroundColor: goal.color || '#4C9AFF' 
                  }
                ]} 
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/savings')}
      >
        <Text style={styles.buttonText}>Tüm Hedefleri Görüntüle</Text>
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
  overallContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  overallLabel: {
    fontSize: 14,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  goalCurrent: {
    fontSize: 14,
  },
  goalPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  goalProgressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalProgressBar: {
    height: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
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