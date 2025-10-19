'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Roommate } from '@/types';

interface RoommateFormProps {
  roommates: Roommate[];
  onRoommatesChange: (roommates: Roommate[]) => void;
}

export function RoommateForm({ roommates, onRoommatesChange }: RoommateFormProps) {
  const [newRoommate, setNewRoommate] = useState({ name: '', income: '' });

  const addRoommate = () => {
    if (newRoommate.name.trim() && newRoommate.income) {
      const income = parseFloat(newRoommate.income);
      if (income > 0) {
        const roommate: Roommate = {
          id: Math.random().toString(36).substring(2, 15),
          name: newRoommate.name.trim(),
          income,
        };
        onRoommatesChange([...roommates, roommate]);
        setNewRoommate({ name: '', income: '' });
      }
    }
  };

  // Handle new roommate input changes
  const handleNewRoommateChange = (field: 'name' | 'income', value: string) => {
    setNewRoommate({ ...newRoommate, [field]: value });
  };

  // Auto-add roommate when both fields are filled and user finishes typing
  const handleNewRoommateBlur = () => {
    if (newRoommate.name.trim() && newRoommate.income) {
      const income = parseFloat(newRoommate.income);
      if (income > 0) {
        const roommate: Roommate = {
          id: Math.random().toString(36).substring(2, 15),
          name: newRoommate.name.trim(),
          income,
        };
        onRoommatesChange([...roommates, roommate]);
        setNewRoommate({ name: '', income: '' });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roommates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {roommates.map((roommate, index) => (
          <div key={roommate.id} className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label="Name"
                value={roommate.name}
                onChange={(e) => updateRoommate(roommate.id, 'name', e.target.value)}
                placeholder="Roommate name"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Monthly Income"
                type="number"
                value={roommate.income || ''}
                onChange={(e) => updateRoommate(roommate.id, 'income', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeRoommate(roommate.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
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
            <div className="flex-1">
              <Input
                label="Monthly Income"
                type="number"
                value={newRoommate.income}
                onChange={(e) => handleNewRoommateChange('income', e.target.value)}
                onBlur={handleNewRoommateBlur}
                placeholder="0"
              />
            </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addRoommate}
            disabled={!newRoommate.name.trim() || !newRoommate.income}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
