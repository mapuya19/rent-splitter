/**
 * Basic tests to verify the testing setup works
 */

import { calculateRentSplit } from '@/utils/calculations';
import { formatCurrency } from '@/utils/currency';

describe('Basic Functionality Tests', () => {
  describe('calculateRentSplit', () => {
    it('should calculate rent split for basic scenario', () => {
      const data = {
        totalRent: 2000,
        utilities: 300,
        customExpenses: [],
        roommates: [
          { id: 'roommate1', name: 'Alice', income: 60000 },
          { id: 'roommate2', name: 'Bob', income: 80000 }
        ]
      };
      
      const results = calculateRentSplit(data, false);
      
      expect(results).toHaveLength(2);
      expect(results[0].roommateName).toBe('Alice');
      expect(results[1].roommateName).toBe('Bob');
      
      // Verify total rent is distributed
      const totalRentShare = results.reduce((sum, result) => sum + result.rentShare, 0);
      expect(totalRentShare).toBeCloseTo(2000, 2);
    });
  });


  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });
  });
});
