import { ExpenseService } from './expenseService';
import { SavingsService } from './savingsService';
import { Expense, SavingsGoal, Transaction, FinancialState } from '../models/types';
import { calculationService } from './calculationService';

/**
 * FinanceManager - Tüm finansal servisleri yöneten merkezi yönetici
 */
export class FinanceManager {
  private expenseService: ExpenseService;
  private savingsService: SavingsService;
  private static instance: FinanceManager;
  
  /**
   * Singleton pattern ile tek bir örnek oluşturulmasını sağlar
   */
  public static getInstance(initialBalance: number = 0): FinanceManager {
    if (!FinanceManager.instance) {
      FinanceManager.instance = new FinanceManager(initialBalance);
    }
    return FinanceManager.instance;
  }
  
  private constructor(initialBalance: number = 0) {
    // Expense service oluştur
    this.expenseService = new ExpenseService(initialBalance);
    
    // Mevcut finansal durumu al
    const financialState = this.expenseService.getFinancialState();
    
    // Savings service oluştur
    this.savingsService = new SavingsService(financialState);
  }
  
  /**
   * Finansal durumu döndürür
   */
  getFinancialState(): FinancialState {
    return this.expenseService.getFinancialState();
  }
  
  /**
   * Mevcut bakiyeyi döndürür
   */
  getCurrentBalance(): number {
    return this.expenseService.getCurrentBalance();
  }
  
  /**
   * Toplam harcamaları döndürür
   */
  getTotalExpenses(): number {
    return this.expenseService.getTotalExpenses();
  }
  
  /**
   * Toplam tasarrufları döndürür
   */
  getTotalSavings(): number {
    return this.savingsService.getTotalSavings();
  }
  
  /**
   * Tüm harcamaları döndürür
   */
  getAllExpenses(): Expense[] {
    return this.expenseService.getAllExpenses();
  }
  
  /**
   * Tüm tasarruf hedeflerini döndürür
   */
  getAllSavingsGoals(): SavingsGoal[] {
    return this.savingsService.getAllGoals();
  }
  
  /**
   * Yeni harcama ekler
   * Validasyonu calculationService ile yapar
   */
  addExpense(expenseData: Omit<Expense, 'id' | 'date'> & { date?: Date }): Expense | null {
    // Validasyon kontrolü
    const validation = calculationService.validateExpenseData(expenseData, this.getCurrentBalance());
    if (!validation.isValid) {
      console.error(`Harcama eklenirken validasyon hatası: ${validation.errorMessage}`);
      return null;
    }
    
    return this.expenseService.addExpense(expenseData);
  }
  
  /**
   * Harcama siler
   */
  removeExpense(expenseId: string): boolean {
    if (!expenseId) {
      console.error('Geçerli bir harcama ID\'si belirtilmedi');
      return false;
    }
    
    return this.expenseService.removeExpense(expenseId);
  }
  
  /**
   * Yeni tasarruf hedefi ekler
   * Validasyonu calculationService ile yapar
   */
  addSavingsGoal(goalData: Omit<SavingsGoal, 'id' | 'currentAmount' | 'createdAt'>): SavingsGoal | null {
    // Validasyon kontrolü
    const validation = calculationService.validateSavingsGoalData(goalData);
    if (!validation.isValid) {
      console.error(`Tasarruf hedefi eklenirken validasyon hatası: ${validation.errorMessage}`);
      return null;
    }
    
    return this.savingsService.addGoal(goalData);
  }
  
  /**
   * Tasarruf hedefine para ekler
   * Validasyonu calculationService ile yapar
   */
  addFundsToGoal(goalId: string, amount: number, description?: string): boolean {
    if (!goalId) {
      console.error('Geçerli bir hedef ID\'si belirtilmedi');
      return false;
    }
    
    // Validasyon kontrolü
    const validation = calculationService.validateAddFunds(amount, this.getCurrentBalance());
    if (!validation.isValid) {
      console.error(`Hedefe para eklenirken validasyon hatası: ${validation.errorMessage}`);
      return false;
    }
    
    return this.savingsService.addFundsToGoal(goalId, amount, description);
  }
  
  /**
   * Tasarruf hedefinden para çeker
   * Validasyonu calculationService ile yapar
   */
  withdrawFundsFromGoal(goalId: string, amount: number, description?: string): boolean {
    if (!goalId) {
      console.error('Geçerli bir hedef ID\'si belirtilmedi');
      return false;
    }
    
    // Hedefi bul
    const goal = this.savingsService.getGoalById(goalId);
    if (!goal) {
      console.error('Belirtilen ID ile bir tasarruf hedefi bulunamadı');
      return false;
    }
    
    // Validasyon kontrolü
    const validation = calculationService.validateWithdrawFunds(amount, goal.currentAmount);
    if (!validation.isValid) {
      console.error(`Hedeften para çekilirken validasyon hatası: ${validation.errorMessage}`);
      return false;
    }
    
    return this.savingsService.withdrawFundsFromGoal(goalId, amount, description);
  }
  
  /**
   * Tasarruf hedefini günceller
   * Validasyonu calculationService ile yapar
   */
  updateSavingsGoal(goalId: string, updates: Partial<Omit<SavingsGoal, 'id' | 'createdAt'>>): boolean {
    if (!goalId) {
      console.error('Geçerli bir hedef ID\'si belirtilmedi');
      return false;
    }
    
    // Hedefi bul
    const goal = this.savingsService.getGoalById(goalId);
    if (!goal) {
      console.error('Belirtilen ID ile bir tasarruf hedefi bulunamadı');
      return false;
    }
    
    // Validasyon kontrolü (hedef tutar güncelleniyorsa)
    if (updates.targetAmount !== undefined) {
      const validation = calculationService.validatePositiveValue(updates.targetAmount, 'Hedef tutar');
      if (!validation.isValid) {
        console.error(`Hedef güncellenirken validasyon hatası: ${validation.errorMessage}`);
        return false;
      }
    }
    
    return this.savingsService.updateGoal(goalId, updates);
  }
  
  /**
   * Tasarruf hedefini siler
   */
  removeSavingsGoal(goalId: string): boolean {
    if (!goalId) {
      console.error('Geçerli bir hedef ID\'si belirtilmedi');
      return false;
    }
    
    return this.savingsService.removeGoal(goalId);
  }
  
  /**
   * Tasarruf hedefinin ilerleme yüzdesini hesaplar
   * Hesaplamayı calculationService ile yapar
   */
  calculateGoalProgress(goalId: string): number {
    const goal = this.savingsService.getGoalById(goalId);
    if (!goal) {
      console.error('Belirtilen ID ile bir tasarruf hedefi bulunamadı');
      return 0;
    }
    
    return calculationService.calculateGoalProgress(goal);
  }
  
  /**
   * Son işlemleri döndürür
   */
  getRecentTransactions(limit: number = 10): Transaction[] {
    return this.expenseService.getRecentTransactions(limit);
  }
  
  /**
   * Belirli bir hedefin işlemlerini döndürür
   */
  getGoalTransactions(goalId: string): Transaction[] {
    return this.savingsService.getGoalTransactions(goalId);
  }
  
  /**
   * İşlemi geri alır
   */
  undoTransaction(transactionId: string): boolean {
    if (!transactionId) {
      console.error('Geçerli bir işlem ID\'si belirtilmedi');
      return false;
    }
    
    return this.expenseService.undoTransaction(transactionId);
  }
  
  /**
   * Finansal özet bilgilerini döndürür
   * Hesaplamayı calculationService ile yapar
   */
  getFinancialSummary(): {
    balance: number;
    totalExpenses: number; 
    totalSavings: number;
    savingsPercentage: number;
    goalCount: number;
  } {
    const financialState = this.getFinancialState();
    const savingsGoals = this.getAllSavingsGoals();
    
    return calculationService.calculateFinancialSummary(financialState, savingsGoals);
  }
} 