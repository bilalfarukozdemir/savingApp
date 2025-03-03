import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  financeManager, 
  Expense, 
  SavingsGoal, 
  Transaction, 
  FinancialState,
  calculateGoalProgress,
  calculateRemainingAmount as calculateGoalRemainingAmount,
  calculateEstimatedTimeToReachGoal,
  calculateOverallProgress,
  groupExpensesByCategory,
  calculateCategoryPercentages,
  getExpenseAnalysisByPeriod,
  getTopExpenseCategories
} from '@/utils';
import {
  ValidationResult,
  validateExpense,
  validateSavingsGoal,
  validateAddFundsToGoal,
  validateWithdrawFundsFromGoal,
  validatePositiveNumber,
  validateNonZero
} from '@/utils/models/validation';
import { calculationService } from '@/utils/services/calculationService';

// Kullanıcı bilgileri için arayüz
interface UserProfile {
  name: string;
  age: number;
  monthlyIncome: number;
  incomeDay: number; // Gelirin ekleneceği gün (1-31)
  isOnboardingCompleted: boolean;
  hasSeenData: {
    expenses: boolean;
    savings: boolean;
    transactions: boolean;
    dashboard: boolean;
  };
}

// Context tipi tanımı
interface FinanceContextType {
  // State değerleri
  financialState: FinancialState;
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  recentTransactions: Transaction[];
  userProfile: UserProfile | null;
  
  // Modal yönetimi
  isExpenseModalVisible: boolean;  // Yeni: Harcama ekleme modalının görünürlüğü
  showExpenseModal: () => void;    // Yeni: Harcama ekleme modalını göster
  hideExpenseModal: () => void;    // Yeni: Harcama ekleme modalını gizle
  
  // Veri gösterim kontrolleri
  hasExpensesData: () => boolean;
  hasSavingsData: () => boolean;
  hasTransactionsData: () => boolean;
  markDataAsSeen: (dataType: 'expenses' | 'savings' | 'transactions' | 'dashboard') => void;
  
  // Hata yönetimi
  error: string | null;
  clearError: () => void;
  
  // Kullanıcı profili işlemleri
  setUserProfile: (userData: UserProfile) => void;
  completeOnboarding: () => void;
  
  // Harcama işlemleri
  addExpense: (expenseData: Omit<Expense, 'id' | 'date'> & { date?: Date }) => Expense | null;
  removeExpense: (expenseId: string) => boolean;
  
  // Bakiye işlemleri
  addToBalance: (amount: number, description?: string) => boolean;
  
  // Tasarruf hedefi işlemleri
  addSavingsGoal: (goalData: Omit<SavingsGoal, 'id' | 'createdAt'>) => SavingsGoal | null;
  updateSavingsGoal: (goalId: string, updates: Partial<Omit<SavingsGoal, 'id' | 'createdAt'>>) => boolean;
  removeSavingsGoal: (goalId: string) => boolean;
  addFundsToGoal: (goalId: string, amount: number, description?: string) => boolean;
  withdrawFundsFromGoal: (goalId: string, amount: number, description?: string) => boolean;
  calculateGoalProgress: (goalId: string) => number;
  
  // İşlem işlemleri
  undoTransaction: (transactionId: string) => boolean;
  getGoalTransactions: (goalId: string) => Transaction[];
  
  // Özet bilgiler
  getFinancialSummary: () => {
    balance: number;
    totalExpenses: number;
    totalSavings: number;
    savingsPercentage: number;
    goalCount: number;
  };
  
  // Tasarruf analizi için yeni fonksiyonlar
  calculateRemainingAmount: (goalId: string) => number;
  calculateEstimatedTime: (goalId: string, monthlyContribution: number) => number;
  calculateOverallSavingsProgress: () => number;
  
  // Harcama analizi için yeni fonksiyonlar
  getCategoryTotals: () => Record<string, number>;
  getCategoryPercentages: () => Record<string, number>;
  getWeeklyExpenseAnalysis: () => Record<string, number>;
  getMonthlyExpenseAnalysis: () => Record<string, number>;
  getYearlyExpenseAnalysis: () => Record<string, number>;
  getTopSpendingCategories: (count?: number) => Array<{category: string, amount: number}>;
}

// Context'i oluştur
const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Context Provider bileşeni
export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State'leri tanımla
  const [financialState, setFinancialState] = useState<FinancialState>(financeManager.getFinancialState());
  const [expenses, setExpenses] = useState<Expense[]>(financeManager.getAllExpenses());
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(financeManager.getAllSavingsGoals());
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(financeManager.getRecentTransactions());
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Yeni state: Harcama ekleme modalının görünürlüğü
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState<boolean>(false);
  
  // LocalStorage'dan kullanıcı profilini yükle
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem('userProfile');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          // Eğer hasSeenData yoksa, ekle
          if (!parsed.hasSeenData) {
            parsed.hasSeenData = {
              expenses: false,
              savings: false,
              transactions: false,
              dashboard: false
            };
          }
          setUserProfileState(parsed);
        }
      } catch (e) {
        console.error('Kullanıcı profili yüklenemedi:', e);
      }
    };
    
    loadUserProfile();
  }, []);
  
  // Analiz state'leri - boş değerlerle başlatılıyor
  const [categoryAnalysis, setCategoryAnalysis] = useState<Record<string, number>>({});
  const [savingsAnalysis, setSavingsAnalysis] = useState({
    overallProgress: 0
  });
  
  // Hata yönetimi fonksiyonları
  const clearError = () => setError(null);
  
  const handleValidationResult = (result: ValidationResult): boolean => {
    if (!result.isValid && result.errorMessage) {
      setError(result.errorMessage);
      return false;
    }
    return true;
  };
  
  // Kullanıcı profili işlemleri
  const setUserProfile = async (userData: UserProfile) => {
    // hasSeenData değeri yoksa varsayılan olarak tümü false olarak ayarla
    const updatedUserData = {
      ...userData,
      hasSeenData: userData.hasSeenData || {
        expenses: false,
        savings: false,
        transactions: false,
        dashboard: false
      }
    };
    
    setUserProfileState(updatedUserData);
    // AsyncStorage'a kaydet
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUserData));
    } catch (e) {
      console.error('Kullanıcı profili kaydedilemedi:', e);
    }
  };
  
  const completeOnboarding = () => {
    if (userProfile) {
      setUserProfileState({
        ...userProfile,
        isOnboardingCompleted: true
      });
      // localStorage veya AsyncStorage'a kaydetme işlemleri burada yapılabilir
    }
  };
  
  // Kategori Toplamlarını Getir
  const getCategoryTotals = (): Record<string, number> => {
    try {
      return calculationService.getCategoryTotals(expenses);
    } catch (err) {
      setError("Kategori toplamları hesaplanırken bir hata oluştu");
      return {};
    }
  };
  
  // Kategori Yüzdelerini Hesapla
  const getCategoryPercentages = (): Record<string, number> => {
    try {
      return calculationService.getCategoryPercentages(expenses);
    } catch (err) {
      setError("Kategori yüzdeleri hesaplanırken bir hata oluştu");
      return {};
    }
  };
  
  // Haftalık Harcama Analizi
  const getWeeklyExpenseAnalysis = (): Record<string, number> => {
    try {
      return calculationService.getExpenseAnalysisByPeriod(expenses, 'weekly');
    } catch (err) {
      setError("Haftalık harcama analizi yapılırken bir hata oluştu");
      return {};
    }
  };
  
  // Aylık Harcama Analizi
  const getMonthlyExpenseAnalysis = (): Record<string, number> => {
    try {
      return calculationService.getExpenseAnalysisByPeriod(expenses, 'monthly');
    } catch (err) {
      setError("Aylık harcama analizi yapılırken bir hata oluştu");
      return {};
    }
  };
  
  // Yıllık Harcama Analizi
  const getYearlyExpenseAnalysis = (): Record<string, number> => {
    try {
      return calculationService.getExpenseAnalysisByPeriod(expenses, 'yearly');
    } catch (err) {
      setError("Yıllık harcama analizi yapılırken bir hata oluştu");
      return {};
    }
  };
  
  // En Çok Harcama Yapılan Kategorileri Getir
  const getTopSpendingCategories = (count: number = 5): Array<{category: string, amount: number}> => {
    try {
      return calculationService.getTopSpendingCategories(expenses, count);
    } catch (err) {
      setError("En çok harcama yapılan kategoriler hesaplanırken bir hata oluştu");
      return [];
    }
  };
  
  // Toplam Tasarruf İlerlemesini Hesapla
  const calculateOverallSavingsProgress = (): number => {
    try {
      return calculationService.calculateOverallSavingsProgress(savingsGoals);
    } catch (err) {
      setError("Toplam tasarruf ilerlemesi hesaplanırken bir hata oluştu");
      return 0;
    }
  };
  
  // State'leri güncelleme fonksiyonu
  const refreshData = () => {
    try {
      setFinancialState(financeManager.getFinancialState());
      setExpenses(financeManager.getAllExpenses());
      setSavingsGoals(financeManager.getAllSavingsGoals());
      setRecentTransactions(financeManager.getRecentTransactions());
      
      // Analizleri de güncelle
      setCategoryAnalysis(getCategoryTotals());
      setSavingsAnalysis({
        overallProgress: calculateOverallSavingsProgress()
      });
    } catch (err) {
      setError("Veriler güncellenirken bir hata oluştu");
    }
  };
  
  // Veri güncellendiğinde analizleri otomatik güncelle
  useEffect(() => {
    refreshData();
  }, []); // Component mount edildiğinde bir kez çalışır
  
  // Expenses veya SavingsGoals değiştiğinde analizleri güncelle
  useEffect(() => {
    try {
      setCategoryAnalysis(getCategoryTotals());
    } catch (err) {
      setError("Kategori analizi güncellenirken bir hata oluştu");
    }
  }, [expenses]);
  
  useEffect(() => {
    try {
      setSavingsAnalysis({
        overallProgress: calculateOverallSavingsProgress()
      });
    } catch (err) {
      setError("Tasarruf analizi güncellenirken bir hata oluştu");
    }
  }, [savingsGoals]);
  
  // Harcama Ekle
  const addExpense = (expenseData: Omit<Expense, 'id' | 'date'> & { date?: Date }): Expense | null => {
    clearError();
    
    // Validasyon - hesaplama servisini kullan
    const validation = calculationService.validateExpenseData(expenseData, financialState.currentBalance);
    if (!handleValidationResult(validation)) {
      return null;
    }
    
    try {
      const result = financeManager.addExpense(expenseData);
      refreshData();
      
      // Harcama eklendiğinde otomatik olarak görünür yap
      if (userProfile && !userProfile.hasSeenData.expenses) {
        markDataAsSeen('expenses');
      }
      
      return result;
    } catch (err) {
      setError("Harcama eklenirken bir hata oluştu");
      return null;
    }
  };
  
  // Harcama Sil
  const removeExpense = (expenseId: string): boolean => {
    clearError();
    
    if (!expenseId) {
      setError("Geçerli bir harcama IDsi belirtilmedi");
      return false;
    }
    
    try {
      const result = financeManager.removeExpense(expenseId);
      if (!result) {
        setError("Belirtilen ID ile bir harcama bulunamadı");
        return false;
      }
      refreshData();
      return result;
    } catch (err) {
      setError("Harcama silinirken bir hata oluştu");
      return false;
    }
  };
  
  // Tasarruf Hedefi Ekle
  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id' | 'createdAt'>): SavingsGoal | null => {
    clearError();
    
    // Validasyon
    const validation = calculationService.validateSavingsGoalData(goalData);
    if (!handleValidationResult(validation)) {
      return null;
    }
    
    try {
      const result = financeManager.addSavingsGoal(goalData);
      refreshData();
      
      // Tasarruf hedefi eklendiğinde otomatik olarak görünür yap
      if (userProfile && !userProfile.hasSeenData.savings) {
        markDataAsSeen('savings');
      }
      
      return result;
    } catch (err) {
      setError("Tasarruf hedefi eklenirken bir hata oluştu");
      return null;
    }
  };
  
  // Tasarruf Hedefi Güncelle
  const updateSavingsGoal = (goalId: string, updates: Partial<Omit<SavingsGoal, 'id' | 'createdAt'>>): boolean => {
    clearError();
    
    if (!goalId) {
      setError("Geçerli bir hedef IDsi belirtilmedi");
      return false;
    }
    
    // Hedefin var olduğunu kontrol et
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) {
      setError("Belirtilen ID ile bir tasarruf hedefi bulunamadı");
      return false;
    }
    
    // Validasyon kontrolü
    if (updates.targetAmount !== undefined) {
      const targetAmountValidation = calculationService.validatePositiveValue(updates.targetAmount, 'Hedef tutar');
      if (!handleValidationResult(targetAmountValidation)) {
        return false;
      }
    }
    
    try {
      const result = financeManager.updateSavingsGoal(goalId, updates);
      refreshData();
      return result;
    } catch (err) {
      setError("Tasarruf hedefi güncellenirken bir hata oluştu");
      return false;
    }
  };
  
  // Tasarruf Hedefi Sil
  const removeSavingsGoal = (goalId: string): boolean => {
    clearError();
    
    if (!goalId) {
      setError("Geçerli bir hedef IDsi belirtilmedi");
      return false;
    }
    
    try {
      const result = financeManager.removeSavingsGoal(goalId);
      if (!result) {
        setError("Belirtilen ID ile bir tasarruf hedefi bulunamadı");
        return false;
      }
      refreshData();
      return result;
    } catch (err) {
      setError("Tasarruf hedefi silinirken bir hata oluştu");
      return false;
    }
  };
  
  // Hedefe Para Ekle
  const addFundsToGoal = (goalId: string, amount: number, description?: string): boolean => {
    clearError();
    
    if (!goalId) {
      setError("Geçerli bir hedef IDsi belirtilmedi");
      return false;
    }
    
    // Hedefin var olduğunu kontrol et
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) {
      setError("Belirtilen ID ile bir tasarruf hedefi bulunamadı");
      return false;
    }
    
    // Bakiye kontrolü
    if (financialState.currentBalance < amount) {
      setError(`Yetersiz bakiye. Mevcut bakiyeniz: ₺${financialState.currentBalance}`);
      return false;
    }
    
    // Validasyon
    const validation = calculationService.validateAddFunds(amount, financialState.currentBalance);
    if (!handleValidationResult(validation)) {
      return false;
    }
    
    try {
      const result = financeManager.addFundsToGoal(goalId, amount, description);
      if (!result) {
        setError("Tasarruf hedefine para eklenemedi. Lütfen bakiyenizi kontrol edin.");
        return false;
      }
      refreshData();
      
      // İşlem eklendiğinde otomatik olarak görünür yap
      if (userProfile && !userProfile.hasSeenData.transactions) {
        markDataAsSeen('transactions');
      }
      
      // Tasarruf hedefine para eklendiğinde tasarrufları da görünür yap
      if (userProfile && !userProfile.hasSeenData.savings) {
        markDataAsSeen('savings');
      }
      
      return result;
    } catch (err) {
      setError("Tasarruf hedefine para eklenirken bir hata oluştu");
      return false;
    }
  };
  
  // Hedeften Para Çek
  const withdrawFundsFromGoal = (goalId: string, amount: number, description?: string): boolean => {
    clearError();
    
    if (!goalId) {
      setError("Geçerli bir hedef IDsi belirtilmedi");
      return false;
    }
    
    // Validasyon
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) {
      setError("Belirtilen ID ile bir tasarruf hedefi bulunamadı");
      return false;
    }
    
    // Hedefte yeterli miktar olup olmadığını kontrol et
    if (goal.currentAmount < amount) {
      setError(`Hedefte yeterli miktar bulunmuyor. Mevcut miktar: ₺${goal.currentAmount.toLocaleString()}, çekilmek istenen: ₺${amount.toLocaleString()}`);
      return false;
    }
    
    const validation = calculationService.validateWithdrawFunds(amount, goal.currentAmount);
    if (!handleValidationResult(validation)) {
      return false;
    }
    
    try {
      const result = financeManager.withdrawFundsFromGoal(goalId, amount, description);
      if (!result) {
        setError("Tasarruf hedefinden para çekilemedi, lütfen tekrar deneyin");
        return false;
      }
      refreshData();
      
      // İşlem eklendiğinde otomatik olarak görünür yap
      if (userProfile && !userProfile.hasSeenData.transactions) {
        markDataAsSeen('transactions');
      }
      
      return result;
    } catch (err) {
      setError("Tasarruf hedefinden para çekilirken bir hata oluştu");
      return false;
    }
  };
  
  // Bakiyeye Para Ekle
  const addToBalance = (amount: number, description?: string): boolean => {
    clearError();
    
    // Validasyon
    const validation = calculationService.validatePositiveValue(amount, 'Eklenecek miktar');
    if (!handleValidationResult(validation)) {
      return false;
    }
    
    try {
      const result = financeManager.addToBalance(amount, description);
      refreshData();
      
      // İşlem eklendiğinde otomatik olarak görünür yap
      if (userProfile && !userProfile.hasSeenData.transactions) {
        markDataAsSeen('transactions');
      }
      
      return result;
    } catch (err) {
      setError("Bakiyeye para eklenirken bir hata oluştu");
      return false;
    }
  };
  
  // Hedef İlerlemesi Hesapla
  const calculateGoalProgress = (goalId: string): number => {
    try {
      const goal = savingsGoals.find(g => g.id === goalId);
      if (!goal) {
        setError("Belirtilen ID ile bir tasarruf hedefi bulunamadı");
        return 0;
      }
      
      if (goal.targetAmount <= 0) {
        setError("Hedef tutar sıfır veya daha küçük olamaz");
        return 0;
      }
      
      return calculationService.calculateGoalProgress(goal);
    } catch (err) {
      setError("Hedef ilerlemesi hesaplanırken bir hata oluştu");
      return 0;
    }
  };
  
  // İşlemi Geri Al
  const undoTransaction = (transactionId: string): boolean => {
    clearError();
    
    if (!transactionId) {
      setError("Geçerli bir işlem IDsi belirtilmedi");
      return false;
    }
    
    try {
      const result = financeManager.undoTransaction(transactionId);
      if (!result) {
        setError("Belirtilen ID ile bir işlem bulunamadı");
        return false;
      }
      refreshData();
      return result;
    } catch (err) {
      setError("İşlem geri alınırken bir hata oluştu");
      return false;
    }
  };
  
  // Finansal Özet Bilgileri
  const getFinancialSummary = () => {
    try {
      return calculationService.calculateFinancialSummary(financialState, savingsGoals);
    } catch (err) {
      setError("Finansal özet bilgileri alınırken bir hata oluştu");
      return {
        balance: 0,
        totalExpenses: 0,
        totalSavings: 0,
        savingsPercentage: 0,
        goalCount: 0
      };
    }
  };
  
  // Kalan Miktar Hesapla
  const calculateRemainingAmount = (goalId: string): number => {
    try {
      const goal = savingsGoals.find(g => g.id === goalId);
      if (!goal) {
        setError("Belirtilen ID ile bir tasarruf hedefi bulunamadı");
        return 0;
      }
      
      if (goal.targetAmount <= 0) {
        setError("Hedef tutar sıfır veya daha küçük olamaz");
        return 0;
      }
      
      return calculationService.calculateRemainingAmount(goal);
    } catch (err) {
      setError("Kalan miktar hesaplanırken bir hata oluştu");
      return 0;
    }
  };
  
  // Hedefe Ulaşma Süresini Hesapla
  const calculateEstimatedTime = (goalId: string, monthlyContribution: number): number => {
    clearError();
    
    // Aylık katkı miktarı pozitif olmalı
    const contributionValidation = calculationService.validatePositiveValue(monthlyContribution, 'Aylık katkı miktarı');
    if (!handleValidationResult(contributionValidation)) {
      return 0;
    }
    
    try {
      const goal = savingsGoals.find(g => g.id === goalId);
      if (!goal) {
        setError("Belirtilen ID ile bir tasarruf hedefi bulunamadı");
        return 0;
      }
      
      if (goal.targetAmount <= 0) {
        setError("Hedef tutar sıfır veya daha küçük olamaz");
        return 0;
      }
      
      if (goal.currentAmount >= goal.targetAmount) {
        return 0; // Hedef zaten tamamlanmış
      }
      
      return calculationService.calculateEstimatedTime(goal, monthlyContribution);
    } catch (err) {
      setError("Hedefe ulaşma süresi hesaplanırken bir hata oluştu");
      return 0;
    }
  };
  
  // İşlemi Geri Al
  const getGoalTransactions = (goalId: string): Transaction[] => {
    clearError();
    
    if (!goalId) {
      setError("Geçerli bir hedef IDsi belirtilmedi");
      return [];
    }
    
    try {
      return financeManager.getGoalTransactions(goalId);
    } catch (err) {
      setError("İşlem işlemleri alınırken bir hata oluştu");
      return [];
    }
  };
  
  // Veri görünürlük fonksiyonları
  const hasExpensesData = (): boolean => {
    // Veri varsa ve daha önce görüntülenmişse true döndür
    return expenses.length > 0 && (userProfile?.hasSeenData?.expenses || false);
  };
  
  const hasSavingsData = (): boolean => {
    // Veri varsa ve daha önce görüntülenmişse true döndür
    return savingsGoals.length > 0 && (userProfile?.hasSeenData?.savings || false);
  };
  
  const hasTransactionsData = (): boolean => {
    // Veri varsa ve daha önce görüntülenmişse true döndür
    return recentTransactions.length > 0 && (userProfile?.hasSeenData?.transactions || false);
  };
  
  const markDataAsSeen = async (dataType: 'expenses' | 'savings' | 'transactions' | 'dashboard'): Promise<void> => {
    if (!userProfile) return;
    
    const updatedProfile = {
      ...userProfile,
      hasSeenData: {
        ...userProfile.hasSeenData,
        [dataType]: true
      }
    };
    
    setUserProfileState(updatedProfile);
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    } catch (e) {
      console.error('Kullanıcı profili güncellenemedi:', e);
    }
  };
  
  // Yeni fonksiyonlar: Harcama ekleme modalının kontrolü
  const showExpenseModal = () => {
    setIsExpenseModalVisible(true);
  };

  const hideExpenseModal = () => {
    setIsExpenseModalVisible(false);
  };
  
  // Context değerini tanımla
  const value: FinanceContextType = {
    financialState,
    expenses,
    savingsGoals,
    recentTransactions,
    error,
    clearError,
    userProfile,
    setUserProfile,
    completeOnboarding,
    addExpense,
    removeExpense,
    addSavingsGoal,
    updateSavingsGoal,
    removeSavingsGoal,
    addFundsToGoal,
    withdrawFundsFromGoal,
    calculateGoalProgress,
    undoTransaction,
    getGoalTransactions,
    getFinancialSummary,
    calculateRemainingAmount,
    calculateEstimatedTime,
    calculateOverallSavingsProgress,
    getCategoryTotals,
    getCategoryPercentages,
    getWeeklyExpenseAnalysis,
    getMonthlyExpenseAnalysis,
    getYearlyExpenseAnalysis,
    getTopSpendingCategories,
    hasExpensesData,
    hasSavingsData,
    hasTransactionsData,
    markDataAsSeen,
    addToBalance,
    isExpenseModalVisible,
    showExpenseModal,
    hideExpenseModal,
  };
  
  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

// Context hook
export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}; 