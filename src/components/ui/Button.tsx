import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background touch-manipulation select-none active:scale-[0.98]',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70': variant === 'secondary',
            'border border-input hover:bg-accent hover:text-accent-foreground active:bg-accent/80': variant === 'outline',
          },
          {
            'h-9 px-3 text-sm min-h-[44px]': size === 'sm',
            'h-10 px-4 py-2 min-h-[44px]': size === 'md',
            'h-11 px-8 text-lg min-h-[44px]': size === 'lg',
          },
          className
        )}
        style={{ touchAction: 'manipulation' }}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
