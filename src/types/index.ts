export interface Roommate {
  id: string;
  name: string;
  income: number;
  roomSize?: number; // Optional square footage
}

export interface CustomExpense {
  id: string;
  name: string;
  amount: number;
}

export interface RentCalculation {
  id: string;
  totalRent: number;
  utilities: number;
  customExpenses: CustomExpense[];
  roommates: Roommate[];
  createdAt: Date;
}

export interface SplitResult {
  roommateId: string;
  roommateName: string;
  income: number;
  incomePercentage: number;
  rentShare: number;
  utilitiesShare: number;
  customExpensesShare: number;
  totalShare: number;
}

export interface CalculationData {
  totalRent: number;
  utilities: number;
  customExpenses: CustomExpense[];
  roommates: Roommate[];
  currency?: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}
