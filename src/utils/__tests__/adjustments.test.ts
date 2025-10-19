import { calculateRentSplit } from '../calculations';
import { CalculationData, Roommate, RoomAdjustments } from '@/types';

describe('Room Adjustments', () => {
  const baseData: CalculationData = {
    totalRent: 3000,
    utilities: 200,
    customExpenses: [],
    roommates: [],
  };

  describe('Private Bathroom Adjustment', () => {
    it('should add 15% to rent share for private bathroom', () => {
      const roommates: Roommate[] = [
        {
          id: '1',
          name: 'Alice',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: true,
            hasWindow: true,
            hasDoor: true,
            isSharedBedroom: false,
          },
        },
        {
          id: '2',
          name: 'Bob',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: true,
            hasDoor: true,
            isSharedBedroom: false,
          },
        },
      ];

      const results = calculateRentSplit({ ...baseData, roommates });
      
      // Alice should pay more due to private bathroom
      const aliceResult = results.find(r => r.roommateId === '1');
      const bobResult = results.find(r => r.roommateId === '2');
      
      expect(aliceResult!.rentShare).toBeGreaterThan(bobResult!.rentShare);
      expect(aliceResult!.adjustmentAmount).toBeGreaterThan(0);
      expect(bobResult!.adjustmentAmount).toBeLessThan(0); // Bob pays less to compensate
      
      // Total rent should be preserved
      const totalRentCollected = results.reduce((sum, result) => sum + result.rentShare, 0);
      expect(totalRentCollected).toBeCloseTo(baseData.totalRent, 2);
    });
  });

  describe('Window and Door Adjustments', () => {
    it('should reduce rent share for no window (-10%) and no door (-5%)', () => {
      const roommates: Roommate[] = [
        {
          id: '1',
          name: 'Alice',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: false,
            hasDoor: false,
            isSharedBedroom: false,
          },
        },
        {
          id: '2',
          name: 'Bob',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: true,
            hasDoor: true,
            isSharedBedroom: false,
          },
        },
      ];

      const results = calculateRentSplit({ ...baseData, roommates });
      
      const aliceResult = results.find(r => r.roommateId === '1');
      const bobResult = results.find(r => r.roommateId === '2');
      
      // Alice should pay less due to no window and no door
      expect(aliceResult!.rentShare).toBeLessThan(bobResult!.rentShare);
      expect(aliceResult!.adjustmentAmount).toBeLessThan(0);
      expect(bobResult!.adjustmentAmount).toBeGreaterThan(0); // Bob pays more to compensate
      
      // Total rent should be preserved
      const totalRentCollected = results.reduce((sum, result) => sum + result.rentShare, 0);
      expect(totalRentCollected).toBeCloseTo(baseData.totalRent, 2);
    });
  });

  describe('Custom Adjustment Percentage', () => {
    it('should apply custom adjustment percentage', () => {
      const roommates: Roommate[] = [
        {
          id: '1',
          name: 'Alice',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: true,
            hasDoor: true,
            isSharedBedroom: false,
            adjustmentPercentage: 25, // +25% custom adjustment
          },
        },
        {
          id: '2',
          name: 'Bob',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: true,
            hasDoor: true,
            isSharedBedroom: false,
            adjustmentPercentage: -10, // -10% custom adjustment
          },
        },
      ];

      const results = calculateRentSplit({ ...baseData, roommates });
      
      const aliceResult = results.find(r => r.roommateId === '1');
      const bobResult = results.find(r => r.roommateId === '2');
      
      // Alice should pay more due to +25% adjustment
      expect(aliceResult!.rentShare).toBeGreaterThan(bobResult!.rentShare);
      expect(aliceResult!.adjustmentAmount).toBeGreaterThan(0);
      expect(bobResult!.adjustmentAmount).toBeLessThan(0);
    });
  });

  describe('Combined Adjustments', () => {
    it('should combine multiple adjustments correctly', () => {
      const roommates: Roommate[] = [
        {
          id: '1',
          name: 'Alice',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: true, // +15%
            hasWindow: false, // -10%
            hasDoor: false, // -5%
            isSharedBedroom: false,
            adjustmentPercentage: 5, // +5%
            // Total: +15% - 10% - 5% + 5% = +5%
          },
        },
        {
          id: '2',
          name: 'Bob',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: true,
            hasDoor: true,
            isSharedBedroom: true, // -20%
            adjustmentPercentage: 0,
            // Total: -20%
          },
        },
      ];

      const results = calculateRentSplit({ ...baseData, roommates });
      
      const aliceResult = results.find(r => r.roommateId === '1');
      const bobResult = results.find(r => r.roommateId === '2');
      
      // Alice should pay more due to net positive adjustment
      expect(aliceResult!.rentShare).toBeGreaterThan(bobResult!.rentShare);
      expect(aliceResult!.adjustmentAmount).toBeGreaterThan(0);
      expect(bobResult!.adjustmentAmount).toBeLessThan(0);
    });
  });

  describe('Adjustment Clamping', () => {
    it('should clamp adjustments between -50% and +50%', () => {
      const roommates: Roommate[] = [
        {
          id: '1',
          name: 'Alice',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: true,
            hasDoor: true,
            isSharedBedroom: false,
            adjustmentPercentage: 100, // Should be clamped to +50%
          },
        },
        {
          id: '2',
          name: 'Bob',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: true,
            hasDoor: true,
            isSharedBedroom: false,
            adjustmentPercentage: -100, // Should be clamped to -50%
          },
        },
      ];

      const results = calculateRentSplit({ ...baseData, roommates });
      
      const aliceResult = results.find(r => r.roommateId === '1');
      const bobResult = results.find(r => r.roommateId === '2');
      
      // Check that adjustments are properly clamped
      expect(aliceResult!.adjustmentAmount).toBeLessThanOrEqual(1500); // 50% of 3000
      expect(bobResult!.adjustmentAmount).toBeGreaterThanOrEqual(-1500); // -50% of 3000
    });
  });

  describe('No Adjustments', () => {
    it('should work without adjustments', () => {
      const roommates: Roommate[] = [
        {
          id: '1',
          name: 'Alice',
          income: 50000,
        },
        {
          id: '2',
          name: 'Bob',
          income: 50000,
        },
      ];

      const results = calculateRentSplit({ ...baseData, roommates });
      
      const aliceResult = results.find(r => r.roommateId === '1');
      const bobResult = results.find(r => r.roommateId === '2');
      
      // Should split evenly with no adjustments
      expect(aliceResult!.rentShare).toBe(bobResult!.rentShare);
      expect(aliceResult!.adjustmentAmount).toBe(0);
      expect(bobResult!.adjustmentAmount).toBe(0);
    });
  });

  describe('Total Rent Preservation', () => {
    it('should preserve total rent when adjustments are applied', () => {
      const roommates: Roommate[] = [
        {
          id: '1',
          name: 'Alice',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: true, // +15%
            hasWindow: true,
            hasDoor: true,
            isSharedBedroom: false,
          },
        },
        {
          id: '2',
          name: 'Bob',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: false, // -10%
            hasDoor: false, // -5%
            isSharedBedroom: false,
          },
        },
      ];

      const results = calculateRentSplit({ ...baseData, roommates });
      
      // Total rent should equal the original total rent
      const totalRentCollected = results.reduce((sum, result) => sum + result.rentShare, 0);
      expect(totalRentCollected).toBeCloseTo(baseData.totalRent, 2);
    });

    it('should redistribute costs when one person gets a discount', () => {
      const roommates: Roommate[] = [
        {
          id: '1',
          name: 'Alice',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: true,
            hasDoor: true,
            isSharedBedroom: false,
          },
        },
        {
          id: '2',
          name: 'Bob',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: false, // -10%
            hasDoor: false, // -5%
            isSharedBedroom: false,
          },
        },
      ];

      const results = calculateRentSplit({ ...baseData, roommates });
      
      const aliceResult = results.find(r => r.roommateId === '1');
      const bobResult = results.find(r => r.roommateId === '2');
      
      // Bob should pay less due to no window and no door
      expect(bobResult!.rentShare).toBeLessThan(aliceResult!.rentShare);
      
      // Alice should pay more to compensate for Bob's discount
      expect(aliceResult!.rentShare).toBeGreaterThan(baseData.totalRent / 2);
      
      // Total should still equal original rent
      const totalRentCollected = results.reduce((sum, result) => sum + result.rentShare, 0);
      expect(totalRentCollected).toBeCloseTo(baseData.totalRent, 2);
    });

    it('should handle complex adjustment scenarios', () => {
      const roommates: Roommate[] = [
        {
          id: '1',
          name: 'Alice',
          income: 60000,
          adjustments: {
            hasPrivateBathroom: true, // +15%
            hasWindow: true,
            hasDoor: true,
            isSharedBedroom: false,
          },
        },
        {
          id: '2',
          name: 'Bob',
          income: 40000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: false, // -10%
            hasDoor: false, // -5%
            isSharedBedroom: true, // -20%
          },
        },
        {
          id: '3',
          name: 'Charlie',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: true,
            hasDoor: true,
            isSharedBedroom: false,
          },
        },
      ];

      const results = calculateRentSplit({ ...baseData, roommates });
      
      // Total rent should be preserved
      const totalRentCollected = results.reduce((sum, result) => sum + result.rentShare, 0);
      expect(totalRentCollected).toBeCloseTo(baseData.totalRent, 2);
      
      // Alice should pay the most (private bathroom + higher income)
      const aliceResult = results.find(r => r.roommateId === '1');
      const bobResult = results.find(r => r.roommateId === '2');
      const charlieResult = results.find(r => r.roommateId === '3');
      
      expect(aliceResult!.rentShare).toBeGreaterThan(charlieResult!.rentShare);
      expect(charlieResult!.rentShare).toBeGreaterThan(bobResult!.rentShare);
    });

    it('should ensure total split exactly matches original total (no rounding errors)', () => {
      const roommates: Roommate[] = [
        {
          id: '1',
          name: 'Alice',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: true, // +15%
            hasWindow: true,
            hasDoor: true,
            isSharedBedroom: false,
          },
        },
        {
          id: '2',
          name: 'Bob',
          income: 50000,
          adjustments: {
            hasPrivateBathroom: false,
            hasWindow: false, // -10%
            hasDoor: false, // -5%
            isSharedBedroom: false,
          },
        },
      ];

      const results = calculateRentSplit({ ...baseData, roommates });
      
      // Calculate total split (sum of all totalShare values)
      const totalSplitAmount = results.reduce((sum, result) => sum + result.totalShare, 0);
      
      // Calculate original total
      const originalTotal = baseData.totalRent + baseData.utilities;
      
      // They should match exactly (allowing for 1 cent difference due to rounding)
      expect(Math.abs(totalSplitAmount - originalTotal)).toBeLessThanOrEqual(0.01);
      
      // Verify rent portion also matches exactly
      const totalRentCollected = results.reduce((sum, result) => sum + result.rentShare, 0);
      expect(Math.abs(totalRentCollected - baseData.totalRent)).toBeLessThanOrEqual(0.01);
    });
  });
});
