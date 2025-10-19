import { calculateRentSplit, generateShareableId } from '../calculations';
import { formatCurrency } from '../currency';
import { CalculationData } from '@/types';

describe('calculations', () => {
  describe('calculateRentSplit', () => {
    const baseCalculationData: CalculationData = {
      totalRent: 2000,
      utilities: 300,
      customExpenses: [
        { id: 'exp1', name: 'Internet', amount: 50 },
        { id: 'exp2', name: 'Cable', amount: 80 }
      ],
      roommates: [
        { id: 'roommate1', name: 'Alice', income: 60000 },
        { id: 'roommate2', name: 'Bob', income: 80000 },
        { id: 'roommate3', name: 'Charlie', income: 100000 }
      ]
    };

    it('should calculate rent split based on income', () => {
      const results = calculateRentSplit(baseCalculationData, false);
      
      expect(results).toHaveLength(3);
      
      // Check that all results have required properties
      results.forEach(result => {
        expect(result).toHaveProperty('roommateId');
        expect(result).toHaveProperty('roommateName');
        expect(result).toHaveProperty('income');
        expect(result).toHaveProperty('incomePercentage');
        expect(result).toHaveProperty('rentShare');
        expect(result).toHaveProperty('utilitiesShare');
        expect(result).toHaveProperty('customExpensesShare');
        expect(result).toHaveProperty('totalShare');
      });
      
      // Verify income percentages add up to 1
      const totalPercentage = results.reduce((sum, result) => sum + result.incomePercentage, 0);
      expect(totalPercentage).toBeCloseTo(1, 2);
      
      // Verify rent shares add up to total rent
      const totalRentShare = results.reduce((sum, result) => sum + result.rentShare, 0);
      expect(totalRentShare).toBeCloseTo(2000, 2);
      
      // Verify utilities are split evenly
      const utilitiesPerPerson = 300 / 3; // 100 each
      results.forEach(result => {
        expect(result.utilitiesShare).toBeCloseTo(utilitiesPerPerson, 2);
      });
      
      // Verify custom expenses are split evenly
      const customExpensesPerPerson = (50 + 80) / 3; // 43.33 each
      results.forEach(result => {
        expect(result.customExpensesShare).toBeCloseTo(customExpensesPerPerson, 2);
      });
    });

    it('should calculate rent split based on room size', () => {
      const roomSizeData: CalculationData = {
        ...baseCalculationData,
        roommates: [
          { id: 'roommate1', name: 'Alice', income: 60000, roomSize: 100 },
          { id: 'roommate2', name: 'Bob', income: 80000, roomSize: 150 },
          { id: 'roommate3', name: 'Charlie', income: 100000, roomSize: 200 }
        ]
      };
      
      const results = calculateRentSplit(roomSizeData, true);
      
      expect(results).toHaveLength(3);
      
      // Verify room size percentages add up to 1
      const totalPercentage = results.reduce((sum, result) => sum + result.incomePercentage, 0);
      expect(totalPercentage).toBeCloseTo(1, 1);
      
      // Verify rent shares add up to total rent
      const totalRentShare = results.reduce((sum, result) => sum + result.rentShare, 0);
      expect(totalRentShare).toBeCloseTo(2000, 2);
      
      // Alice should pay less (100/450 = 22.22%)
      const aliceResult = results.find(r => r.roommateName === 'Alice');
      expect(aliceResult?.rentShare).toBeCloseTo(2000 * (100/450), 2);
      
      // Charlie should pay more (200/450 = 44.44%)
      const charlieResult = results.find(r => r.roommateName === 'Charlie');
      expect(charlieResult?.rentShare).toBeCloseTo(2000 * (200/450), 2);
    });

    it('should handle empty custom expenses', () => {
      const dataWithoutCustomExpenses: CalculationData = {
        ...baseCalculationData,
        customExpenses: []
      };
      
      const results = calculateRentSplit(dataWithoutCustomExpenses, false);
      
      results.forEach(result => {
        expect(result.customExpensesShare).toBe(0);
      });
    });

    it('should handle zero utilities', () => {
      const dataWithoutUtilities: CalculationData = {
        ...baseCalculationData,
        utilities: 0
      };
      
      const results = calculateRentSplit(dataWithoutUtilities, false);
      
      results.forEach(result => {
        expect(result.utilitiesShare).toBe(0);
      });
    });

    it('should handle single roommate', () => {
      const singleRoommateData: CalculationData = {
        ...baseCalculationData,
        roommates: [
          { id: 'roommate1', name: 'Alice', income: 60000 }
        ]
      };
      
      const results = calculateRentSplit(singleRoommateData, false);
      
      expect(results).toHaveLength(1);
      expect(results[0].rentShare).toBe(2000);
      expect(results[0].utilitiesShare).toBe(300);
      expect(results[0].customExpensesShare).toBe(130); // 50 + 80
      expect(results[0].totalShare).toBe(2430);
    });

    it('should fallback to equal split when no room sizes provided in room size mode', () => {
      const dataWithoutRoomSizes: CalculationData = {
        ...baseCalculationData,
        roommates: [
          { id: 'roommate1', name: 'Alice', income: 60000 },
          { id: 'roommate2', name: 'Bob', income: 80000 }
        ]
      };
      
      const results = calculateRentSplit(dataWithoutRoomSizes, true);
      
      // Should split equally (1000 each)
      results.forEach(result => {
        expect(result.rentShare).toBeCloseTo(1000, 1);
      });
    });
  });

  describe('generateShareableId', () => {
    it('should generate a string', () => {
      const id = generateShareableId();
      expect(typeof id).toBe('string');
    });

    it('should generate different IDs on multiple calls', () => {
      const id1 = generateShareableId();
      const id2 = generateShareableId();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with reasonable length', () => {
      const id = generateShareableId();
      expect(id.length).toBeGreaterThan(10);
      expect(id.length).toBeLessThan(50);
    });

    it('should generate alphanumeric IDs', () => {
      const id = generateShareableId();
      expect(/^[a-zA-Z0-9]+$/.test(id)).toBe(true);
    });
  });

  describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should format negative numbers correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('should handle decimal places correctly', () => {
      expect(formatCurrency(1234.5)).toBe('$1,234.50');
      expect(formatCurrency(1234.567)).toBe('$1,234.57'); // Rounds up
    });
  });
});
