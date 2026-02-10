import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Spinner } from './spinner';

const buttonVariants = cva(
  'relative inline-flex items-center active:scale-90 justify-center text-sm font-medium ring-offset-background ' +
    'transition-transform focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group/button',
  {
    variants: {
      variant: {
        primary: 'text-black bg-green-grad-1 border border-neon-400 hover:bg-primary/90',
        secondary: 'text-neutral-900 bg-neutral-grad-3 border border-neutral-300',
        disable: 'text-neutral-500 bg-neutral-grad-3 border border-neutral-300',
        ghost: 'text-neutral-900 hover:bg-neutral-200',
      },
      rounded: {
        default: 'rounded-sm',
        full: 'rounded-full',
        md: 'rounded-md',
        none: 'rounded-none',
      },
      text: {
        default: 'text-sm',
        xs: 'text-xs',
        lg: 'text-lg',
      },
      size: {
        md: 'h-[1.5rem]',
        xs: 'h-[2rem]',
        lg: 'h-[2.5rem]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'full',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  blur?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      type = 'button',
      size,
      fullWidth,
      rounded,
      asChild = false,
      loading,
      blur = true,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        disabled={props.disabled}
        className={cn(fullWidth && 'w-full', buttonVariants({ variant, rounded, size, className }))}
        ref={ref}
        type={type}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {!loading && children}
            {loading && <Spinner className="ml-4" />}
            {blur && (
              <span
                className={cn(
                  'bg-neon-400 filter blur-xl bottom-0 absolute z-10 w-[3.375rem] h-[1rem] group-hover/button:hidden'
                )}
              ></span>
            )}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
