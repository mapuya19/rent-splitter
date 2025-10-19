'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SplitResult } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ResultsDisplayProps {
  results: SplitResult[];
  totalRent: number;
  totalUtilities: number;
  totalCustomExpenses: number;
  onShare: () => void;
}

export function ResultsDisplay({ results, totalRent, totalUtilities, totalCustomExpenses, onShare }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const text = `Rent Split Results\n` +
      `==================\n\n` +
      results.map(result => 
        `${result.roommateName}:\n` +
        `  Total: ${formatCurrency(result.totalShare)}\n` +
        `  - Rent Share: ${formatCurrency(result.rentShare)} (${Math.round(result.incomePercentage * 100)}% of income)\n` +
        `  - Utilities: ${formatCurrency(result.utilitiesShare)}\n` +
        (result.customExpensesShare > 0 ? `  - Other Expenses: ${formatCurrency(result.customExpensesShare)}\n` : '')
      ).join('\n') +
      `\n\nTotal: ${formatCurrency(totalSplit)}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalSplit = results.reduce((sum, result) => sum + result.totalShare, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Split Results</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.roommateId} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{result.roommateName}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(result.totalShare)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round(result.incomePercentage * 100)}% of income
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Rent Share</div>
                  <div className="font-medium">{formatCurrency(result.rentShare)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Utilities Share</div>
                  <div className="font-medium">{formatCurrency(result.utilitiesShare)}</div>
                </div>
                {result.customExpensesShare > 0 && (
                  <div className="col-span-2">
                    <div className="text-gray-600">Other Expenses Share</div>
                    <div className="font-medium">{formatCurrency(result.customExpensesShare)}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Split:</span>
              <span className="font-bold text-lg">
                {formatCurrency(totalSplit)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Original Total:</span>
              <span>{formatCurrency(totalRent + totalUtilities + totalCustomExpenses)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
