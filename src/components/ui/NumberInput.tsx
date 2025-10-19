import { InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  onValueChange?: (value: number) => void;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, label, error, onValueChange, value, ...props }, ref) => {
    const [inputValue, setInputValue] = useState(String(value || ''));

    // Update input value when prop value changes
    useEffect(() => {
      setInputValue(String(value || ''));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      // Allow empty string, numbers, and one decimal point
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setInputValue(value);
        
        // Convert to number and call onValueChange if valid
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
          onValueChange?.(numValue);
        } else if (value === '') {
          onValueChange?.(0);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter
      if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (e.keyCode === 65 && e.ctrlKey === true) ||
          (e.keyCode === 67 && e.ctrlKey === true) ||
          (e.keyCode === 86 && e.ctrlKey === true) ||
          (e.keyCode === 88 && e.ctrlKey === true) ||
          // Allow: home, end, left, right, down, up
          (e.keyCode >= 35 && e.keyCode <= 40)) {
        return;
      }
      
      // Allow decimal point (period key) - but only one
      if (e.key === '.' && !inputValue.includes('.')) {
        return;
      }
      
      // Allow numbers (0-9) on both main keyboard and numpad
      if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
        return;
      }
      
      // Block everything else
      e.preventDefault();
    };

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          className={clsx(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
