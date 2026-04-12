import * as SelectPrimitive from '@radix-ui/react-select';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { Check } from 'lucide-react';
import * as React from 'react';

import { Icons } from '@/assets/icons';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>((props, ref) => {
  return (
    <div className="truncate whitespace-nowrap">
      <SelectPrimitive.Value ref={ref} {...props} />
    </div>
  );
});

export const selectTriggerVariants = cva(
  cn(
    'flex items-center justify-between focus:outline-none bg-transparent text-sm disabled:cursor-not-allowed disabled:opacity-50 peer',
    'shadow-theme-xs placeholder:text-gray-400 dark:placeholder:text-white/30'
  ),
  {
    variants: {
      variant: {
        default: cn(
          'border border-gray-300 dark:border-gray-700',
          'focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10',
          'dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800',
          'text-gray-800 dark:text-white/90'
        ),
        ghost: 'border-none shadow-none hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-0 px-2 py-1',
      },
      inputSize: {
        sm: 'h-11 px-3 py-2.5 rounded-lg',
        default: 'h-14 p-3 rounded-lg',
        mixin: 'p-0 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {
  fullWidth?: boolean;
}

const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, SelectTriggerProps>(
  ({ className, variant, inputSize, fullWidth, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(fullWidth && 'w-full', selectTriggerVariants({ variant, inputSize, className }))}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <Icons.arrowDown className="min-w-[24px]" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <Icons.chevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <Icons.chevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & { usePortal?: boolean }
>(({ className, children, position = 'popper', usePortal = true, ...props }, ref) => {
  const content = (
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden',
        'rounded-xl border border-gray-200 bg-white shadow-theme-lg',
        'dark:border-gray-800 dark:bg-gray-900',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1 max-h-60 overflow-y-auto',
          position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  );

  if (!usePortal) return content;

  return <SelectPrimitive.Portal>{content}</SelectPrimitive.Portal>;
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)} {...props} />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-lg py-2 pl-8 pr-2 text-sm outline-none',
      'text-gray-700 dark:text-gray-300',
      'focus:bg-brand-50 focus:text-brand-700 dark:focus:bg-brand-500/10 dark:focus:text-brand-400',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('bg-muted -mx-1 my-1 h-px', className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue };
