/**
 * Expense model - Harcama veri modeli
 */
export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
}

/**
 * Savings Goal model - Tasarruf hedefi veri modeli 
 */
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category?: string;
  color: string;
  targetDate?: Date;
  createdAt: Date;
  deductFromBalance?: boolean; // Başlangıç tutarının mevcut bakiyeden düşülüp düşülmeyeceği
}

/**
 * Transaction model - İşlem veri modeli
 */
export interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  category: string;
  description: string; 
  date: Date;
  relatedGoalId?: string; // İlgili tasarruf hedefi (varsa)
}

/**
 * User Financial State - Kullanıcı finansal durumu
 */
export interface FinancialState {
  currentBalance: number;
  totalExpenses: number;
  totalSavings: number;
  lastUpdated: Date;
}

/**
 * Budget model - Bütçe veri modeli
 */
export interface Budget {
  id: string;
  category: string;
  limit: number;
  currentAmount: number;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
} 