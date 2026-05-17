import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

export const textAreaVariants = cva(
  cn(
    'border-input border placeholder:font-light bg-transparent ring-offset-background peer',
    'focus-visible:ring-brand-500/10 focus-visible:border-brand-300 flex w-full file:border-0 file:bg-transparent',
    'focus-visible:outline-none read-only:bg-readonly read-only:border-readonly-border read-only:cursor-default focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 bg-white rounded-lg',
    'dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-gray-500'
  ),
  {
    variants: {
      variant: {
        default: '',
        filled: 'bg-background',
        floating: '',
      },
      size: {
        default: 'min-h-14 py-4 px-3 text-sm rounded-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);
export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textAreaVariants> {
  fullWidth?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, size, fullWidth, variant = 'default', rows = 5, ...props }, ref) => {
    return (
      <textarea
        rows={rows}
        className={cn(textAreaVariants({ variant, size, className }), fullWidth && 'w-full')}
        ref={ref}
        {...props}
      />
    );
  }
);
TextArea.displayName = 'TextArea';

export { TextArea };
