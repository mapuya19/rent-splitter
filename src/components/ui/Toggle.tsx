import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className={clsx(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              props.checked ? 'bg-blue-600' : 'bg-gray-200'
            )}
            onClick={() => {
              if (props.onChange) {
                const event = {
                  target: { checked: !props.checked }
                } as React.ChangeEvent<HTMLInputElement>;
                props.onChange(event);
              }
            }}
          >
            <span
              className={clsx(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                props.checked ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
          {description && (
            <span className="text-sm text-gray-600">
              {description}
            </span>
          )}
        </div>
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          {...props}
        />
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
