import { Roommate, SplitResult, CalculationData } from '@/types';

export function calculateRentSplit(data: CalculationData): SplitResult[] {
  const { totalRent, utilities, customExpenses, roommates } = data;
  
  // Calculate total income
  const totalIncome = roommates.reduce((sum, roommate) => sum + roommate.income, 0);
  
  // Calculate utilities per person (split evenly)
  const utilitiesPerPerson = utilities / roommates.length;
  
  // Calculate custom expenses per person (split evenly)
  const totalCustomExpenses = customExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const customExpensesPerPerson = totalCustomExpenses / roommates.length;
  
  return roommates.map(roommate => {
    const incomePercentage = roommate.income / totalIncome;
    const rentShare = totalRent * incomePercentage;
    const totalShare = rentShare + utilitiesPerPerson + customExpensesPerPerson;
    
    return {
      roommateId: roommate.id,
      roommateName: roommate.name,
      income: roommate.income,
      incomePercentage: Math.round(incomePercentage * 100) / 100,
      rentShare: Math.round(rentShare * 100) / 100,
      utilitiesShare: Math.round(utilitiesPerPerson * 100) / 100,
      customExpensesShare: Math.round(customExpensesPerPerson * 100) / 100,
      totalShare: Math.round(totalShare * 100) / 100,
    };
  });
}

export function generateShareableId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
