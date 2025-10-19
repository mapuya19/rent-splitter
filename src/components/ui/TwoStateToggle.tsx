import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface TwoStateToggleProps {
  leftLabel: string;
  rightLabel: string;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

const TwoStateToggle = forwardRef<HTMLDivElement, TwoStateToggleProps>(
  ({ leftLabel, rightLabel, value, onChange, className }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'relative inline-flex h-10 rounded-lg border border-gray-300 bg-white p-1',
          className
        )}
      >
        {/* Background slider */}
        <div
          className={clsx(
            'absolute top-1 bottom-1 w-1/2 rounded-md bg-blue-600 transition-transform duration-200 ease-in-out',
            value ? 'translate-x-full' : 'translate-x-0'
          )}
        />
        
        {/* Left button */}
        <button
          type="button"
          className={clsx(
            'relative z-10 flex w-1/2 items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200',
            !value ? 'text-white' : 'text-gray-700 hover:text-gray-900'
          )}
          onClick={() => onChange(false)}
        >
          {leftLabel}
        </button>
        
        {/* Right button */}
        <button
          type="button"
          className={clsx(
            'relative z-10 flex w-1/2 items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200',
            value ? 'text-white' : 'text-gray-700 hover:text-gray-900'
          )}
          onClick={() => onChange(true)}
        >
          {rightLabel}
        </button>
      </div>
    );
  }
);

TwoStateToggle.displayName = 'TwoStateToggle';

export { TwoStateToggle };
