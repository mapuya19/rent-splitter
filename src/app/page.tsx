'use client';

import { useState, useEffect } from 'react';
import { RoommateForm } from '@/components/RoommateForm';
import { RentForm } from '@/components/RentForm';
import { CustomExpensesForm } from '@/components/CustomExpensesForm';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { Roommate, SplitResult, CalculationData, CustomExpense } from '@/types';
import { calculateRentSplit, generateShareableId } from '@/utils/calculations';
import { Calculator, Users, DollarSign } from 'lucide-react';

export default function Home() {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [totalRent, setTotalRent] = useState(0);
  const [utilities, setUtilities] = useState(0);
  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>([]);
  const [results, setResults] = useState<SplitResult[]>([]);
  const [shareableId, setShareableId] = useState<string | null>(null);

  // Calculate results whenever inputs change
  useEffect(() => {
    if (roommates.length > 0 && totalRent > 0) {
      const calculationData: CalculationData = {
        totalRent,
        utilities,
        customExpenses,
        roommates,
      };
      const splitResults = calculateRentSplit(calculationData);
      setResults(splitResults);
    } else {
      setResults([]);
    }
  }, [roommates, totalRent, utilities, customExpenses]);

  const handleShare = () => {
    const id = generateShareableId();
    setShareableId(id);
    
    // Store calculation data in localStorage for sharing
    const calculationData: CalculationData = {
      totalRent,
      utilities,
      customExpenses,
      roommates,
    };
    
    localStorage.setItem(`rent-split-${id}`, JSON.stringify(calculationData));
    
    // Copy shareable link to clipboard
    const shareableUrl = `${window.location.origin}?share=${id}`;
    navigator.clipboard.writeText(shareableUrl);
    
    // Show success message (you could add a toast notification here)
    alert('Shareable link copied to clipboard!');
  };

  // Load shared calculation on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    
    if (shareId) {
      const storedData = localStorage.getItem(`rent-split-${shareId}`);
      if (storedData) {
        try {
          const calculationData: CalculationData = JSON.parse(storedData);
          setRoommates(calculationData.roommates);
          setTotalRent(calculationData.totalRent);
          setUtilities(calculationData.utilities);
          setCustomExpenses(calculationData.customExpenses || []);
        } catch (error) {
          console.error('Failed to load shared calculation:', error);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Rent Splitter</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Split rent proportionally based on income and utilities evenly between roommates. 
            Generate shareable links to collaborate with your roommates.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <RentForm
              totalRent={totalRent}
              utilities={utilities}
              onRentChange={setTotalRent}
              onUtilitiesChange={setUtilities}
            />
            
            <CustomExpensesForm
              customExpenses={customExpenses}
              onCustomExpensesChange={setCustomExpenses}
            />
            
            <RoommateForm
              roommates={roommates}
              onRoommatesChange={setRoommates}
            />
          </div>

          {/* Results Section */}
          <div>
            {results.length > 0 ? (
              <ResultsDisplay
                results={results}
                totalRent={totalRent}
                totalUtilities={utilities}
                totalCustomExpenses={customExpenses.reduce((sum, expense) => sum + expense.amount, 0)}
                onShare={handleShare}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Add roommates to get started
                </h3>
                <p className="text-gray-600">
                  Enter rent amount, utilities, and roommate information to see the split calculation.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Rent Split</h3>
                <p className="text-sm text-gray-600">
                  Rent is split proportionally based on each roommate's income. 
                  Higher earners pay more rent.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Utilities & Other Expenses</h3>
                <p className="text-sm text-gray-600">
                  Utilities and additional expenses are split evenly between all roommates, 
                  regardless of income.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}