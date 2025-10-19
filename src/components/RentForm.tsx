'use client';

import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface RentFormProps {
  totalRent: number;
  utilities: number;
  onRentChange: (rent: number) => void;
  onUtilitiesChange: (utilities: number) => void;
}

export function RentForm({ totalRent, utilities, onRentChange, onUtilitiesChange }: RentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rent & Utilities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          label="Total Monthly Rent"
          type="number"
          value={totalRent || ''}
          onChange={(e) => onRentChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
        />
        <Input
          label="Monthly Utilities"
          type="number"
          value={utilities || ''}
          onChange={(e) => onUtilitiesChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
        />
      </CardContent>
    </Card>
  );
}
