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
          'relative inline-flex h-10 w-48 rounded-lg border border-gray-300 bg-white p-1',
          className
        )}
      >
        {/* Background slider */}
        <div
          className={clsx(
            'absolute top-1 bottom-1 w-1/2 rounded-md bg-blue-600 transition-transform duration-200 ease-in-out',
            value ? 'translate-x-full' : 'translate-x-0'
          )}
          style={{ left: '4px', width: 'calc(50% - 4px)' }}
        />
        
        {/* Left button */}
        <button
          type="button"
          className={clsx(
            'relative z-10 flex w-1/2 items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap text-center',
            !value ? 'text-white' : 'text-gray-700 hover:text-gray-900'
          )}
          onClick={() => onChange(false)}
        >
          <span className="text-center">{leftLabel}</span>
        </button>
        
        {/* Right button */}
        <button
          type="button"
          className={clsx(
            'relative z-10 flex w-1/2 items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap text-center',
            value ? 'text-white' : 'text-gray-700 hover:text-gray-900'
          )}
          onClick={() => onChange(true)}
        >
          <span className="text-center">{rightLabel}</span>
        </button>
      </div>
    );
  }
);

TwoStateToggle.displayName = 'TwoStateToggle';

export { TwoStateToggle };
