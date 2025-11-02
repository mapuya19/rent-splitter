import { CalculationData } from '@/types';

/**
 * Compress calculation data for URL sharing
 * Uses multiple strategies to minimize URL length
 */
export function compressCalculationData(data: CalculationData): string {
  // Strategy 1: Use array format instead of objects (removes field names)
  // Strategy 2: Remove IDs entirely (use array indices)
  // Strategy 3: Use numeric codes for common values
  const compressedData = [
    data.totalRent,              // [0] rent
    data.utilities,              // [1] utilities
    data.customExpenses.map(expense => [
      expense.name,              // [0] name
      expense.amount             // [1] amount
    ]),                          // [2] expenses array
    data.roommates.map(roommate => [
      roommate.name,             // [0] name
      roommate.income,           // [1] income
      roommate.roomSize || 0,    // [2] room size (0 if undefined)
      roommate.adjustments ? [
        roommate.adjustments.hasPrivateBathroom ? 1 : 0,
        roommate.adjustments.privateBathroomPercentage || 0,
        roommate.adjustments.hasWindow ? 1 : 0,
        roommate.adjustments.noWindowPercentage || 0,
        roommate.adjustments.hasFlexWall ? 1 : 0,
        roommate.adjustments.flexWallPercentage || 0,
        roommate.adjustments.adjustmentPercentage || 0
      ] : null                   // [3] adjustments array (null if no adjustments)
    ]),                          // [3] roommates array
    getCurrencyCode(data.currency || 'USD'), // [4] currency code
    data.useRoomSizeSplit ? 1 : 0   // [5] split method (1 = room size, 0 = income)
  ];

  // Strategy 4: JSON stringify with no spaces
  const jsonString = JSON.stringify(compressedData);

  // Strategy 5: Base64 encode
  return btoa(jsonString);
}

/**
 * Decompress calculation data from URL
 */
export function decompressCalculationData(compressedData: string): CalculationData {
  try {
    // Step 1: Base64 decode
    const jsonString = atob(compressedData);

    // Step 2: Parse JSON
    const parsedData = JSON.parse(jsonString);

    // Step 3: Expand back to full structure from array format
    return {
      totalRent: parsedData[0],                    // [0] rent
      utilities: parsedData[1],                    // [1] utilities
      customExpenses: parsedData[2].map((expense: [string, number], index: number) => ({
        id: `exp${index + 1}`,                     // Generate ID from index
        name: expense[0],                          // [0] name
        amount: expense[1]                         // [1] amount
      })),
      roommates: parsedData[3].map((roommate: [string, number, number, number[] | null], index: number) => ({
        id: `roommate${index + 1}`,                // Generate ID from index
        name: roommate[0],                         // [0] name
        income: roommate[1],                       // [1] income
        roomSize: roommate[2] === 0 ? undefined : roommate[2],  // [2] room size (undefined if 0)
        adjustments: roommate[3] ? {
          hasPrivateBathroom: roommate[3][0] === 1,
          privateBathroomPercentage: roommate[3][1] || undefined,
          hasWindow: roommate[3][2] === 1,
          noWindowPercentage: roommate[3][3] || undefined,
          hasFlexWall: roommate[3][4] === 1,
          flexWallPercentage: roommate[3][5] || undefined,
          adjustmentPercentage: roommate[3][6] || undefined
        } : undefined                              // [3] adjustments (undefined if null)
      })),
      currency: getCurrencyFromCode(parsedData[4]), // [4] currency from code
      useRoomSizeSplit: parsedData[5] === 1        // [5] split method
    };
  } catch (error) {
    throw new Error('Failed to decompress calculation data: ' + error);
  }
}

/**
 * Convert currency code to numeric value for compression
 */
function getCurrencyCode(currency: string): number {
  const currencyMap: Record<string, number> = {
    'USD': 1, 'EUR': 2, 'GBP': 3, 'CAD': 4, 'AUD': 5, 'JPY': 6,
    'CHF': 7, 'SEK': 8, 'NOK': 9, 'DKK': 10, 'PLN': 11, 'CZK': 12,
    'HUF': 13, 'BRL': 14, 'MXN': 15, 'INR': 16, 'CNY': 17, 'KRW': 18,
    'SGD': 19, 'HKD': 20, 'NZD': 21, 'ZAR': 22, 'TRY': 23, 'RUB': 24,
    'AED': 26, 'EGP': 28, 'THB': 29, 'PHP': 30,
    'IDR': 31, 'MYR': 32, 'VND': 33
  };
  return currencyMap[currency] || 1; // Default to USD if not found
}

/**
 * Convert numeric currency code back to currency string
 */
function getCurrencyFromCode(code: number): string {
  const codeMap: Record<number, string> = {
    1: 'USD', 2: 'EUR', 3: 'GBP', 4: 'CAD', 5: 'AUD', 6: 'JPY',
    7: 'CHF', 8: 'SEK', 9: 'NOK', 10: 'DKK', 11: 'PLN', 12: 'CZK',
    13: 'HUF', 14: 'BRL', 15: 'MXN', 16: 'INR', 17: 'CNY', 18: 'KRW',
    19: 'SGD', 20: 'HKD', 21: 'NZD', 22: 'ZAR', 23: 'TRY', 24: 'RUB',
    26: 'AED', 28: 'EGP', 29: 'THB', 30: 'PHP',
    31: 'IDR', 32: 'MYR', 33: 'VND'
  };
  return codeMap[code] || 'USD'; // Default to USD if not found
}

/**
 * Get compression ratio for debugging
 */
export function getCompressionRatio(originalData: CalculationData): {
  original: number;
  compressed: number;
  ratio: number;
} {
  const originalJson = JSON.stringify(originalData);
  const compressedData = compressCalculationData(originalData);
  
  return {
    original: originalJson.length,
    compressed: compressedData.length,
    ratio: Math.round((1 - compressedData.length / originalJson.length) * 100)
  };
}
