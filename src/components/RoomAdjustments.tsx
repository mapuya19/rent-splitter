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

  const handleCustomAdjustmentChange = (value: number) => {
    onAdjustmentsChange({
      ...adjustments,
      adjustmentPercentage: value,
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
        <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Private Bathroom (+15%)</label>
          <Toggle
            checked={adjustments.hasPrivateBathroom}
            onChange={(e) => handleToggleChange('hasPrivateBathroom', e.target.checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">No Window (-10%)</label>
          <Toggle
            checked={!adjustments.hasWindow}
            onChange={(e) => handleToggleChange('hasWindow', !e.target.checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">No Door (-5%)</label>
          <Toggle
            checked={!adjustments.hasDoor}
            onChange={(e) => handleToggleChange('hasDoor', !e.target.checked)}
          />
        </div>
        
        <div className="pt-2 border-t">
          <NumberInput
            label="Custom Adjustment (%)"
            value={adjustments.adjustmentPercentage || 0}
            onValueChange={handleCustomAdjustmentChange}
            placeholder="0"
            min={-50}
            max={50}
            step={1}
          />
          <p className="text-xs text-gray-500 mt-1">
            Additional adjustment (-50% to +50%)
          </p>
        </div>
        </CardContent>
      )}
    </Card>
  );
}
