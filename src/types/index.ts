export interface Roommate {
  id: string;
  name: string;
  income: number;
  roomSize?: number; // Optional square footage
  adjustments?: RoomAdjustments;
}

export interface RoomAdjustments {
  hasPrivateBathroom: boolean;
  privateBathroomPercentage?: number; // Default: 15%
  hasWindow: boolean;
  noWindowPercentage?: number; // Default: -10%
  hasFlexWall: boolean; // Flex wall instead of permanent wall
  flexWallPercentage?: number; // Default: -5%
  adjustmentPercentage?: number; // Additional custom adjustment percentage (-50 to +50)
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
  adjustmentAmount: number;
  totalShare: number;
}

export interface CalculationData {
  totalRent: number;
  utilities: number;
  customExpenses: CustomExpense[];
  roommates: Roommate[];
  currency?: string;
  useRoomSizeSplit?: boolean;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}
