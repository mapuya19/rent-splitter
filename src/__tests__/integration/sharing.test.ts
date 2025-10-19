/**
 * Integration tests for the URL-based sharing workflow
 * Tests the complete flow from creating a shareable link to decoding the data
 */

import { compressCalculationData, decompressCalculationData } from '@/utils/compression';

describe('URL-Based Sharing Integration Tests', () => {
  const testCalculationData = {
    totalRent: 3000,
    utilities: 400,
    customExpenses: [
      { id: 'exp1', name: 'Internet', amount: 75 },
      { id: 'exp2', name: 'Parking', amount: 100 }
    ],
    roommates: [
      { id: 'roommate1', name: 'Alice', income: 70000, roomSize: 120 },
      { id: 'roommate2', name: 'Bob', income: 90000, roomSize: 180 },
      { id: 'roommate3', name: 'Charlie', income: 110000, roomSize: 200 }
    ],
    currency: 'USD',
    useRoomSizeSplit: true
  };

  it('should encode and decode calculation data correctly', () => {
    // Step 1: Compress data (simulating what happens in handleShare)
    const compressedData = compressCalculationData(testCalculationData);
    
    expect(compressedData).toBeDefined();
    expect(typeof compressedData).toBe('string');
    expect(compressedData.length).toBeGreaterThan(0);

    // Step 2: Decompress data (simulating what happens in loadSharedData)
    const decompressedData = decompressCalculationData(compressedData);
    
    expect(decompressedData).toEqual(testCalculationData);
  });

  it('should create valid shareable URL with compression', () => {
    const compressedData = compressCalculationData(testCalculationData);
    const shareableUrl = `https://rent-splitted.vercel.app?data=${compressedData}`;
    
    expect(shareableUrl).toContain('?data=');
    expect(shareableUrl).toContain(compressedData);
    
    // Test URL parsing
    const url = new URL(shareableUrl);
    const dataParam = url.searchParams.get('data');
    expect(dataParam).toBe(compressedData);
    
    // Test that compressed URL is shorter than original
    const originalJson = JSON.stringify(testCalculationData);
    const originalBase64 = btoa(originalJson);
    const originalUrl = `https://rent-splitted.vercel.app?data=${originalBase64}`;
    
    expect(shareableUrl.length).toBeLessThan(originalUrl.length);
  });

  it('should handle different calculation scenarios', () => {
    const scenarios = [
      {
        name: 'Income-based split',
        data: { ...testCalculationData, useRoomSizeSplit: false }
      },
      {
        name: 'Room size-based split',
        data: { ...testCalculationData, useRoomSizeSplit: true }
      },
      {
        name: 'Different currency',
        data: { ...testCalculationData, currency: 'EUR' }
      },
      {
        name: 'Minimal data',
        data: {
          totalRent: 1000,
          utilities: 0,
          customExpenses: [],
          roommates: [{ id: 'single', name: 'Solo', income: 50000 }],
          currency: 'USD',
          useRoomSizeSplit: false
        }
      }
    ];

    scenarios.forEach(scenario => {
      const compressedData = compressCalculationData(scenario.data);
      const decompressedData = decompressCalculationData(compressedData);
      
      // Compare data without IDs since they're regenerated during decompression
      expect(decompressedData.totalRent).toBe(scenario.data.totalRent);
      expect(decompressedData.utilities).toBe(scenario.data.utilities);
      expect(decompressedData.currency).toBe(scenario.data.currency);
      expect(decompressedData.useRoomSizeSplit).toBe(scenario.data.useRoomSizeSplit);
      
      // Compare custom expenses (without IDs)
      expect(decompressedData.customExpenses).toHaveLength(scenario.data.customExpenses.length);
      decompressedData.customExpenses.forEach((expense, index) => {
        expect(expense.name).toBe(scenario.data.customExpenses[index].name);
        expect(expense.amount).toBe(scenario.data.customExpenses[index].amount);
      });
      
      // Compare roommates (without IDs)
      expect(decompressedData.roommates).toHaveLength(scenario.data.roommates.length);
      decompressedData.roommates.forEach((roommate, index) => {
        expect(roommate.name).toBe(scenario.data.roommates[index].name);
        expect(roommate.income).toBe(scenario.data.roommates[index].income);
        expect(roommate.roomSize).toBe(scenario.data.roommates[index].roomSize);
      });
    });
  });

  it('should handle URL length limits gracefully with compression', () => {
    // Create a large dataset to test URL length limits
    const largeData = {
      ...testCalculationData,
      roommates: Array.from({ length: 20 }, (_, i) => ({
        id: `roommate${i}`,
        name: `Person ${i}`,
        income: 50000 + (i * 1000),
        roomSize: 100 + (i * 10)
      })),
      customExpenses: Array.from({ length: 10 }, (_, i) => ({
        id: `expense${i}`,
        name: `Expense ${i}`,
        amount: 50 + (i * 10)
      }))
    };

    const compressedData = compressCalculationData(largeData);
    const shareableUrl = `https://rent-splitted.vercel.app?data=${compressedData}`;
    
    // Check if the URL is reasonable in length (allow some margin for large datasets)
    expect(shareableUrl.length).toBeLessThan(2500); // Most browsers can handle URLs up to ~2000 chars
    
    // Verify it can still be decompressed
    const decompressedData = decompressCalculationData(compressedData);
    expect(decompressedData.roommates).toHaveLength(20);
    expect(decompressedData.customExpenses).toHaveLength(10);
    
    // Test that compression is working (compressed data should be different from original)
    const originalJson = JSON.stringify(largeData);
    expect(compressedData).not.toBe(originalJson);
  });

  it('should handle invalid data gracefully', () => {
    // Test with invalid compressed data
    expect(() => {
      decompressCalculationData('invalid-base64!');
    }).toThrow();

    // Test with corrupted compressed data
    expect(() => {
      const validCompressed = compressCalculationData(testCalculationData);
      const corrupted = validCompressed.slice(0, -10) + 'invalid';
      decompressCalculationData(corrupted);
    }).toThrow();
  });
});