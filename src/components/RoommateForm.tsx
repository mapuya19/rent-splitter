'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NumberInput } from '@/components/ui/NumberInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Roommate, RoomAdjustments } from '@/types';
import { RoomAdjustmentsComponent } from '@/components/RoomAdjustments';

interface RoommateFormProps {
  roommates: Roommate[];
  onRoommatesChange: (roommates: Roommate[]) => void;
  useRoomSizeSplit: boolean;
}

export function RoommateForm({ roommates, onRoommatesChange, useRoomSizeSplit }: RoommateFormProps) {
  const [newRoommate, setNewRoommate] = useState({ name: '', income: '', roomSize: '' });

  const addRoommate = () => {
    const hasRequiredField = useRoomSizeSplit ? newRoommate.roomSize : newRoommate.income;
    if (newRoommate.name.trim() && hasRequiredField) {
      const income = useRoomSizeSplit ? 0 : parseFloat(newRoommate.income);
      const roomSize = useRoomSizeSplit ? parseFloat(newRoommate.roomSize) : (newRoommate.roomSize ? parseFloat(newRoommate.roomSize) : undefined);
      
      if (useRoomSizeSplit ? (roomSize && roomSize > 0) : income > 0) {
        const roommate: Roommate = {
          id: Math.random().toString(36).substring(2, 15),
          name: newRoommate.name.trim(),
          income,
          roomSize,
        };
        onRoommatesChange([...roommates, roommate]);
        setNewRoommate({ name: '', income: '', roomSize: '' });
      }
    }
  };

  // Handle new roommate input changes
  const handleNewRoommateChange = (field: 'name' | 'income' | 'roomSize', value: string) => {
    setNewRoommate({ ...newRoommate, [field]: value });
  };

  // Auto-add roommate when both fields are filled and user finishes typing
  const handleNewRoommateBlur = () => {
    const hasRequiredField = useRoomSizeSplit ? newRoommate.roomSize : newRoommate.income;
    if (newRoommate.name.trim() && hasRequiredField) {
      const income = useRoomSizeSplit ? 0 : parseFloat(newRoommate.income);
      const roomSize = useRoomSizeSplit ? parseFloat(newRoommate.roomSize) : (newRoommate.roomSize ? parseFloat(newRoommate.roomSize) : undefined);
      
      if (useRoomSizeSplit ? (roomSize && roomSize > 0) : income > 0) {
        const roommate: Roommate = {
          id: Math.random().toString(36).substring(2, 15),
          name: newRoommate.name.trim(),
          income,
          roomSize,
        };
        onRoommatesChange([...roommates, roommate]);
        setNewRoommate({ name: '', income: '', roomSize: '' });
      }
    }
  };

  const removeRoommate = (id: string) => {
    onRoommatesChange(roommates.filter(roommate => roommate.id !== id));
  };

  const updateRoommate = (id: string, field: keyof Roommate, value: string | number) => {
    onRoommatesChange(
      roommates.map(roommate =>
        roommate.id === id ? { ...roommate, [field]: value } : roommate
      )
    );
  };

  const updateRoommateAdjustments = (id: string, adjustments: RoomAdjustments) => {
    onRoommatesChange(
      roommates.map(roommate =>
        roommate.id === id ? { ...roommate, adjustments } : roommate
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roommates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {roommates.map((roommate) => (
          <div key={roommate.id} className="space-y-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  label="Name"
                  value={roommate.name}
                  onChange={(e) => updateRoommate(roommate.id, 'name', e.target.value)}
                  placeholder="Roommate name"
                />
              </div>
              {!useRoomSizeSplit && (
                <div className="flex-1">
                  <NumberInput
                    label="Annual Income"
                    value={roommate.income}
                    onValueChange={(value) => updateRoommate(roommate.id, 'income', value)}
                    placeholder="0"
                  />
                </div>
              )}
              {useRoomSizeSplit && (
                <div className="flex-1">
                  <NumberInput
                    label="Room Size (sq ft)"
                    value={roommate.roomSize}
                    onValueChange={(value) => updateRoommate(roommate.id, 'roomSize', value)}
                    placeholder="0"
                  />
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeRoommate(roommate.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {useRoomSizeSplit && (
              <RoomAdjustmentsComponent
                adjustments={roommate.adjustments || {
                  hasPrivateBathroom: false,
                  hasWindow: true, // Default to having window (so "No Window" toggle is off)
                  hasFlexWall: false, // Default to no flex wall
                  adjustmentPercentage: 0,
                }}
                onAdjustmentsChange={(adjustments) => updateRoommateAdjustments(roommate.id, adjustments)}
              />
            )}
          </div>
        ))}
        
        <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label="Name"
                value={newRoommate.name}
                onChange={(e) => handleNewRoommateChange('name', e.target.value)}
                onBlur={handleNewRoommateBlur}
                placeholder="Roommate name"
              />
            </div>
            {!useRoomSizeSplit && (
              <div className="flex-1">
                <NumberInput
                  label="Annual Income"
                  value={newRoommate.income}
                  onValueChange={(value) => handleNewRoommateChange('income', value.toString())}
                  onBlur={handleNewRoommateBlur}
                  placeholder="0"
                />
              </div>
            )}
            {useRoomSizeSplit && (
              <div className="flex-1">
                <NumberInput
                  label="Room Size (sq ft)"
                  value={newRoommate.roomSize}
                  onValueChange={(value) => handleNewRoommateChange('roomSize', value.toString())}
                  onBlur={handleNewRoommateBlur}
                  placeholder="0"
                />
              </div>
            )}
          <Button
            variant="outline"
            size="sm"
            onClick={addRoommate}
            disabled={!newRoommate.name.trim() || (!useRoomSizeSplit ? !newRoommate.income : !newRoommate.roomSize)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
