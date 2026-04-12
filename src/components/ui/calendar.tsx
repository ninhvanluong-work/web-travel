import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { isPastDate } from '@/lib/common';
import { cn } from '@/lib/utils';

import { Icons } from '../../assets/icons';
import { buttonVariants } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  disablePast?: boolean;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  disablePast,
  ...props
}: CalendarProps): JSX.Element {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('bg-background p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center gap-1',
        caption_label: 'text-sm font-medium hidden',
        caption_dropdowns: 'flex justify-center gap-1',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-32 w-32 bg-transparent p-0 hover:opacity-100 text-gray-900'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-fit border-collapse space-y-1 bg-background',
        head_row: 'flex',
        head_cell: 'text-muted-foreground rounded-md w-32 shrink-0 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2 rounded-md',
        cell: 'w-32 h-32 shrink-0 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(buttonVariants({ variant: 'ghost' }), 'h-32 w-32 p-0 font-normal aria-selected:opacity-100'),
        day_selected: 'bg-main hover:bg-main focus:bg-main hover:text-white text-white rounded-md',
        day_today: 'bg-accent text-accent-foreground',
        day_outside: 'text-muted-foreground opacity-40 invisible',
        day_disabled: 'text-muted-foreground opacity-40',
        day_range_middle: 'aria-selected:bg-indigo-100 aria-selected:text-indigo-800 rounded-md',
        day_hidden: 'invisible',
        dropdown: 'flex items-center',
        ...classNames,
      }}
      disabled={disablePast ? isPastDate : props.disabled}
      components={{
        IconLeft: () => <Icons.chevronLeft className="h-16 w-16" />,
        IconRight: () => <Icons.chevronRight className="h-16 w-16" />,
        Dropdown: ({ value, onChange, children, ..._dropdownProps }: any) => {
          const options = React.Children.toArray(children) as React.ReactElement<React.HTMLProps<HTMLOptionElement>>[];
          const selected = options.find((child) => child.props.value === value);
          const handleChange = (val: string) => {
            const changeEvent = {
              target: { value: val },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(changeEvent);
          };
          return (
            <Select value={value?.toString()} onValueChange={(v) => handleChange(v)}>
              <SelectTrigger
                variant="ghost"
                inputSize="mixin"
                className="h-24 w-fit gap-1 pl-2 pr-1 font-medium hover:bg-accent border-none shadow-none"
              >
                <SelectValue>{selected?.props.children}</SelectValue>
              </SelectTrigger>
              <SelectContent usePortal={false} className="max-h-80 overflow-y-auto">
                {options.map((option, id) => (
                  <SelectItem key={`${option.props.value}-${id}`} value={option.props.value?.toString() ?? ''}>
                    {option.props.children}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      }}
      captionLayout="dropdown"
      fromYear={1900}
      toYear={new Date().getFullYear() + 20}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
