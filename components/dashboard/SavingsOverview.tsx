import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { useFinance } from '@/context/FinanceContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '@/utils';
import { ThemeIcon } from '../ui/ThemeIcon';
import { useTheme } from '@/context/ThemeContext';
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

// SavingsGoal tipine icon özelliği ekleme (geçici tip genişletme)
interface ExtendedSavingsGoal extends SavingsGoal {
  icon?: string;
}

export const SavingsOverview: React.FC = () => {
  const { theme, paperTheme } = useTheme();
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
  const overallProgressDecimal = overallProgress / 100; // ProgressBar 0-1 arasında değer bekliyor
  
  // Hedeflerin sayısına göre ilk 2 hedef
  const visibleGoals = savingsGoals.slice(0, 2) as ExtendedSavingsGoal[];
  
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
          
          {visibleGoals.map(goal => {
            const progressDecimal = calculateGoalProgress(goal.id) / 100;
            return (
              <Surface 
                key={goal.id} 
                style={styles.goalSurface}
                elevation={0}
              >
                <View style={styles.goalItem}>
                  <View style={[styles.goalIcon, { backgroundColor: goal.color || '#4C9AFF' }]}>
                    <IconSymbol name={goal.icon || 'target'} size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.goalInfo}>
                    <BodyMedium style={styles.goalName}>{goal.name}</BodyMedium>
                    <View style={styles.goalStats}>
                      <BodySmall style={styles.goalCurrent}>
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </BodySmall>
                      <BodySmall style={styles.goalPercentage}>
                        %{calculateGoalProgress(goal.id).toFixed(0)}
                      </BodySmall>
                    </View>
                    <ProgressBar 
                      progress={progressDecimal} 
                      color={goal.color || paperTheme.colors.primary}
                      style={styles.goalProgressBar}
                    />
                  </View>
                </View>
              </Surface>
            );
          })}
          
          <Button 
            mode="contained" 
            onPress={() => viewGoalDetails(visibleGoals[0].id)}
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
      entering={FadeIn.duration(500)} 
    >
      <Card style={styles.card}>
        <CardTitle title="Tasarruf Hedefleri" />
        <CardContent>
          <View style={styles.overallContainer}>
            <View style={styles.labelRow}>
              <LabelMedium>Toplam İlerleme</LabelMedium>
              <BodyMedium style={styles.progressPercentage}>%{overallProgress.toFixed(1)}</BodyMedium>
            </View>
            <ProgressBar 
              progress={overallProgressDecimal} 
              color={paperTheme.colors.primary}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          {visibleGoals.map(goal => {
            const progressDecimal = calculateGoalProgress(goal.id) / 100;
            return (
              <Surface 
                key={goal.id} 
                style={styles.goalSurface}
                elevation={0}
                onTouchEnd={() => viewGoalDetails(goal.id)}
              >
                <View style={styles.goalItem}>
                  <View style={[styles.goalIcon, { backgroundColor: goal.color || '#4C9AFF' }]}>
                    <IconSymbol name={goal.icon || 'target'} size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.goalInfo}>
                    <BodyMedium style={styles.goalName}>{goal.name}</BodyMedium>
                    <View style={styles.goalStats}>
                      <BodySmall style={styles.goalCurrent}>
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </BodySmall>
                      <BodySmall style={styles.goalPercentage}>
                        %{calculateGoalProgress(goal.id).toFixed(0)}
                      </BodySmall>
                    </View>
                    <ProgressBar 
                      progress={progressDecimal} 
                      color={goal.color || paperTheme.colors.primary}
                      style={styles.goalProgressBar}
                    />
                  </View>
                </View>
              </Surface>
            );
          })}
        </CardContent>
        
        <CardActions>
          <Button 
            mode="contained" 
            onPress={() => router.push('/savings')}
            style={styles.actionButton}
          >
            Tüm Hedefleri Görüntüle
          </Button>
        </CardActions>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
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
    fontWeight: '500',
    marginBottom: 4,
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
  goalProgressBar: {
    height: 6,
    borderRadius: 3,
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