import { Roommate, SplitResult, CalculationData } from '@/types';

export function calculateRentSplit(data: CalculationData, useRoomSizeSplit: boolean = false): SplitResult[] {
  const { totalRent, utilities, customExpenses, roommates } = data;
  
  // Check if any roommate has room size specified and toggle is on
  const hasRoomSizes = useRoomSizeSplit && roommates.some(roommate => roommate.roomSize && roommate.roomSize > 0);
  
  // Calculate utilities per person (split evenly)
  const utilitiesPerPerson = utilities / roommates.length;
  
  // Calculate custom expenses per person (split evenly)
  const totalCustomExpenses = customExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const customExpensesPerPerson = totalCustomExpenses / roommates.length;
  
  let rentShare: number;
  
  if (hasRoomSizes) {
    // Split rent based on room size
    const totalRoomSize = roommates.reduce((sum, roommate) => sum + (roommate.roomSize || 0), 0);
    
    return roommates.map(roommate => {
      const roomSizePercentage = totalRoomSize > 0 ? (roommate.roomSize || 0) / totalRoomSize : 1 / roommates.length;
      rentShare = totalRent * roomSizePercentage;
      const totalShare = rentShare + utilitiesPerPerson + customExpensesPerPerson;
      
      return {
        roommateId: roommate.id,
        roommateName: roommate.name,
        income: roommate.income,
        incomePercentage: Math.round(roomSizePercentage * 100) / 100,
        rentShare: Math.round(rentShare * 100) / 100,
        utilitiesShare: Math.round(utilitiesPerPerson * 100) / 100,
        customExpensesShare: Math.round(customExpensesPerPerson * 100) / 100,
        totalShare: Math.round(totalShare * 100) / 100,
      };
    });
  } else {
    // Split rent based on income (original logic)
    const totalIncome = roommates.reduce((sum, roommate) => sum + roommate.income, 0);
    
    return roommates.map(roommate => {
      const incomePercentage = roommate.income / totalIncome;
      rentShare = totalRent * incomePercentage;
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
