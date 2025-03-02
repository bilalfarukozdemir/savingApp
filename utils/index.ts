// Models
export * from './models/types';
export * from './models/utils';
export * from './models/validation';

// Services
export { ExpenseService } from './services/expenseService';
export { SavingsService } from './services/savingsService';
export { FinanceManager } from './services/financeManager';
export { calculationService, CalculationService } from './services/calculationService';

// Singleton FinanceManager örneği (uygulamanın herhangi bir yerinde kullanılabilir)
import { FinanceManager } from './services/financeManager';
export const financeManager = FinanceManager.getInstance(0); // 0 TL ile başlatılıyor, değiştirilebilir 