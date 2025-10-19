'use client';

import { NumberInput } from '@/components/ui/NumberInput';
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
        <NumberInput
          label="Total Monthly Rent"
          value={totalRent}
          onValueChange={onRentChange}
          placeholder="0"
        />
        <NumberInput
          label="Monthly Utilities"
          value={utilities}
          onValueChange={onUtilitiesChange}
          placeholder="0"
        />
      </CardContent>
    </Card>
  );
}
