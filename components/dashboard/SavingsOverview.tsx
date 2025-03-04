import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { useFinance } from '@/context/FinanceContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '@/utils';
import { ThemeIcon } from '../ui/ThemeIcon';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { TitleLarge, BodyMedium, BodySmall, LabelMedium } from '../ThemedText';
import { 
  Card, 
  Button, 
  Divider, 
  Surface, 
  ProgressBar,
  CardTitle,
  CardContent,
  CardActions
} from '@/components/ui/PaperComponents';
import { SavingsGoal } from '@/utils/models/types';

export const SavingsOverview: React.FC = () => {
  const { theme, isDark, paperTheme } = useTheme();
  const colors = Colors[theme];
  const router = useRouter();
  
  const { 
    savingsGoals, 
    getFinancialSummary, 
    calculateGoalProgress,
    calculateOverallSavingsProgress,
    hasSavingsData,
    markDataAsSeen 
  } = useFinance();
  
  // Güvenli sayıya dönüştürme - NaN kontrolü
  const safeNumber = (value: number): number => {
    return isNaN(value) ? 0 : value;
  };
  
  // Veri durumunu kontrol et
  const hasGoals = savingsGoals.length > 0;
  const hasSeenGoals = hasSavingsData();
  
  // İlk gösterim için bir state
  const [showTutorial, setShowTutorial] = useState(hasGoals && !hasSeenGoals);
  
  // Finansal özet
  const summary = getFinancialSummary();
  
  // Toplam ilerleme
  const overallProgress = hasGoals ? calculateOverallSavingsProgress() : 0;
  const overallProgressDecimal = safeNumber(overallProgress / 100); // ProgressBar 0-1 arasında değer bekliyor
  
  // İlk 3 tasarruf hedefini göster
  const topSavingsGoals = savingsGoals.slice(0, 3);
  
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
  
  // Tasarruf hedefi kartı
  const renderSavingsGoalItem = (goal: any, index: number) => {
    const progress = safeNumber(goal.currentAmount / goal.targetAmount);
    const goalColor = goal.color || '#4C9AFF';
    const goalIcon = goal.icon || 'savings';
    
    return (
      <Animated.View
        key={goal.id}
        entering={FadeInRight.delay(index * 100).duration(400)}
        style={styles.goalItem}
      >
        <TouchableOpacity 
          style={styles.goalItemContent}
          onPress={() => viewGoalDetails(goal.id)}
        >
          <Surface style={[styles.iconContainer, { backgroundColor: `${goalColor}20` }]}>
            <ThemeIcon 
              name={goalIcon} 
              size={20} 
              color={goalColor} 
              type="material"
            />
          </Surface>
          
          <View style={styles.goalInfo}>
            <View style={styles.goalHeader}>
              <BodyMedium style={styles.goalName}>{goal.name}</BodyMedium>
              <BodySmall style={styles.goalAmount}>
                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
              </BodySmall>
            </View>
            
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={progress} 
                color={goalColor} 
                style={styles.progressBar}
              />
              <BodySmall style={styles.progressText}>
                {Math.round(safeNumber(progress * 100))}%
              </BodySmall>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // Veri yok - Boş durum
  if (!hasGoals) {
    return (
      <Animated.View 
        entering={FadeIn.duration(500)} 
      >
        <Card style={styles.card}>
          <EmptyState
            title="Tasarruf Hedefi Oluştur"
            message="Finansal hedeflerinize ulaşmak için bir tasarruf hedefi belirleyin."
            icon="piggy-bank"
            containerStyle={{ backgroundColor: 'transparent' }}
          />
          <Button 
            mode="contained" 
            onPress={createNewGoal}
            icon="plus"
            style={styles.button}
          >
            Hedef Ekle
          </Button>
        </Card>
      </Animated.View>
    );
  }
  
  // Veri var ama ilk kez görüntüleniyor - Eğitim/tanıtım
  if (showTutorial) {
    return (
      <Animated.View 
        entering={FadeIn.duration(500)} 
      >
        <Card style={styles.card}>
          <View style={styles.tutorialContainer}>
            <ThemeIcon name="lightbulb" size={32} color={paperTheme.colors.primary} style={styles.tutorialIcon} />
            <TitleLarge style={styles.tutorialTitle}>Tasarruf Hedefleriniz</TitleLarge>
            <BodyMedium style={[styles.tutorialText, { color: paperTheme.colors.onSurfaceVariant }]}>
              Burada tüm tasarruf hedeflerinizi ve ilerlemenizi görebilirsiniz. 
              Hedeflerinize para ekleyebilir ve ilerlemenizi takip edebilirsiniz.
            </BodyMedium>
          </View>
          
          {topSavingsGoals.map((goal, index) => renderSavingsGoalItem(goal, index))}
          
          <Button 
            mode="contained" 
            onPress={() => viewGoalDetails(topSavingsGoals[0].id)}
            style={styles.button}
          >
            Hedefleri Görüntüle
          </Button>
        </Card>
      </Animated.View>
    );
  }
  
  // Normal görünüm - Veri var ve daha önce görüntülenmiş
  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(300)}
    >
      <View style={styles.container}>
        {topSavingsGoals.map((goal, index) => renderSavingsGoalItem(goal, index))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  divider: {
    marginVertical: 16,
  },
  overallContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressPercentage: {
    fontWeight: 'bold',
  },
  goalSurface: {
    borderRadius: 8,
    marginBottom: 12,
  },
  goalItem: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  goalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalName: {
    fontWeight: '500',
  },
  goalAmount: {
    opacity: 0.8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  progressText: {
    fontWeight: '600',
    fontSize: 10,
    width: 35,
    textAlign: 'right',
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  goalCurrent: {
    opacity: 0.8,
  },
  goalPercentage: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  tutorialText: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
}); 