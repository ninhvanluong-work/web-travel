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
        /** Icon-only button on light bg — hover neutral fill */
        icon: 'text-neutral-600 hover:bg-neutral-100',
        /** Glass button on dark video overlay — back button style */
        glass: 'bg-black/30 border border-white/[0.15] text-white backdrop-blur-md hover:bg-black/50',
        /** Lighter glass button on dark overlay — mute button in TikTok slide */
        glassLight: 'bg-white/[0.12] border border-white/20 text-white backdrop-blur-sm',
        /** Semi-opaque overlay button on video — grid card mute */
        overlay: 'bg-black/55 text-white/80',
        /** Fully transparent — like button in TikTok slide */
        transparent: 'bg-transparent text-white',
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
        /** No fixed height — button sizes from padding + icon content */
        icon: '',
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
