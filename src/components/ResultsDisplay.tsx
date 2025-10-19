'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SplitResult } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ResultsDisplayProps {
  results: SplitResult[];
  totalRent: number;
  totalUtilities: number;
  totalCustomExpenses: number;
  useRoomSizeSplit: boolean;
  selectedCurrency: string;
  onShare: () => void;
}

export function ResultsDisplay({ results, totalRent, totalUtilities, totalCustomExpenses, useRoomSizeSplit, selectedCurrency, onShare }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const text = `Rent Split Results\n` +
      `==================\n\n` +
      results.map(result => {
        const baseRent = result.rentShare - result.adjustmentAmount;
        return `${result.roommateName}:\n` +
        `  Total: ${formatCurrency(result.totalShare, selectedCurrency)}\n` +
        `  - Base Rent: ${formatCurrency(baseRent, selectedCurrency)} (${Math.round(result.incomePercentage * 100)}% ${useRoomSizeSplit ? 'of total space' : 'of income'})\n` +
        (result.adjustmentAmount !== 0 ? `  - Room Adjustments: ${result.adjustmentAmount > 0 ? '+' : ''}${formatCurrency(result.adjustmentAmount, selectedCurrency)}\n` +
        `  - Adjusted Rent: ${formatCurrency(result.rentShare, selectedCurrency)}\n` : '') +
        `  - Utilities: ${formatCurrency(result.utilitiesShare, selectedCurrency)}\n` +
        (result.customExpensesShare > 0 ? `  - Other Expenses: ${formatCurrency(result.customExpensesShare, selectedCurrency)}\n` : '');
      }).join('\n') +
      `\n\nTotal: ${formatCurrency(totalSplit, selectedCurrency)}`;
    
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
                    {formatCurrency(result.totalShare, selectedCurrency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round(result.incomePercentage * 100)}% {useRoomSizeSplit ? 'of total space' : 'of income'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Base Rent Share</div>
                    <div className="font-medium">{formatCurrency(result.rentShare - result.adjustmentAmount, selectedCurrency)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Utilities Share</div>
                    <div className="font-medium">{formatCurrency(result.utilitiesShare, selectedCurrency)}</div>
                  </div>
                </div>
                
                {result.adjustmentAmount !== 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-2">Room Adjustments</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Base Rent</span>
                        <span>{formatCurrency(result.rentShare - result.adjustmentAmount, selectedCurrency)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Adjustments</span>
                        <span className={`${result.adjustmentAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {result.adjustmentAmount > 0 ? '+' : ''}{formatCurrency(result.adjustmentAmount, selectedCurrency)}
                        </span>
                      </div>
                      <div className="border-t pt-1 flex justify-between font-medium">
                        <span>Adjusted Rent</span>
                        <span>{formatCurrency(result.rentShare, selectedCurrency)}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {result.customExpensesShare > 0 && (
                  <div>
                    <div className="text-gray-600 text-sm">Other Expenses Share</div>
                    <div className="font-medium">{formatCurrency(result.customExpensesShare, selectedCurrency)}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">
                {formatCurrency(totalSplit, selectedCurrency)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
