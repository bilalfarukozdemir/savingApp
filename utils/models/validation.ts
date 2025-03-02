import { Expense, SavingsGoal, Transaction } from './types';

/**
 * ValidasyonSonucu - Validasyon işleminin sonucunu temsil eder
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Başarılı validasyon sonucu döndürür
 */
export const validResult = (): ValidationResult => ({
  isValid: true
});

/**
 * Hata mesajıyla birlikte başarısız validasyon sonucu döndürür
 */
export const invalidResult = (errorMessage: string): ValidationResult => ({
  isValid: false,
  errorMessage
});

/**
 * Sayının pozitif olup olmadığını kontrol eder
 */
export const validatePositiveNumber = (value: number, fieldName: string): ValidationResult => {
  if (value <= 0) {
    return invalidResult(`${fieldName} sıfırdan büyük olmalıdır`);
  }
  return validResult();
};

/**
 * Girilen tutar için kullanılabilir bakiye olup olmadığını kontrol eder
 */
export const validateSufficientBalance = (amount: number, currentBalance: number): ValidationResult => {
  if (currentBalance < amount) {
    return invalidResult(`Yetersiz bakiye. Mevcut bakiye: ${currentBalance}`);
  }
  return validResult();
};

/**
 * Sayının sıfır olmadığını kontrol eder (sıfıra bölünme hatası için)
 */
export const validateNonZero = (value: number, fieldName: string): ValidationResult => {
  if (value === 0) {
    return invalidResult(`${fieldName} sıfır olamaz`);
  }
  return validResult();
};

/**
 * Tarih değerinin geçerli olup olmadığını kontrol eder
 */
export const validateDate = (date: Date | undefined, fieldName: string): ValidationResult => {
  if (!date) {
    return invalidResult(`${fieldName} geçerli bir tarih olmalıdır`);
  }
  
  const dateValue = new Date(date);
  if (isNaN(dateValue.getTime())) {
    return invalidResult(`${fieldName} geçerli bir tarih formatında olmalıdır`);
  }
  
  return validResult();
};

/**
 * Tarih değerinin gelecekte olup olmadığını kontrol eder
 */
export const validateFutureDate = (date: Date | undefined, fieldName: string): ValidationResult => {
  const dateValidation = validateDate(date, fieldName);
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(date!);
  targetDate.setHours(0, 0, 0, 0);
  
  if (targetDate <= now) {
    return invalidResult(`${fieldName} gelecekte bir tarih olmalıdır`);
  }
  
  return validResult();
};

/**
 * Metin alanının boş olup olmadığını kontrol eder
 */
export const validateRequiredField = (value: string | undefined, fieldName: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return invalidResult(`${fieldName} boş bırakılamaz`);
  }
  return validResult();
};

/**
 * Harcama verisinin geçerli olup olmadığını kontrol eder
 */
export const validateExpense = (
  expenseData: Omit<Expense, 'id' | 'date'> & { date?: Date },
  currentBalance: number
): ValidationResult => {
  // Tutar pozitif olmalı
  const amountValidation = validatePositiveNumber(expenseData.amount, 'Harcama tutarı');
  if (!amountValidation.isValid) {
    return amountValidation;
  }
  
  // Yeterli bakiye kontrolü
  const balanceValidation = validateSufficientBalance(expenseData.amount, currentBalance);
  if (!balanceValidation.isValid) {
    return balanceValidation;
  }
  
  // Kategori boş olmamalı
  const categoryValidation = validateRequiredField(expenseData.category, 'Kategori');
  if (!categoryValidation.isValid) {
    return categoryValidation;
  }
  
  // Tarih kontrolü (tarih belirtildiyse)
  if (expenseData.date) {
    const dateValidation = validateDate(expenseData.date, 'Tarih');
    if (!dateValidation.isValid) {
      return dateValidation;
    }
  }
  
  return validResult();
};

/**
 * Tasarruf hedefi verisinin geçerli olup olmadığını kontrol eder
 */
export const validateSavingsGoal = (
  goalData: Omit<SavingsGoal, 'id' | 'currentAmount' | 'createdAt'>
): ValidationResult => {
  // Hedef adı boş olmamalı
  const nameValidation = validateRequiredField(goalData.name, 'Hedef adı');
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  // Hedef tutar pozitif olmalı
  const amountValidation = validatePositiveNumber(goalData.targetAmount, 'Hedef tutar');
  if (!amountValidation.isValid) {
    return amountValidation;
  }
  
  // Hedef tarihi belirtildiyse, gelecekte olmalı
  if (goalData.targetDate) {
    const dateValidation = validateFutureDate(goalData.targetDate, 'Hedef tarihi');
    if (!dateValidation.isValid) {
      return dateValidation;
    }
  }
  
  return validResult();
};

/**
 * Hedefe para ekleme işleminin geçerli olup olmadığını kontrol eder
 */
export const validateAddFundsToGoal = (
  amount: number,
  currentBalance: number
): ValidationResult => {
  // Miktar pozitif olmalı
  const amountValidation = validatePositiveNumber(amount, 'Eklenecek miktar');
  if (!amountValidation.isValid) {
    return amountValidation;
  }
  
  // Yeterli bakiye kontrolü
  const balanceValidation = validateSufficientBalance(amount, currentBalance);
  if (!balanceValidation.isValid) {
    return balanceValidation;
  }
  
  return validResult();
};

/**
 * Hedeften para çekme işleminin geçerli olup olmadığını kontrol eder
 */
export const validateWithdrawFundsFromGoal = (
  amount: number,
  goalCurrentAmount: number
): ValidationResult => {
  // Miktar pozitif olmalı
  const amountValidation = validatePositiveNumber(amount, 'Çekilecek miktar');
  if (!amountValidation.isValid) {
    return amountValidation;
  }
  
  // Hedefte yeterli miktar olmalı
  if (goalCurrentAmount < amount) {
    return invalidResult(`Hedefte yeterli miktar bulunmuyor. Mevcut: ${goalCurrentAmount}`);
  }
  
  return validResult();
}; 