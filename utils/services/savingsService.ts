import { SavingsGoal, Transaction, FinancialState } from '../models/types';
import { generateUniqueId, calculateGoalProgress, calculateRemainingDays } from '../models/utils';

/**
 * SavingsService - Tasarruf hedeflerini yöneten servis
 * Tüm finansal işlemler için FinanceManager'a yönlendirir
 */
export class SavingsService {
  private goals: SavingsGoal[] = [];
  private transactions: Transaction[] = [];

  constructor() {
    // Boş constructor
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
  getAllGoalsProgress(): { goalId: string, progress: number }[] {
    try {
      return this.goals.map(goal => ({
        goalId: goal.id,
        progress: this.getGoalProgress(goal.id)
      }));
    } catch (error) {
      console.error('Hedef ilerleme hesaplama hatası:', error);
      return [];
    }
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
  addGoal(goalData: Omit<SavingsGoal, 'id' | 'createdAt'>): SavingsGoal | null {
    try {
      const { name, targetAmount, currentAmount = 0, category, color, targetDate } = goalData;
      
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
        currentAmount: currentAmount || 0,
        category: category || 'Genel',
        color,
        targetDate,
        createdAt: new Date()
      };
      
      // Hedefi listeye ekle
      this.goals.push(newGoal);
      
      // Eğer başlangıç tutarı varsa, işlem kaydı oluştur
      if (currentAmount > 0) {
        // Başlangıç tutarı için bir işlem kaydı oluştur
        const transaction: Transaction = {
          id: generateUniqueId(),
          amount: currentAmount,
          type: 'transfer',
          category: 'Tasarruf',
          description: `${name} hedefine başlangıç tutarı`,
          date: new Date(),
          relatedGoalId: newGoal.id
        };
        
        this.transactions.push(transaction);
      }
      
      return newGoal;
    } catch (error) {
      console.error('Tasarruf hedefi eklenirken hata:', error);
      return null;
    }
  }

  /**
   * Tasarruf hedefine para ekler
   * Yeni sürümde FinanceManager'a yönlendirir
   */
  addFundsToGoal(goalId: string, amount: number, description?: string): boolean {
    try {
      const goalIndex = this.goals.findIndex(g => g.id === goalId);
      
      if (goalIndex === -1) {
        throw new Error('Tasarruf hedefi bulunamadı');
      }
      
      const goal = this.goals[goalIndex];
      
      if (amount <= 0) {
        throw new Error('Miktar pozitif olmalıdır');
      }
      
      // ÖNEMLİ: Bu işlem artık FinanceManager tarafından kontrol edilir
      // Burada sadece hedef bakiyesini güncelliyoruz
      
      // Hedefi güncelle
      this.goals[goalIndex].currentAmount += amount;
      
      // İşlem oluştur
      const transaction: Transaction = {
        id: generateUniqueId(),
        amount,
        type: 'expense',
        category: 'Tasarruf',
        description: description || `${goal.name} hedefine para eklendi`,
        date: new Date(),
        relatedGoalId: goalId
      };
      
      // İşlemi kaydet
      this.addTransaction(transaction);
      
      return true;
    } catch (error) {
      console.error('Hedefe para eklerken hata:', error);
      return false;
    }
  }

  /**
   * Tasarruf hedefinden para çeker
   * Yeni sürümde FinanceManager'a yönlendirir
   */
  withdrawFundsFromGoal(goalId: string, amount: number, description?: string): boolean {
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
      
      // İşlem oluştur
      const transaction: Transaction = {
        id: generateUniqueId(),
        amount,
        type: 'income',
        category: 'Tasarruf Geri Çekimi',
        description: description || `${goal.name} hedefinden para çekildi`,
        date: new Date(),
        relatedGoalId: goalId
      };
      
      // İşlemi kaydet
      this.addTransaction(transaction);
      
      return true;
    } catch (error) {
      console.error('Hedeften para çekerken hata:', error);
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
    
    // Artık finansal durumu burada güncellemiyoruz
    // FinanceManager bu işlemi yapacak
    
    // Hedefi kaldır
    this.goals.splice(goalIndex, 1);
    
    // Kalan miktar için işlem ekle
    if (goal.currentAmount > 0) {
      // İşlem kaydı oluştur
      this.addTransaction({
        id: generateUniqueId(),
        amount: goal.currentAmount,
        type: 'income',
        category: 'Tasarruf Hedefi İptali',
        description: `${goal.name} hedefi silindi, ${goal.currentAmount} bakiyeye eklendi`,
        date: new Date(),
        relatedGoalId: goalId
      });
    }
    
    return true;
  }

  /**
   * İşlem ekler
   */
  private addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  /**
   * Tasarruf hedefine ait işlemleri getirir
   * Eğer goalId boş string ise, tüm işlemleri döndürür
   */
  getGoalTransactions(goalId: string): Transaction[] {
    // goalId boş ise, tüm işlemleri döndür
    if (!goalId) {
      return [...this.transactions];
    }
    
    // Belirli bir hedefe ait işlemleri filtrele
    return this.transactions.filter(t => t.relatedGoalId === goalId);
  }

  /**
   * Hızlı hedef önerileri (örn. aylık %10 tasarruf)
   */
  generateSavingsSuggestions(monthlyIncome: number): { name: string, amount: number, period: string }[] {
    // Gelire göre tasarruf önerileri
    const suggestions = [
      {
        name: 'Acil Durum Fonu',
        amount: monthlyIncome * 0.1, // Gelirin %10'u
        period: 'aylık'
      },
      {
        name: 'Tatil Fonu',
        amount: monthlyIncome * 0.05, // Gelirin %5'i
        period: 'aylık'
      },
      {
        name: 'Emeklilik Fonu',
        amount: monthlyIncome * 0.15, // Gelirin %15'i
        period: 'aylık'
      }
    ];
    
    return suggestions;
  }

  /**
   * FinanceManager için tasarruf bilgilerini hazırlar
   * Bu fonksiyon FinanceManager tarafından çağrılır
   */
  getSavingsInfo(): { totalSavings: number, goals: SavingsGoal[] } {
    return {
      totalSavings: this.getTotalSavings(),
      goals: [...this.goals]
    };
  }

  private recordExpenseTransaction(
    goalId: string, 
    amount: number, 
    transactionType: Transaction['type'],
    description: string = 'Para çekildi'
  ): Transaction | null {
    try {
      if (!goalId || amount <= 0) {
        return null;
      }
      
      const goal = this.getGoalById(goalId);
      if (!goal) {
        return null;
      }
      
      // Transaction nesnesi oluştur
      const transaction: Transaction = {
        id: generateUniqueId(),
        amount,
        type: transactionType,
        category: 'Tasarruf',
        description,
        date: new Date(),
        relatedGoalId: goalId
      };
      
      this.transactions.push(transaction);
      return transaction;
    } catch (error) {
      console.error('Harcama işlemi kaydedilirken hata:', error);
      return null;
    }
  }
  
  private recordIncomeTransaction(
    goalId: string, 
    amount: number, 
    transactionType: Transaction['type'],
    description: string = 'Para eklendi'
  ): Transaction | null {
    try {
      if (!goalId || amount <= 0) {
        return null;
      }
      
      const goal = this.getGoalById(goalId);
      if (!goal) {
        return null;
      }
      
      // Transaction nesnesi oluştur
      const transaction: Transaction = {
        id: generateUniqueId(),
        amount,
        type: transactionType,
        category: 'Tasarruf Geliri',
        description,
        date: new Date(),
        relatedGoalId: goalId
      };
      
      this.transactions.push(transaction);
      return transaction;
    } catch (error) {
      console.error('Gelir işlemi kaydedilirken hata:', error);
      return null;
    }
  }
} 