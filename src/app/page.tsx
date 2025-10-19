'use client';

import { useState, useEffect } from 'react';
import { RoommateForm } from '@/components/RoommateForm';
import { RentForm } from '@/components/RentForm';
import { CustomExpensesForm } from '@/components/CustomExpensesForm';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { TwoStateToggle } from '@/components/ui/TwoStateToggle';
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
  const [useRoomSizeSplit, setUseRoomSizeSplit] = useState(false);

  // Calculate results whenever inputs change
  useEffect(() => {
    if (roommates.length > 0 && totalRent > 0) {
      const calculationData: CalculationData = {
        totalRent,
        utilities,
        customExpenses,
        roommates,
      };
      const splitResults = calculateRentSplit(calculationData, useRoomSizeSplit);
      setResults(splitResults);
    } else {
      setResults([]);
    }
  }, [roommates, totalRent, utilities, customExpenses, useRoomSizeSplit]);

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
    const shareableUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}?share=${id}`;
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl);
    }
    
    // Show success message (you could add a toast notification here)
    alert('Shareable link copied to clipboard!');
  };

  // Load shared calculation on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
            Split rent proportionally based on income or room size, and utilities evenly between roommates. 
            Generate shareable links to collaborate with your roommates.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            💡 <strong>Annual Income:</strong> Enter your yearly salary before taxes. The app will calculate monthly amounts automatically.
          </div>
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
            
            {/* Split Method Toggle */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rent Split Method</h3>
              <div className="flex items-center justify-center mb-4">
                <TwoStateToggle
                  leftLabel="Income"
                  rightLabel="Room Size"
                  value={useRoomSizeSplit}
                  onChange={setUseRoomSizeSplit}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                {useRoomSizeSplit 
                  ? "Rent will be split based on room square footage. Add room sizes below to use this method."
                  : "Rent will be split based on annual income. Higher earners pay more rent."
                }
              </p>
            </div>
            
            <RoommateForm
              roommates={roommates}
              onRoommatesChange={setRoommates}
              useRoomSizeSplit={useRoomSizeSplit}
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
                useRoomSizeSplit={useRoomSizeSplit}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Rent Split</h3>
                <p className="text-sm text-gray-600">
                  <strong>Income Mode:</strong> Rent split by annual income (higher earners pay more)<br/>
                  <strong>Room Size Mode:</strong> Rent split by square footage (larger rooms pay more)
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Utilities & Expenses</h3>
                <p className="text-sm text-gray-600">
                  Utilities and additional expenses are always split evenly between all roommates, 
                  regardless of income or room size.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Sharing & Collaboration</h3>
                <p className="text-sm text-gray-600">
                  Generate shareable links to collaborate with roommates. Copy formatted results 
                  to clipboard for easy sharing via text or email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}