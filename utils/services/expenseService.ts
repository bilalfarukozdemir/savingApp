import { Expense, Transaction, FinancialState } from '../models/types';
import { generateUniqueId, validateTransactionDate } from '../models/utils';

/**
 * ExpenseService - Harcama işlemlerini yöneten servis
 */
export class ExpenseService {
  private expenses: Expense[] = [];
  private transactions: Transaction[] = [];
  private financialState: FinancialState = {
    currentBalance: 0,
    totalExpenses: 0,
    totalSavings: 0,
    lastUpdated: new Date()
  };

  constructor(initialBalance: number = 0) {
    this.financialState.currentBalance = initialBalance;
  }

  /**
   * Tüm harcamaları döndürür
   */
  getAllExpenses(): Expense[] {
    return [...this.expenses];
  }

  /**
   * Mevcut bakiyeyi döndürür
   */
  getCurrentBalance(): number {
    return this.financialState.currentBalance;
  }

  /**
   * Toplam harcamaları döndürür
   */
  getTotalExpenses(): number {
    return this.financialState.totalExpenses;
  }

  /**
   * Finansal durumu döndürür
   */
  getFinancialState(): FinancialState {
    return { ...this.financialState };
  }

  /**
   * Belirli bir kategoriye göre harcamaları filtreler
   */
  getExpensesByCategory(category: string): Expense[] {
    return this.expenses.filter(expense => expense.category === category);
  }

  /**
   * Tarih aralığına göre harcamaları filtreler
   */
  getExpensesByDateRange(startDate: Date, endDate: Date): Expense[] {
    return this.expenses.filter(expense => {
      return expense.date >= startDate && expense.date <= endDate;
    });
  }

  /**
   * Yeni bir harcama ekler
   */
  addExpense(expenseData: Omit<Expense, 'id' | 'date'> & { date?: Date }): Expense | null {
    try {
      const { amount, category, description } = expenseData;
      
      // Validasyon
      if (amount <= 0) {
        throw new Error('Harcama tutarı pozitif olmalıdır');
      }
      
      if (!category || category.trim() === '') {
        throw new Error('Kategori gereklidir');
      }
      
      if (this.financialState.currentBalance < amount) {
        throw new Error('Yetersiz bakiye');
      }
      
      const date = expenseData.date || new Date();
      
      if (!validateTransactionDate(date)) {
        throw new Error('Geçersiz işlem tarihi');
      }
      
      // Yeni harcama oluştur
      const newExpense: Expense = {
        id: generateUniqueId(),
        amount,
        category,
        description,
        date
      };
      
      // Finansal durumu güncelle
      this.financialState.currentBalance -= amount;
      this.financialState.totalExpenses += amount;
      this.financialState.lastUpdated = new Date();
      
      // Harcamayı listesine ekle
      this.expenses.push(newExpense);
      
      // İşlem ekle
      this.addTransaction({
        id: generateUniqueId(),
        amount,
        type: 'expense',
        category,
        description,
        date
      });
      
      return newExpense;
    } catch (error) {
      console.error('Harcama eklenirken hata:', error);
      return null;
    }
  }

  /**
   * Harcama siler
   */
  removeExpense(expenseId: string): boolean {
    const expenseIndex = this.expenses.findIndex(e => e.id === expenseId);
    
    if (expenseIndex === -1) {
      return false;
    }
    
    const expense = this.expenses[expenseIndex];
    
    // Finansal durumu güncelle
    this.financialState.currentBalance += expense.amount;
    this.financialState.totalExpenses -= expense.amount;
    this.financialState.lastUpdated = new Date();
    
    // Harcamayı kaldır
    this.expenses.splice(expenseIndex, 1);
    
    return true;
  }

  /**
   * Yeni bir işlem ekler
   */
  private addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  /**
   * Son işlemleri döndürür
   */
  getRecentTransactions(limit: number = 10): Transaction[] {
    return [...this.transactions]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  /**
   * İşlemleri iade eder
   */
  undoTransaction(transactionId: string): boolean {
    const transactionIndex = this.transactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
      return false;
    }
    
    const transaction = this.transactions[transactionIndex];
    
    if (transaction.type === 'expense') {
      // Harcama işlemini geri al
      this.financialState.currentBalance += transaction.amount;
      this.financialState.totalExpenses -= transaction.amount;
      
      // İlgili harcamayı bul ve kaldır
      const expenseIndex = this.expenses.findIndex(e => 
        e.amount === transaction.amount && 
        e.category === transaction.category && 
        e.date.getTime() === transaction.date.getTime()
      );
      
      if (expenseIndex !== -1) {
        this.expenses.splice(expenseIndex, 1);
      }
    }
    
    // İşlemi işlem listesinden kaldır
    this.transactions.splice(transactionIndex, 1);
    
    // Finansal durum güncelleme 
    this.financialState.lastUpdated = new Date();
    
    return true;
  }
} 