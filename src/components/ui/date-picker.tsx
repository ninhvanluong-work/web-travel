import { useClickOutside } from '@mantine/hooks';
import { format, isValid, parse } from 'date-fns';
import React from 'react';
import type { SelectSingleEventHandler } from 'react-day-picker';

import { Icons } from '@/assets/icons';
import usePopover from '@/hooks/usePopover';
import { isPastDate } from '@/lib/common';
import { cn } from '@/lib/utils';
import { useAlertStore } from '@/stores/use-alert-store';

import { Calendar, type CalendarProps } from './calendar';
import { Input, type InputProps } from './input';

export interface DatePickerProps extends Omit<InputProps, 'onChange' | 'value'> {
  onChange: (date?: Date) => void;
  value?: Date;
  calendarProps?: CalendarProps;
  disablePast?: boolean;
}
const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ onChange, value, onBlur, calendarProps, disablePast, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState<boolean>(false);
    const [inputValue, setInputValue] = React.useState<string>(() => {
      return value && isValid(value) ? format(value, 'dd/MM/yyyy') : '';
    });
    const [isOpen, floatingStyles, refs, { open, toggle, close }] = usePopover();
    const popoverRef = useClickOutside(close);

    React.useEffect(() => {
      if (isFocused) return;
      if (value && isValid(value)) {
        setInputValue(format(value, 'dd/MM/yyyy'));
      } else {
        setInputValue('');
      }
    }, [value, isFocused]);

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      setInputValue(e.currentTarget.value);
      const date = parse(e.currentTarget.value, 'dd/MM/yyyy', new Date());
      if (isValid(date)) {
        onChange(date);
      } else {
        onChange(undefined);
      }
    };

    const handleSelect: SelectSingleEventHandler = (date) => {
      if (!date) {
        return;
      }
      onChange(date);
      setInputValue(format(date, 'dd/MM/yyyy'));
      close();
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
      const date = parse(e.currentTarget.value, 'dd/MM/yyyy', new Date());
      if (disablePast) {
        if (isPastDate(date)) {
          setInputValue('');
          useAlertStore.getState().addAlert({ type: 'error', title: 'Date value must be in the future' });
          onChange(undefined);
          return;
        }
      }

      if (!isValid(date)) {
        setInputValue('');
        onChange(undefined);
      }
    };

    return (
      <div className="w-full">
        <div className="relative w-full" ref={refs.setReference}>
          <Input
            fullWidth
            {...props}
            suffix={<Icons.calendar className="cursor-pointer" onClick={toggle} />}
            ref={ref}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={open}
          />
        </div>
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className={cn('bg-popover shadow-popover left-0 z-50 min-h-[40px] w-fit min-w-max rounded-md outline-none')}
          >
            <div ref={popoverRef}>
              <Calendar
                {...calendarProps}
                mode="single"
                selected={value}
                defaultMonth={value}
                onSelect={handleSelect}
                disablePast={disablePast}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
