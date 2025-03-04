import { SavingsGoal, Expense, Transaction, Budget } from './types';

/**
 * Tasarruf hedefi için ilerleme yüzdesini hesaplar
 */
export const calculateGoalProgress = (goal: SavingsGoal): number => {
  if (goal.targetAmount <= 0) return 0;
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  return Math.min(Math.max(progress, 0), 100); // 0-100 arasında sınırlandır
};

/**
 * Bir varlık için kalan gün sayısını hesaplar
 */
export const calculateRemainingDays = (targetDate: Date | undefined): number => {
  if (!targetDate) return Infinity;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(diffDays, 0);
};

/**
 * Hedefe ulaşmak için gereken günlük tasarruf miktarını hesaplar
 */
export const calculateDailyAmount = (goal: SavingsGoal): number => {
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  if (remainingAmount <= 0) return 0;
  
  const remainingDays = calculateRemainingDays(goal.targetDate);
  if (remainingDays <= 0 || remainingDays === Infinity) return remainingAmount;
  
  return remainingAmount / remainingDays;
};

/**
 * Benzersiz ID oluşturur
 */
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

/**
 * Tarih formatını yerelleştirir
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Bütçe kullanım yüzdesini hesaplar
 */
export const calculateBudgetUsage = (budget: Budget): number => {
  if (budget.limit <= 0) return 0;
  const usage = (budget.currentAmount / budget.limit) * 100;
  return Math.min(Math.max(usage, 0), 100);
};

/**
 * Miktarları para birimi formatına dönüştürür
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};

/**
 * Harcama kategorisine göre gruplandırma
 */
export const groupExpensesByCategory = (expenses: Expense[]): Record<string, number> => {
  return expenses.reduce((acc, expense) => {
    const { category, amount } = expense;
    // Hata kontrolü: Negatif değerlere karşı koruma
    const validAmount = amount > 0 ? amount : 0;
    acc[category] = (acc[category] || 0) + validAmount;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * İşlem tarihini doğrulama
 */
export const validateTransactionDate = (date: Date): boolean => {
  const now = new Date();
  return date <= now; // Gelecek tarihli işlemlere izin verilmez
};

/**
 * Hedefe ulaşmak için kalan miktarı hesaplar
 */
export const calculateRemainingAmount = (goal: SavingsGoal): number => {
  return Math.max(goal.targetAmount - goal.currentAmount, 0);
};

/**
 * Tasarruf hedefine ulaşmak için gereken tahmini süreyi hesaplar 
 * (Aylık ortalama birikim hızına göre)
 */
export const calculateEstimatedTimeToReachGoal = (
  goal: SavingsGoal, 
  monthlyContribution: number
): number => {
  // Hata kontrolü
  if (monthlyContribution <= 0) {
    return Infinity; // Sonsuz süre
  }
  
  const remainingAmount = calculateRemainingAmount(goal);
  if (remainingAmount <= 0) {
    return 0; // Hedefe ulaşılmış
  }
  
  // Kalan ay sayısını hesapla
  return Math.ceil(remainingAmount / monthlyContribution);
};

/**
 * Tüm hedeflerin toplam ilerleme yüzdesini hesaplar
 */
export const calculateOverallProgress = (goals: SavingsGoal[]): number => {
  if (goals.length === 0) return 0;
  
  const totalTargetAmount = goals.reduce((total, goal) => total + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((total, goal) => total + goal.currentAmount, 0);
  
  // Hata kontrolü
  if (totalTargetAmount <= 0) return 0;
  
  return Math.min((totalCurrentAmount / totalTargetAmount) * 100, 100);
};

/**
 * Kategori bazlı harcama yüzdelerini hesaplar
 */
export const calculateCategoryPercentages = (expenses: Expense[]): Record<string, number> => {
  const categoryTotals = groupExpensesByCategory(expenses);
  const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  
  // Hata kontrolü
  if (totalExpenses <= 0) return {};
  
  // Her kategori için yüzdeyi hesapla
  const percentages: Record<string, number> = {};
  
  for (const [category, amount] of Object.entries(categoryTotals)) {
    percentages[category] = (amount / totalExpenses) * 100;
  }
  
  return percentages;
};

/**
 * Belirli bir tarih aralığındaki harcamaları filtreler
 */
export const filterExpensesByDateRange = (
  expenses: Expense[], 
  startDate: Date, 
  endDate: Date
): Expense[] => {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
};

/**
 * Belirli zaman dilimleri için harcama analizleri oluşturur (haftalık, aylık, yıllık)
 */
export const getExpenseAnalysisByPeriod = (
  expenses: Expense[],
  period: 'weekly' | 'monthly' | 'yearly'
): Record<string, number> => {
  const now = new Date();
  let startDate: Date;
  
  // Dönem başlangıç tarihini belirle
  switch (period) {
    case 'weekly':
      // Son 7 gün
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      // Son 30 gün
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      break;
    case 'yearly':
      // Son 365 gün
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 365);
      break;
  }
  
  // Dönem içindeki harcamaları filtrele
  const filteredExpenses = filterExpensesByDateRange(expenses, startDate, now);
  
  // Kategori bazlı toplamları hesapla
  return groupExpensesByCategory(filteredExpenses);
};

/**
 * En çok harcama yapılan 'n' kategoriyi döndürür
 */
export const getTopExpenseCategories = (
  expenses: Expense[], 
  count: number = 5
): {category: string, amount: number}[] => {
  const categoryTotals = groupExpensesByCategory(expenses);
  
  // Kategorileri harcama miktarına göre sırala
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, amountA], [, amountB]) => amountB - amountA)
    .slice(0, count)
    .map(([category, amount]) => ({ category, amount }));
  
  return sortedCategories;
}; 