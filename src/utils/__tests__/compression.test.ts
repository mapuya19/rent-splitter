import { compressCalculationData, decompressCalculationData, getCompressionRatio } from '../compression';
import { CalculationData } from '@/types';

describe('Data Compression', () => {
  const testData: CalculationData = {
    totalRent: 3000,
    utilities: 400,
    customExpenses: [
      { id: 'exp1', name: 'Internet', amount: 75 },
      { id: 'exp2', name: 'Parking', amount: 100 }
    ],
    roommates: [
      { id: 'roommate1', name: 'Alice Johnson', income: 70000, roomSize: 120 },
      { id: 'roommate2', name: 'Bob Smith', income: 90000, roomSize: 180 }
    ],
    currency: 'USD',
    useRoomSizeSplit: true
  };

  describe('compressCalculationData', () => {
    it('should compress data successfully', () => {
      const compressed = compressCalculationData(testData);
      
      expect(compressed).toBeDefined();
      expect(typeof compressed).toBe('string');
      expect(compressed.length).toBeGreaterThan(0);
    });

    it('should produce shorter output than original JSON', () => {
      const originalJson = JSON.stringify(testData);
      const compressed = compressCalculationData(testData);
      
      expect(compressed.length).toBeLessThan(originalJson.length);
    });

    it('should handle empty custom expenses', () => {
      const dataWithNoExpenses = { ...testData, customExpenses: [] };
      const compressed = compressCalculationData(dataWithNoExpenses);
      
      expect(compressed).toBeDefined();
      expect(compressed.length).toBeGreaterThan(0);
    });

    it('should handle missing optional fields', () => {
      const minimalData = {
        totalRent: 1000,
        utilities: 0,
        customExpenses: [],
        roommates: [{ id: 'single', name: 'Solo', income: 50000 }]
      };
      
      const compressed = compressCalculationData(minimalData);
      expect(compressed).toBeDefined();
    });
  });

  describe('decompressCalculationData', () => {
    it('should decompress data correctly', () => {
      const compressed = compressCalculationData(testData);
      const decompressed = decompressCalculationData(compressed);
      
      expect(decompressed).toEqual(testData);
    });

    it('should handle round-trip compression', () => {
      const compressed = compressCalculationData(testData);
      const decompressed = decompressCalculationData(compressed);
      const recompressed = compressCalculationData(decompressed);
      
      expect(recompressed).toBe(compressed);
    });

    it('should throw error for invalid data', () => {
      expect(() => {
        decompressCalculationData('invalid-base64!');
      }).toThrow();
    });
  });

  describe('getCompressionRatio', () => {
    it('should calculate compression ratio correctly', () => {
      const ratio = getCompressionRatio(testData);
      
      expect(ratio.original).toBeGreaterThan(0);
      expect(ratio.compressed).toBeGreaterThan(0);
      expect(ratio.ratio).toBeGreaterThan(0);
      expect(ratio.ratio).toBeLessThan(100);
    });

    it('should show meaningful compression for typical data', () => {
      const ratio = getCompressionRatio(testData);
      
      // Should achieve at least 5% compression for typical data
      expect(ratio.ratio).toBeGreaterThan(5);
    });
  });

  describe('room adjustments', () => {
    it('should preserve room adjustments in compression/decompression', () => {
      const data: CalculationData = {
        totalRent: 3000,
        utilities: 200,
        customExpenses: [],
        roommates: [
          {
            id: '1',
            name: 'Alice',
            income: 50000,
            roomSize: 150,
            adjustments: {
              hasPrivateBathroom: true,
              privateBathroomPercentage: 15,
              hasWindow: true,
              noWindowPercentage: undefined,
              hasFlexWall: false,
              flexWallPercentage: undefined,
              adjustmentPercentage: 5
            }
          },
          {
            id: '2',
            name: 'Bob',
            income: 50000,
            roomSize: 120,
            adjustments: {
              hasPrivateBathroom: false,
              privateBathroomPercentage: undefined,
              hasWindow: false,
              noWindowPercentage: -10,
              hasFlexWall: true,
              flexWallPercentage: -5,
              adjustmentPercentage: 0
            }
          }
        ],
        currency: 'USD',
        useRoomSizeSplit: true
      };

      const compressed = compressCalculationData(data);
      const decompressed = decompressCalculationData(compressed);

      // Verify Alice's adjustments
      expect(decompressed.roommates[0].adjustments?.hasPrivateBathroom).toBe(true);
      expect(decompressed.roommates[0].adjustments?.privateBathroomPercentage).toBe(15);
      expect(decompressed.roommates[0].adjustments?.hasWindow).toBe(true);
      expect(decompressed.roommates[0].adjustments?.hasFlexWall).toBe(false);
      expect(decompressed.roommates[0].adjustments?.adjustmentPercentage).toBe(5);

      // Verify Bob's adjustments
      expect(decompressed.roommates[1].adjustments?.hasPrivateBathroom).toBe(false);
      expect(decompressed.roommates[1].adjustments?.hasWindow).toBe(false);
      expect(decompressed.roommates[1].adjustments?.noWindowPercentage).toBe(-10);
      expect(decompressed.roommates[1].adjustments?.hasFlexWall).toBe(true);
      expect(decompressed.roommates[1].adjustments?.flexWallPercentage).toBe(-5);
    });

    it('should handle roommates without adjustments', () => {
      const data: CalculationData = {
        totalRent: 2000,
        utilities: 100,
        customExpenses: [],
        roommates: [
          {
            id: '1',
            name: 'Alice',
            income: 50000,
            roomSize: 150
          }
        ],
        currency: 'USD',
        useRoomSizeSplit: true
      };

      const compressed = compressCalculationData(data);
      const decompressed = decompressCalculationData(compressed);

      expect(decompressed.roommates[0].adjustments).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle very long names', () => {
      const dataWithLongNames = {
        ...testData,
        roommates: [
          { id: 'roommate1', name: 'Very Long Name That Goes On And On', income: 70000, roomSize: 120 }
        ]
      };
      
      const compressed = compressCalculationData(dataWithLongNames);
      const decompressed = decompressCalculationData(compressed);
      
      expect(decompressed).toEqual(dataWithLongNames);
    });

    it('should handle special characters in names', () => {
      const dataWithSpecialChars = {
        ...testData,
        roommates: [
          { id: 'roommate1', name: 'José María O\'Connor-Smith', income: 70000, roomSize: 120 }
        ]
      };
      
      const compressed = compressCalculationData(dataWithSpecialChars);
      const decompressed = decompressCalculationData(compressed);
      
      expect(decompressed).toEqual(dataWithSpecialChars);
    });

    it('should handle large numbers', () => {
      const dataWithLargeNumbers = {
        ...testData,
        totalRent: 1000000,
        utilities: 50000,
        roommates: [
          { id: 'roommate1', name: 'Alice', income: 1000000, roomSize: 1000 }
        ]
      };
      
      const compressed = compressCalculationData(dataWithLargeNumbers);
      const decompressed = decompressCalculationData(compressed);
      
      expect(decompressed).toEqual(dataWithLargeNumbers);
    });
  });
});
