import { 
  Expense, 
  SavingsGoal, 
  FinancialState, 
  Transaction 
} from '../models/types';
import {
  ValidationResult,
  validateExpense,
  validateSavingsGoal,
  validateAddFundsToGoal,
  validateWithdrawFundsFromGoal,
  validatePositiveNumber,
  validateNonZero,
  validateDate,
  validateFutureDate,
  validateRequiredField,
  validResult,
  invalidResult
} from '../models/validation';
import {
  calculateGoalProgress,
  calculateRemainingAmount,
  calculateEstimatedTimeToReachGoal,
  calculateOverallProgress,
  groupExpensesByCategory,
  calculateCategoryPercentages,
  getExpenseAnalysisByPeriod,
  getTopExpenseCategories
} from '../models/utils';

/**
 * CalculationService - Hesaplama mantığını UI'dan ayıran servis
 * Bu servis, hesaplama ve validasyon işlemlerini gerçekleştirir
 */
export class CalculationService {
  /**
   * Harcama verilerini validate eder
   */
  validateExpenseData(expenseData: Omit<Expense, 'id' | 'date'> & { date?: Date }, currentBalance: number): ValidationResult {
    return validateExpense(expenseData, currentBalance);
  }

  /**
   * Tasarruf hedefi verilerini validate eder
   */
  validateSavingsGoalData(goalData: Omit<SavingsGoal, 'id' | 'currentAmount' | 'createdAt'>): ValidationResult {
    return validateSavingsGoal(goalData);
  }

  /**
   * Hedefe para ekleme işlemini validate eder
   */
  validateAddFunds(amount: number, currentBalance: number): ValidationResult {
    return validateAddFundsToGoal(amount, currentBalance);
  }

  /**
   * Hedeften para çekme işlemini validate eder
   */
  validateWithdrawFunds(amount: number, goalCurrentAmount: number): ValidationResult {
    return validateWithdrawFundsFromGoal(amount, goalCurrentAmount);
  }

  /**
   * Sayının pozitif olup olmadığını kontrol eder
   */
  validatePositiveValue(value: number, fieldName: string): ValidationResult {
    return validatePositiveNumber(value, fieldName);
  }

  /**
   * Sayının sıfırdan farklı olduğunu kontrol eder
   */
  validateNonZeroValue(value: number, fieldName: string): ValidationResult {
    return validateNonZero(value, fieldName);
  }

  /**
   * Hedef ilerleme durumunu hesaplar
   */
  calculateGoalProgress(goal: SavingsGoal): number {
    if (!goal || goal.targetAmount <= 0) {
      return 0;
    }
    
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  }

  /**
   * Hedefe ulaşmak için kalan tutarı hesaplar
   */
  calculateRemainingAmount(goal: SavingsGoal): number {
    if (!goal || goal.targetAmount <= 0) {
      return 0;
    }
    
    return Math.max(0, goal.targetAmount - goal.currentAmount);
  }

  /**
   * Hedefe ulaşma süresini hesaplar (ay olarak)
   */
  calculateEstimatedTime(goal: SavingsGoal, monthlyContribution: number): number {
    if (!goal || goal.targetAmount <= 0 || monthlyContribution <= 0) {
      return 0;
    }
    
    if (goal.currentAmount >= goal.targetAmount) {
      return 0; // Hedef zaten tamamlanmış
    }
    
    return calculateEstimatedTimeToReachGoal(goal, monthlyContribution);
  }

  /**
   * Tüm tasarruf hedeflerinin toplam ilerleme durumunu hesaplar
   */
  calculateOverallSavingsProgress(savingsGoals: SavingsGoal[]): number {
    return calculateOverallProgress(savingsGoals);
  }

  /**
   * Kategorilere göre harcama toplamlarını hesaplar
   */
  getCategoryTotals(expenses: Expense[]): Record<string, number> {
    return groupExpensesByCategory(expenses);
  }

  /**
   * Kategorilere göre harcama yüzdelerini hesaplar
   */
  getCategoryPercentages(expenses: Expense[]): Record<string, number> {
    return calculateCategoryPercentages(expenses);
  }

  /**
   * Belirli bir zaman aralığına göre harcama analizini hesaplar
   */
  getExpenseAnalysisByPeriod(expenses: Expense[], period: 'weekly' | 'monthly' | 'yearly'): Record<string, number> {
    return getExpenseAnalysisByPeriod(expenses, period);
  }

  /**
   * En çok harcama yapılan kategorileri döndürür
   */
  getTopSpendingCategories(expenses: Expense[], count: number = 5): Array<{category: string, amount: number}> {
    return getTopExpenseCategories(expenses, count);
  }

  /**
   * Finansal özet bilgilerini hesaplar
   */
  calculateFinancialSummary(financialState: FinancialState, savingsGoals: SavingsGoal[]): {
    balance: number;
    totalExpenses: number;
    totalSavings: number;
    savingsPercentage: number;
    goalCount: number;
  } {
    const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalIncome = financialState.currentBalance + financialState.totalExpenses + totalSavings;
    
    return {
      balance: financialState.currentBalance,
      totalExpenses: financialState.totalExpenses,
      totalSavings,
      savingsPercentage: totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0,
      goalCount: savingsGoals.length
    };
  }
}

// Singleton olarak kullanılabilmesi için bir örnek oluşturup dışa aktaralım
export const calculationService = new CalculationService(); 