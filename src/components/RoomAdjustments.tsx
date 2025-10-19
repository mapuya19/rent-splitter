'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { NumberInput } from '@/components/ui/NumberInput';
import { RoomAdjustments } from '@/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface RoomAdjustmentsProps {
  adjustments: RoomAdjustments;
  onAdjustmentsChange: (adjustments: RoomAdjustments) => void;
}

export function RoomAdjustmentsComponent({ adjustments, onAdjustmentsChange }: RoomAdjustmentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleChange = (field: keyof RoomAdjustments, value: boolean) => {
    onAdjustmentsChange({
      ...adjustments,
      [field]: value,
    });
  };

  const handlePercentageChange = (field: keyof RoomAdjustments, value: number) => {
    onAdjustmentsChange({
      ...adjustments,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Room Adjustments</CardTitle>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Private Bathroom */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Private Bathroom</label>
              <Toggle
                checked={adjustments.hasPrivateBathroom}
                onChange={(e) => handleToggleChange('hasPrivateBathroom', e.target.checked)}
              />
            </div>
            {adjustments.hasPrivateBathroom && (
              <NumberInput
                label="Percentage (+)"
                value={adjustments.privateBathroomPercentage ?? 15}
                onValueChange={(value) => handlePercentageChange('privateBathroomPercentage', value)}
                placeholder="+15"
                min={-50}
                max={50}
                step={1}
              />
            )}
          </div>
          
          {/* No Window */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">No Window</label>
              <Toggle
                checked={!adjustments.hasWindow}
                onChange={(e) => handleToggleChange('hasWindow', !e.target.checked)}
              />
            </div>
            {!adjustments.hasWindow && (
              <NumberInput
                label="Percentage (-)"
                value={adjustments.noWindowPercentage ?? -10}
                onValueChange={(value) => handlePercentageChange('noWindowPercentage', value)}
                placeholder="-10"
                min={-50}
                max={50}
                step={1}
              />
            )}
          </div>
          
          {/* Flex Wall */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Flex Wall</label>
              <Toggle
                checked={adjustments.hasFlexWall}
                onChange={(e) => handleToggleChange('hasFlexWall', e.target.checked)}
              />
            </div>
            {adjustments.hasFlexWall && (
              <NumberInput
                label="Percentage (-)"
                value={adjustments.flexWallPercentage ?? -5}
                onValueChange={(value) => handlePercentageChange('flexWallPercentage', value)}
                placeholder="-5"
                min={-50}
                max={50}
                step={1}
              />
            )}
          </div>
          
          {/* Additional Custom Adjustment */}
          <div className="pt-2 border-t">
            <NumberInput
              label="Additional Adjustment (±%)"
              value={adjustments.adjustmentPercentage || 0}
              onValueChange={(value) => handlePercentageChange('adjustmentPercentage', value)}
              placeholder="±0"
              min={-50}
              max={50}
              step={1}
            />
            <p className="text-xs text-gray-500 mt-1">
              Extra adjustment: positive (+) increases rent, negative (-) decreases rent
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
