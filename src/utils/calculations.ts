import { SplitResult, CalculationData, RoomAdjustments, Roommate } from '@/types';

// Helper function to calculate adjustment percentage based on room features
function calculateAdjustmentPercentage(adjustments?: RoomAdjustments): number {
  if (!adjustments) return 0;
  
  let adjustment = 0;
  
  // Private bathroom (default: +15%)
  if (adjustments.hasPrivateBathroom) {
    adjustment += adjustments.privateBathroomPercentage ?? 15;
  }
  
  // No window (default: -10%)
  if (!adjustments.hasWindow) {
    const noWindowAdj = adjustments.noWindowPercentage ?? -10;
    adjustment += noWindowAdj; // Add the value (which is negative)
  }
  
  // Flex wall (default: -5%)
  if (adjustments.hasFlexWall) {
    const flexWallAdj = adjustments.flexWallPercentage ?? -5;
    adjustment += flexWallAdj; // Add the value (which is negative)
  }
  
  // Additional custom adjustment percentage (user-defined)
  if (adjustments.adjustmentPercentage !== undefined) {
    adjustment += adjustments.adjustmentPercentage;
  }
  
  // Clamp adjustment between -50% and +50%
  return Math.max(-50, Math.min(50, adjustment));
}

export function calculateRentSplit(data: CalculationData, useRoomSizeSplit: boolean = false): SplitResult[] {
  const { totalRent, utilities, customExpenses, roommates } = data;
  
  // Check if any roommate has room size specified and toggle is on
  const hasRoomSizes = useRoomSizeSplit && roommates.some(roommate => roommate.roomSize && roommate.roomSize > 0);
  
  // If room size split is enabled but no room sizes provided, fall back to equal split
  const shouldUseEqualSplit = useRoomSizeSplit && !hasRoomSizes;
  
  // Calculate utilities per person (split evenly)
  const utilitiesPerPerson = utilities / roommates.length;
  
  // Calculate custom expenses per person (split evenly)
  const totalCustomExpenses = customExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const customExpensesPerPerson = totalCustomExpenses / roommates.length;
  
  // Step 1: Calculate base rent shares
  let baseRentShares: { roommate: Roommate; baseShare: number; percentage: number }[] = [];
  
  if (hasRoomSizes) {
    // Split rent based on room size
    const totalRoomSize = roommates.reduce((sum, roommate) => sum + (roommate.roomSize || 0), 0);
    
    baseRentShares = roommates.map(roommate => {
      const roomSizePercentage = totalRoomSize > 0 ? (roommate.roomSize || 0) / totalRoomSize : 1 / roommates.length;
      const baseShare = totalRent * roomSizePercentage;
      return { roommate, baseShare, percentage: roomSizePercentage };
    });
  } else if (shouldUseEqualSplit) {
    // Equal split when room size mode is on but no room sizes provided
    const equalShare = totalRent / roommates.length;
    
    baseRentShares = roommates.map(roommate => ({
      roommate,
      baseShare: equalShare,
      percentage: 1 / roommates.length
    }));
  } else {
    // Split rent based on income (original logic)
    const totalIncome = roommates.reduce((sum, roommate) => sum + roommate.income, 0);
    
    baseRentShares = roommates.map(roommate => {
      const incomePercentage = roommate.income / totalIncome;
      const baseShare = totalRent * incomePercentage;
      return { roommate, baseShare, percentage: incomePercentage };
    });
  }
  
  // Step 2: Apply adjustments to get adjusted shares
  const adjustedShares = baseRentShares.map(({ roommate, baseShare, percentage }) => {
    const adjustmentPercentage = calculateAdjustmentPercentage(roommate.adjustments);
    const adjustmentAmount = baseShare * (adjustmentPercentage / 100);
    const adjustedShare = baseShare + adjustmentAmount;
    return { roommate, baseShare, adjustedShare, adjustmentAmount, percentage };
  });
  
  // Step 3: Calculate total adjusted rent and redistribute
  const totalAdjustedRent = adjustedShares.reduce((sum, { adjustedShare }) => sum + adjustedShare, 0);
  
  // If total adjusted rent doesn't equal total rent, redistribute proportionally
  let finalShares: SplitResult[] = [];
  
  if (Math.abs(totalAdjustedRent - totalRent) < 0.01) {
    // No redistribution needed
    finalShares = adjustedShares.map(({ roommate, adjustedShare, adjustmentAmount, percentage }) => {
      const roundedRentShare = Math.round(adjustedShare * 100) / 100;
      const roundedUtilitiesShare = Math.round(utilitiesPerPerson * 100) / 100;
      const roundedCustomExpensesShare = Math.round(customExpensesPerPerson * 100) / 100;
      const roundedAdjustmentAmount = Math.round(adjustmentAmount * 100) / 100;
      
      // Calculate total from rounded components to avoid rounding discrepancies
      const totalShare = roundedRentShare + roundedUtilitiesShare + roundedCustomExpensesShare;
      
      return {
        roommateId: roommate.id,
        roommateName: roommate.name,
        income: roommate.income,
        incomePercentage: Math.round(percentage * 100) / 100,
        rentShare: roundedRentShare,
        utilitiesShare: roundedUtilitiesShare,
        customExpensesShare: roundedCustomExpensesShare,
        adjustmentAmount: roundedAdjustmentAmount,
        totalShare: Math.round(totalShare * 100) / 100,
      };
    });
  } else {
    // Redistribute to ensure total rent is preserved
    const redistributionFactor = totalRent / totalAdjustedRent;
    
    finalShares = adjustedShares.map(({ roommate, baseShare, adjustedShare, percentage }) => {
      const redistributedShare = adjustedShare * redistributionFactor;
      const finalAdjustmentAmount = redistributedShare - baseShare;
      
      const roundedRentShare = Math.round(redistributedShare * 100) / 100;
      const roundedUtilitiesShare = Math.round(utilitiesPerPerson * 100) / 100;
      const roundedCustomExpensesShare = Math.round(customExpensesPerPerson * 100) / 100;
      const roundedAdjustmentAmount = Math.round(finalAdjustmentAmount * 100) / 100;
      
      // Calculate total from rounded components to avoid rounding discrepancies
      const totalShare = roundedRentShare + roundedUtilitiesShare + roundedCustomExpensesShare;
      
      return {
        roommateId: roommate.id,
        roommateName: roommate.name,
        income: roommate.income,
        incomePercentage: Math.round(percentage * 100) / 100,
        rentShare: roundedRentShare,
        utilitiesShare: roundedUtilitiesShare,
        customExpensesShare: roundedCustomExpensesShare,
        adjustmentAmount: roundedAdjustmentAmount,
        totalShare: Math.round(totalShare * 100) / 100,
      };
    });
  }
  
  return finalShares;
}


