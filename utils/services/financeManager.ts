import { ExpenseService } from './expenseService';
import { SavingsService } from './savingsService';
import { Expense, SavingsGoal, Transaction, FinancialState } from '../models/types';
import { calculationService } from './calculationService';

/**
 * FinanceManager - Tüm finansal servisleri yöneten merkezi yönetici
 * ExpenseService ana bakiye yöneticisi, SavingsService tasarruf hedeflerini yönetir
 */
export class FinanceManager {
  private expenseService: ExpenseService;
  private savingsService: SavingsService;
  private static instance: FinanceManager;
  
  /**
   * Singleton pattern ile tek örnek oluşturur
   */
  public static getInstance(initialBalance: number = 0): FinanceManager {
    if (!FinanceManager.instance) {
      FinanceManager.instance = new FinanceManager(initialBalance);
    }
    return FinanceManager.instance;
  }
  
  private constructor(initialBalance: number = 0) {
    // Servisleri oluştur ve ilk senkronizasyonu yap
    this.expenseService = new ExpenseService(initialBalance);
    this.savingsService = new SavingsService();
    this.syncFinancialState();
  }
  
  /**
   * Finansal durumu döndürür
   */
  getFinancialState(): FinancialState {
    // Önce finansal durumu senkronize et
    this.syncFinancialState();
    // Sonra güncel durumu döndür
    return this.expenseService.getFinancialState();
  }
  
  /**
   * SavingsService'den tasarruf bilgilerini alır ve 
   * ExpenseService'i günceller
   */
  private syncFinancialState(): void {
    try {
      // ExpenseService'den mevcut finansal durumu al
      const expenseState = this.expenseService.getFinancialState();
      
      // SavingsService'den tasarruf bilgilerini al
      const savingsInfo = this.savingsService.getSavingsInfo();
      const totalSavings = savingsInfo.totalSavings;
      
      // ExpenseService'deki totalSavings değerini güncelle
      expenseState.totalSavings = totalSavings;
      
      // Güncellenmiş durumu ExpenseService'e geri ver
      this.expenseService.updateFinancialState(expenseState);
    } catch (error) {
      console.error('Finansal durum senkronizasyonu hatası:', error);
    }
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
    
    const result = this.expenseService.addExpense(expenseData);
    
    // İşlemden sonra finansal durumu senkronize et
    if (result) {
      this.syncFinancialState();
    }
    
    return result;
  }
  
  /**
   * Harcama siler
   */
  removeExpense(expenseId: string): boolean {
    if (!expenseId) {
      console.error('Geçerli bir harcama ID\'si belirtilmedi');
      return false;
    }
    
    const result = this.expenseService.removeExpense(expenseId);
    
    // İşlemden sonra finansal durumu senkronize et
    if (result) {
      this.syncFinancialState();
    }
    
    return result;
  }
  
  /**
   * Yeni tasarruf hedefi ekler
   * Validasyonu calculationService ile yapar
   */
  addSavingsGoal(goalData: Omit<SavingsGoal, 'id' | 'createdAt'>): SavingsGoal | null {
    const validation = calculationService.validateSavingsGoalData(goalData);
    if (!validation.isValid) {
      console.error(`Tasarruf hedefi eklenirken validasyon hatası: ${validation.errorMessage}`);
      return null;
    }
    
    const result = this.savingsService.addGoal(goalData);
    
    // İşlemden sonra finansal durumu senkronize et
    if (result) {
      this.syncFinancialState();
    }
    
    return result;
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
    
    // Mevcut bakiyeyi kontrol et
    const currentBalance = this.getCurrentBalance();
    if (currentBalance < amount) {
      console.error(`Yetersiz bakiye. Mevcut bakiye: ${currentBalance}, Eklenmeye çalışılan: ${amount}`);
      return false;
    }
    
    // Validasyon kontrolü
    const validation = calculationService.validateAddFunds(amount, currentBalance);
    if (!validation.isValid) {
      console.error(`Hedefe para eklenirken validasyon hatası: ${validation.errorMessage}`);
      return false;
    }
    
    try {
      // Önce ExpenseService'den bakiyeyi azalt
      this.expenseService.addToBalance(-amount, `${description || "Tasarruf"} - Tasarruf hedefine para eklendi`);
      
      // Sonra SavingsService'de hedefi güncelle
      const result = this.savingsService.addFundsToGoal(goalId, amount, description);
      
      // İşlem başarısızsa geri al
      if (!result) {
        this.expenseService.addToBalance(amount, "Tasarruf işlemi iptal - Bakiye iade");
        return false;
      }
      
      // İşlemden sonra finansal durumu senkronize et
      this.syncFinancialState();
      
      return true;
    } catch (error) {
      console.error('Hedefe para eklerken hata:', error);
      // Hata durumunda işlemi geri almayı dene
      this.expenseService.addToBalance(amount, "Tasarruf işlemi hata - Bakiye iade");
      return false;
    }
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
    
    // Hedefte yeterli miktar olup olmadığını kontrol et
    if (goal.currentAmount < amount) {
      console.error(`Hedefte yeterli miktar bulunmuyor. Mevcut miktar: ${goal.currentAmount}, Çekilmek istenen: ${amount}`);
      return false;
    }
    
    // Validasyon kontrolü
    const validation = calculationService.validateWithdrawFunds(amount, goal.currentAmount);
    if (!validation.isValid) {
      console.error(`Hedeften para çekilirken validasyon hatası: ${validation.errorMessage}`);
      return false;
    }
    
    try {
      // Önce SavingsService'den para çek
      const result = this.savingsService.withdrawFundsFromGoal(goalId, amount, description);
      
      // Başarılıysa ExpenseService bakiyesini artır
      if (result) {
        this.expenseService.addToBalance(amount, `${description || "Tasarruf Geri Çekimi"} - Tasarruf hedefinden para çekildi`);
      } else {
        return false;
      }
      
      // İşlemden sonra finansal durumu senkronize et
      this.syncFinancialState();
      
      return true;
    } catch (error) {
      console.error('Hedeften para çekerken hata:', error);
      return false;
    }
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
    
    // Hedef tutarı güncellenmişse validasyon yap
    if (updates.targetAmount !== undefined) {
      const validation = calculationService.validatePositiveValue(updates.targetAmount, 'Hedef tutar');
      if (!validation.isValid) {
        console.error(`Tasarruf hedefi güncellenirken validasyon hatası: ${validation.errorMessage}`);
        return false;
      }
    }
    
    const result = this.savingsService.updateGoal(goalId, updates);
    
    // İşlemden sonra finansal durumu senkronize et
    if (result) {
      this.syncFinancialState();
    }
    
    return result;
  }
  
  /**
   * Tasarruf hedefini siler
   */
  removeSavingsGoal(goalId: string): boolean {
    if (!goalId) {
      console.error('Geçerli bir hedef ID\'si belirtilmedi');
      return false;
    }
    
    const result = this.savingsService.removeGoal(goalId);
    
    // İşlemden sonra finansal durumu senkronize et
    if (result) {
      this.syncFinancialState();
    }
    
    return result;
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
    // Hem harcama hem de tasarruf işlemlerini al
    const expenseTransactions = this.expenseService.getRecentTransactions(limit * 2); // Daha fazla al ki sıralama doğru olsun
    const savingsTransactions = this.savingsService.getGoalTransactions(''); // Tüm işlemleri alır
    
    // İki listeyi birleştir ve tarihe göre sırala
    return [...expenseTransactions, ...savingsTransactions]
      .sort((a, b) => b.date.getTime() - a.date.getTime()) // En yeni en başta
      .slice(0, limit); // İstenen sayıya kısıtla
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
    
    const result = this.expenseService.undoTransaction(transactionId);
    
    // İşlemden sonra finansal durumu senkronize et
    if (result) {
      this.syncFinancialState();
    }
    
    return result;
  }
  
  /**
   * Bakiyeye para ekler
   */
  addToBalance(amount: number, description?: string): boolean {
    const validation = calculationService.validatePositiveValue(amount, 'Eklenecek miktar');
    if (!validation.isValid) {
      console.error(`Bakiyeye para eklenirken validasyon hatası: ${validation.errorMessage}`);
      return false;
    }
    
    const result = this.expenseService.addToBalance(amount, description);
    
    // İşlemden sonra finansal durumu senkronize et
    if (result) {
      this.syncFinancialState();
    }
    
    return result;
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
  
  /**
   * Finansal durumu günceller
   */
  updateFinancialState(newState: FinancialState): void {
    try {
      // ExpenseService'i güncelle
      this.expenseService.updateFinancialState(newState);
      
      // Servisleri senkronize et
      this.syncFinancialState();
    } catch (error) {
      console.error('Finansal durum güncelleme hatası:', error);
    }
  }
  
  /**
   * İşlemleri kaydeder ve finansal durumu günceller
   * Bu metod, SavingsService'ten gelen işlemleri de işleyebilir
   */
  handleTransaction(transaction: Transaction): boolean {
    try {
      // İşlemi kaydet
      const success = this.expenseService.handleTransaction(transaction);
      
      if (success) {
        // Servisleri senkronize et
        this.syncFinancialState();
        
        // İşlem başarıyla kaydedildi ve senkronize edildi
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('İşlem işleme hatası:', error);
      return false;
    }
  }
} 