'use client';

import { useState, useEffect } from 'react';
import { RoommateForm } from '@/components/RoommateForm';
import { RentForm } from '@/components/RentForm';
import { CustomExpensesForm } from '@/components/CustomExpensesForm';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { CurrencySelector } from '@/components/CurrencySelector';
import { TwoStateToggle } from '@/components/ui/TwoStateToggle';
import { Roommate, SplitResult, CalculationData, CustomExpense } from '@/types';
import { calculateRentSplit } from '@/utils/calculations';
import { compressCalculationData, decompressCalculationData } from '@/utils/compression';
import { Calculator, Users, DollarSign } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function Home() {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [totalRent, setTotalRent] = useState(0);
  const [utilities, setUtilities] = useState(0);
  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>([]);
  const [results, setResults] = useState<SplitResult[]>([]);
  const [useRoomSizeSplit, setUseRoomSizeSplit] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Calculate results whenever inputs change
  useEffect(() => {
    if (roommates.length > 0 && totalRent > 0) {
      const calculationData: CalculationData = {
        totalRent,
        utilities,
        customExpenses,
        roommates,
        currency: selectedCurrency,
      };
      const splitResults = calculateRentSplit(calculationData, useRoomSizeSplit);
      setResults(splitResults);
    } else {
      setResults([]);
    }
  }, [roommates, totalRent, utilities, customExpenses, useRoomSizeSplit, selectedCurrency]);

  const handleShare = async () => {
    // Prepare calculation data for sharing
    const calculationData: CalculationData = {
      totalRent,
      utilities,
      customExpenses,
      roommates,
      currency: selectedCurrency,
      useRoomSizeSplit,
    };
    
    try {
      // Compress data for shorter URLs
      const compressedData = compressCalculationData(calculationData);
      
      // Create shareable URL with compressed data
      const shareableUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}?data=${compressedData}`;
      
      if (typeof window !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(shareableUrl);
      }
      
      // Show success message with compression info
      const originalLength = JSON.stringify(calculationData).length;
      const compressionRatio = Math.round((1 - compressedData.length / originalLength) * 100);
      alert(`Shareable link copied to clipboard!\n\nURL compressed by ${compressionRatio}% (${originalLength} → ${compressedData.length} chars)`);
    } catch (error) {
      console.error('Failed to create shareable link:', error);
      alert('Failed to create shareable link. Please try again.');
    }
  };

  // Load shared calculation on page load
  useEffect(() => {
    const loadSharedData = () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');
        
        if (encodedData) {
          try {
            // Decompress data
            const calculationData: CalculationData = decompressCalculationData(encodedData);
            
            // Load the shared data into the form
            setRoommates(calculationData.roommates);
            setTotalRent(calculationData.totalRent);
            setUtilities(calculationData.utilities);
            setCustomExpenses(calculationData.customExpenses || []);
            
            // Load currency and split method if available
            if (calculationData.currency) {
              setSelectedCurrency(calculationData.currency);
            }
            if (calculationData.useRoomSizeSplit !== undefined) {
              setUseRoomSizeSplit(calculationData.useRoomSizeSplit);
            }
            
            // Clean up URL to remove the data parameter
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('data');
            window.history.replaceState({}, '', newUrl.toString());
          } catch (error) {
            console.error('Failed to load shared calculation:', error);
            alert('Invalid shared data. Please check the link and try again.');
          }
        }
      }
    };
    
    loadSharedData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
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
            
            {/* Mobile-only controls */}
            <div className="lg:hidden space-y-6">
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
              
              {/* Split Method Toggle */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rent Split Method</h3>
                <div className="flex items-center justify-center mb-4">
                  <TwoStateToggle
                    leftLabel="Room Size"
                    rightLabel="Income"
                    value={!useRoomSizeSplit}
                    onChange={(value) => setUseRoomSizeSplit(!value)}
                  />
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  {useRoomSizeSplit ? (
                    <>
                      <p className="font-medium text-gray-900 text-center">Room Size Split (Recommended)</p>
                      <p>Best for <strong>friends or strangers</strong> living together. Rent is split based on room square footage, with adjustments for room features like private bathrooms, windows, and doors.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-900 text-center">Income-Based Split</p>
                      <p>Best for <strong>couples or families</strong> living together. Rent is split based on annual income - higher earners pay proportionally more.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <RoommateForm
              roommates={roommates}
              onRoommatesChange={setRoommates}
              useRoomSizeSplit={useRoomSizeSplit}
            />
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {results.length > 0 ? (
              <ResultsDisplay
                results={results}
                useRoomSizeSplit={useRoomSizeSplit}
                selectedCurrency={selectedCurrency}
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
            
            {/* Desktop-only controls */}
            <div className="hidden lg:block space-y-6">
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
              
              {/* Split Method Toggle */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rent Split Method</h3>
                <div className="flex items-center justify-center mb-4">
                  <TwoStateToggle
                    leftLabel="Room Size"
                    rightLabel="Income"
                    value={!useRoomSizeSplit}
                    onChange={(value) => setUseRoomSizeSplit(!value)}
                  />
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  {useRoomSizeSplit ? (
                    <>
                      <p className="font-medium text-gray-900 text-center">Room Size Split (Recommended)</p>
                      <p>Best for <strong>friends or strangers</strong> living together. Rent is split based on room square footage, with adjustments for room features like private bathrooms, windows, and doors.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-900 text-center">Income-Based Split</p>
                      <p>Best for <strong>couples or families</strong> living together. Rent is split based on annual income - higher earners pay proportionally more.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
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
      <Footer />
    </div>
  );
}