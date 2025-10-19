/**
 * Simplified sharing functionality tests
 */

import { calculateRentSplit } from '@/utils/calculations';

describe('Sharing Functionality - Core Logic', () => {
  it('should calculate rent split correctly for sharing', () => {
    const testData = {
      totalRent: 2000,
      utilities: 300,
      customExpenses: [
        { id: 'exp1', name: 'Internet', amount: 50 }
      ],
      roommates: [
        { id: 'roommate1', name: 'Alice', income: 60000 },
        { id: 'roommate2', name: 'Bob', income: 80000 }
      ]
    };
    
    const results = calculateRentSplit(testData, false);
    
    expect(results).toHaveLength(2);
    expect(results[0].roommateName).toBe('Alice');
    expect(results[1].roommateName).toBe('Bob');
    
    // Verify total rent is distributed correctly
    const totalRentShare = results.reduce((sum, result) => sum + result.rentShare, 0);
    expect(totalRentShare).toBeCloseTo(2000, 2);
    
    // Verify utilities are split evenly
    const utilitiesPerPerson = 300 / 2; // 150 each
    results.forEach(result => {
      expect(result.utilitiesShare).toBeCloseTo(utilitiesPerPerson, 2);
    });
  });

  it('should handle room size based splitting for sharing', () => {
    const testData = {
      totalRent: 2000,
      utilities: 300,
      customExpenses: [],
      roommates: [
        { id: 'roommate1', name: 'Alice', income: 60000, roomSize: 100 },
        { id: 'roommate2', name: 'Bob', income: 80000, roomSize: 200 }
      ]
    };
    
    const results = calculateRentSplit(testData, true);
    
    expect(results).toHaveLength(2);
    
    // Bob should pay more (200/300 = 66.67%)
    const bobResult = results.find(r => r.roommateName === 'Bob');
    expect(bobResult?.rentShare).toBeCloseTo(2000 * (200/300), 2);
    
    // Alice should pay less (100/300 = 33.33%)
    const aliceResult = results.find(r => r.roommateName === 'Alice');
    expect(aliceResult?.rentShare).toBeCloseTo(2000 * (100/300), 2);
  });

  it('should handle edge cases for sharing', () => {
    const testData = {
      totalRent: 1000,
      utilities: 0,
      customExpenses: [],
      roommates: [
        { id: 'roommate1', name: 'Solo', income: 50000 }
      ]
    };
    
    const results = calculateRentSplit(testData, false);
    
    expect(results).toHaveLength(1);
    expect(results[0].rentShare).toBe(1000);
    expect(results[0].utilitiesShare).toBe(0);
    expect(results[0].totalShare).toBe(1000);
  });
});
