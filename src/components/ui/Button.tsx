import { ButtonHTMLAttributes, forwardRef, useRef } from 'react';
import { clsx } from 'clsx';
import { animations } from '@/lib/animations';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, onClick, ...props }, ref) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef = (ref as React.RefObject<HTMLButtonElement>) || internalRef;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        animations.ripple(buttonRef.current, x, y);
      }
      onClick?.(e);
    };

    return (
      <button
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background touch-manipulation select-none relative overflow-hidden',
          {
            'bg-primary text-primary-foreground hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95 active:shadow-md button-shine': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:scale-105 hover:shadow-lg hover:shadow-secondary/25 active:scale-95 active:shadow-md': variant === 'secondary',
            'border border-input hover:scale-105 hover:shadow-lg active:scale-95': variant === 'outline',
          },
          {
            'h-9 px-3 text-sm min-h-[44px]': size === 'sm',
            'h-10 px-4 py-2 min-h-[44px]': size === 'md',
            'h-11 px-8 text-lg min-h-[44px]': size === 'lg',
          },
          className
        )}
        style={{ touchAction: 'manipulation' }}
        ref={buttonRef}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
