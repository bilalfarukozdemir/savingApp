import { Expense, Transaction, FinancialState } from '../models/types';
import { generateUniqueId, validateTransactionDate } from '../models/utils';

/**
 * ExpenseService - Harcama işlemlerini yöneten servis
 * Yeni Mimari: Ana finansal durum kaynağı olarak hizmet verir
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
   * Harcama ekler
   */
  addExpense(expenseData: Omit<Expense, 'id' | 'date'> & { date?: Date }): Expense | null {
    try {
      const date = expenseData.date || new Date();
      
      if (!validateTransactionDate(date)) {
        throw new Error('Geçersiz tarih');
      }
      
      if (expenseData.amount <= 0) {
        throw new Error('Harcama tutarı pozitif olmalıdır');
      }
      
      // Bakiye kontrolü - negatife düşmemeli
      if (this.financialState.currentBalance < expenseData.amount) {
        throw new Error('Yetersiz bakiye');
      }

      // Yeni harcama nesnesi oluştur
      const newExpense: Expense = {
        id: generateUniqueId(),
        amount: expenseData.amount,
        category: expenseData.category,
        description: expenseData.description || '',
        date
      };
      
      // Harcamayı listeye ekle
      this.expenses.push(newExpense);
      
      // İşlem kaydet
      const transaction: Transaction = {
        id: generateUniqueId(),
        amount: expenseData.amount,
        type: 'expense',
        category: expenseData.category,
        description: expenseData.description || '',
        date
      };
      
      this.addTransaction(transaction);
      
      // Finansal durumu güncelle
      this.financialState.currentBalance -= expenseData.amount;
      this.financialState.totalExpenses += expenseData.amount;
      this.financialState.lastUpdated = new Date();
      
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
    
    // İşlem tipine göre finansal durumu güncelle
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
    } else if (transaction.type === 'income') {
      // Gelir işlemini geri al
      this.financialState.currentBalance -= transaction.amount;
    }
    
    // İşlemi işlem listesinden kaldır
    this.transactions.splice(transactionIndex, 1);
    
    // Finansal durum güncelleme 
    this.financialState.lastUpdated = new Date();
    
    return true;
  }

  /**
   * Bakiyeye para ekler veya çıkarır
   * Pozitif değer para ekler, negatif değer para çıkarır
   */
  addToBalance(amount: number, description: string = "Bakiye değişikliği"): boolean {
    try {
      // Bakiyeyi güncelle
      this.financialState.currentBalance += amount;
      this.financialState.lastUpdated = new Date();
      
      // İşlem tipini belirle
      const transactionType = amount >= 0 ? 'income' : 'expense';
      const category = amount >= 0 ? 'Gelir' : 'Tasarruf';
      
      this.addTransaction({
        id: generateUniqueId(),
        amount: Math.abs(amount), // İşlem tutarı her zaman pozitif
        type: transactionType,
        category: category,
        description,
        date: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Bakiye güncellenirken hata:', error);
      return false;
    }
  }

  /**
   * Finansal durumu günceller
   */
  updateFinancialState(newState: FinancialState): void {
    // Önemli: Bakiyenin negatif olmamasını sağla
    if (newState.currentBalance < 0) {
      console.error('Uyarı: Negatif bakiye önlendi. Bakiye 0 olarak ayarlandı.');
      newState.currentBalance = 0;
    }
    
    this.financialState = { ...newState };
  }

  /**
   * Yeni bir işlem ekler ve finansal durumu günceller
   */
  handleTransaction(transaction: Transaction): boolean {
    try {
      // İşlem tipine göre finansal durumu güncelle
      if (transaction.type === 'expense') {
        // Harcama işlemi - bakiyeden düş
        if (this.financialState.currentBalance < transaction.amount) {
          console.error('Yetersiz bakiye');
          return false;
        }
        
        this.financialState.currentBalance -= transaction.amount;
        this.financialState.totalExpenses += transaction.amount;
      } else if (transaction.type === 'income') {
        // Gelir işlemi - bakiyeye ekle
        this.financialState.currentBalance += transaction.amount;
      }
      
      // İşlemi kaydet
      this.addTransaction(transaction);
      
      // Finansal durumu güncelle
      this.financialState.lastUpdated = new Date();
      
      return true;
    } catch (error) {
      console.error('İşlem eklenirken hata:', error);
      return false;
    }
  }
} 