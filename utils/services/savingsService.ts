import { SavingsGoal, Transaction, FinancialState } from '../models/types';
import { generateUniqueId, calculateGoalProgress, calculateRemainingDays } from '../models/utils';

/**
 * SavingsService - Tasarruf hedeflerini yöneten servis
 */
export class SavingsService {
  private goals: SavingsGoal[] = [];
  private transactions: Transaction[] = [];
  private financialState: FinancialState;

  constructor(financialState: FinancialState) {
    this.financialState = financialState;
  }

  /**
   * Tüm tasarruf hedeflerini döndürür
   */
  getAllGoals(): SavingsGoal[] {
    return [...this.goals];
  }

  /**
   * Hedef ID'sine göre tasarruf hedefini getirir
   */
  getGoalById(goalId: string): SavingsGoal | undefined {
    return this.goals.find(goal => goal.id === goalId);
  }

  /**
   * Toplam tasarruf miktarını döndürür
   */
  getTotalSavings(): number {
    return this.goals.reduce((total, goal) => total + goal.currentAmount, 0);
  }

  /**
   * Tüm tasarruf hedeflerinin ilerleme durumlarını hesaplar
   */
  getAllGoalsProgress(): Array<{ goalId: string, progress: number }> {
    return this.goals.map(goal => ({
      goalId: goal.id,
      progress: calculateGoalProgress(goal)
    }));
  }

  /**
   * Bir hedefin ilerleme durumunu hesaplar
   */
  getGoalProgress(goalId: string): number {
    const goal = this.getGoalById(goalId);
    return goal ? calculateGoalProgress(goal) : 0;
  }

  /**
   * Yeni bir tasarruf hedefi ekler
   */
  addGoal(goalData: Omit<SavingsGoal, 'id' | 'currentAmount' | 'createdAt'>): SavingsGoal | null {
    try {
      const { name, targetAmount, category, color, targetDate } = goalData;
      
      // Validasyon
      if (!name || name.trim() === '') {
        throw new Error('Hedef adı gereklidir');
      }
      
      if (targetAmount <= 0) {
        throw new Error('Hedef tutarı pozitif olmalıdır');
      }
      
      // Yeni tasarruf hedefi oluştur
      const newGoal: SavingsGoal = {
        id: generateUniqueId(),
        name,
        targetAmount,
        currentAmount: 0,
        category: category || 'Genel',
        color,
        targetDate,
        createdAt: new Date()
      };
      
      // Hedefi listeye ekle
      this.goals.push(newGoal);
      
      return newGoal;
    } catch (error) {
      console.error('Tasarruf hedefi eklenirken hata:', error);
      return null;
    }
  }

  /**
   * Tasarruf hedefine para ekler
   */
  addFundsToGoal(goalId: string, amount: number, description: string = ''): boolean {
    try {
      if (amount <= 0) {
        throw new Error('Miktar pozitif olmalıdır');
      }
      
      if (this.financialState.currentBalance < amount) {
        throw new Error('Yetersiz bakiye');
      }
      
      const goalIndex = this.goals.findIndex(g => g.id === goalId);
      
      if (goalIndex === -1) {
        throw new Error('Tasarruf hedefi bulunamadı');
      }
      
      // Finansal durumu güncelle
      this.financialState.currentBalance -= amount;
      this.financialState.totalSavings += amount;
      this.financialState.lastUpdated = new Date();
      
      // Hedefi güncelle
      this.goals[goalIndex].currentAmount += amount;
      
      // İşlem ekle
      this.addTransaction({
        id: generateUniqueId(),
        amount,
        type: 'transfer',
        category: 'Tasarruf',
        description: description || `${this.goals[goalIndex].name} hedefine para eklendi`,
        date: new Date(),
        relatedGoalId: goalId
      });
      
      return true;
    } catch (error) {
      console.error('Hedefe para eklenirken hata:', error);
      return false;
    }
  }

  /**
   * Tasarruf hedefinden para çeker
   */
  withdrawFundsFromGoal(goalId: string, amount: number, description: string = ''): boolean {
    try {
      const goalIndex = this.goals.findIndex(g => g.id === goalId);
      
      if (goalIndex === -1) {
        throw new Error('Tasarruf hedefi bulunamadı');
      }
      
      const goal = this.goals[goalIndex];
      
      if (amount <= 0) {
        throw new Error('Miktar pozitif olmalıdır');
      }
      
      if (goal.currentAmount < amount) {
        throw new Error('Hedefte yeterli miktar bulunmuyor');
      }
      
      // Hedefi güncelle
      this.goals[goalIndex].currentAmount -= amount;
      
      // Finansal durumu güncelle
      this.financialState.currentBalance += amount;
      this.financialState.totalSavings -= amount;
      this.financialState.lastUpdated = new Date();
      
      // İşlem ekle
      this.addTransaction({
        id: generateUniqueId(),
        amount,
        type: 'transfer',
        category: 'Tasarruf Çekimi',
        description: description || `${goal.name} hedefinden para çekildi`,
        date: new Date(),
        relatedGoalId: goalId
      });
      
      return true;
    } catch (error) {
      console.error('Hedeften para çekilirken hata:', error);
      return false;
    }
  }

  /**
   * Tasarruf hedefini günceller
   */
  updateGoal(goalId: string, updates: Partial<Omit<SavingsGoal, 'id' | 'createdAt'>>): boolean {
    const goalIndex = this.goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) {
      return false;
    }
    
    // Hedefi güncelle
    this.goals[goalIndex] = {
      ...this.goals[goalIndex],
      ...updates
    };
    
    return true;
  }

  /**
   * Tasarruf hedefini siler
   */
  removeGoal(goalId: string): boolean {
    const goalIndex = this.goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) {
      return false;
    }
    
    const goal = this.goals[goalIndex];
    
    // Finansal durumu güncelle (kalan miktar bakiyeye eklenir)
    if (goal.currentAmount > 0) {
      this.financialState.currentBalance += goal.currentAmount;
      this.financialState.totalSavings -= goal.currentAmount;
      this.financialState.lastUpdated = new Date();
      
      // Kalan miktar için işlem ekle
      this.addTransaction({
        id: generateUniqueId(),
        amount: goal.currentAmount,
        type: 'transfer',
        category: 'Tasarruf Hedefi İptali',
        description: `${goal.name} hedefi silindi, ${goal.currentAmount} bakiyeye eklendi`,
        date: new Date(),
        relatedGoalId: goalId
      });
    }
    
    // Hedefi kaldır
    this.goals.splice(goalIndex, 1);
    
    return true;
  }

  /**
   * Yeni bir işlem ekler
   */
  private addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  /**
   * Tasarruf hedefine ait işlemleri getirir
   */
  getGoalTransactions(goalId: string): Transaction[] {
    return this.transactions.filter(t => t.relatedGoalId === goalId);
  }

  /**
   * Hızlı hedef önerileri (örn. aylık %10 tasarruf)
   */
  generateSavingsSuggestions(monthlyIncome: number): Array<{ name: string, amount: number, period: string }> {
    return [
      { name: 'Temel Tasarruf', amount: monthlyIncome * 0.1, period: 'Aylık' },
      { name: 'Agresif Tasarruf', amount: monthlyIncome * 0.2, period: 'Aylık' },
      { name: 'Mini Tasarruf', amount: monthlyIncome * 0.05, period: 'Aylık' }
    ];
  }
} 