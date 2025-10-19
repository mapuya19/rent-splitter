'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CustomExpense } from '@/types';

interface CustomExpensesFormProps {
  customExpenses: CustomExpense[];
  onCustomExpensesChange: (expenses: CustomExpense[]) => void;
}

export function CustomExpensesForm({ customExpenses, onCustomExpensesChange }: CustomExpensesFormProps) {
  const [newExpense, setNewExpense] = useState({ name: '', amount: '' });

  const addExpense = () => {
    if (newExpense.name.trim() && newExpense.amount) {
      const amount = parseFloat(newExpense.amount);
      if (amount > 0) {
        const expense: CustomExpense = {
          id: Math.random().toString(36).substring(2, 15),
          name: newExpense.name.trim(),
          amount,
        };
        onCustomExpensesChange([...customExpenses, expense]);
        setNewExpense({ name: '', amount: '' });
      }
    }
  };

  const removeExpense = (id: string) => {
    onCustomExpensesChange(customExpenses.filter(expense => expense.id !== id));
  };

  const updateExpense = (id: string, field: keyof CustomExpense, value: string | number) => {
    onCustomExpensesChange(
      customExpenses.map(expense =>
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Monthly Expenses</CardTitle>
        <p className="text-sm text-gray-600">These will be split evenly between all roommates</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {customExpenses.map((expense, index) => (
          <div key={expense.id} className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label="Expense Name"
                value={expense.name}
                onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                placeholder="e.g., Internet, Cable, Cleaning"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Amount"
                type="number"
                value={expense.amount || ''}
                onChange={(e) => updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeExpense(expense.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label="Expense Name"
              value={newExpense.name}
              onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
              placeholder="e.g., Internet, Cable, Cleaning"
            />
          </div>
          <div className="flex-1">
            <Input
              label="Amount"
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              placeholder="0"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addExpense}
            disabled={!newExpense.name.trim() || !newExpense.amount}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
