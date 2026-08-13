import { addDays, endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import { CalendarDays, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { DatePicker } from '@/components/ui/date-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DateRange {
  fromDate: string;
  toDate: string;
}

function toIso(date: Date, isEnd: boolean): string {
  const d = isEnd ? endOfDay(date) : startOfDay(date);
  return d.toISOString();
}

const PRESETS = [
  {
    labelKey: 'bookingPresetToday',
    getDates: () => ({ from: new Date(), to: new Date() }),
  },
  {
    labelKey: 'bookingPresetNext7',
    getDates: () => ({ from: new Date(), to: addDays(new Date(), 6) }),
  },
  {
    labelKey: 'bookingPresetThisMonth',
    getDates: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
  },
];

interface BookingDateRangeDropdownProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function BookingDateRangeDropdown({ value, onChange }: BookingDateRangeDropdownProps) {
  const { t } = useTranslation('adminPage');
  const [open, setOpen] = useState(false);
  const hasValue = value.fromDate || value.toDate;

  function applyPreset(getDates: () => { from: Date; to: Date }) {
    const { from, to } = getDates();
    onChange({ fromDate: toIso(from, false), toDate: toIso(to, true) });
    setOpen(false);
  }

  function formatLabel() {
    if (!value.fromDate && !value.toDate) return t('bookingDatePlaceholder');
    const from = value.fromDate ? new Date(value.fromDate).toLocaleDateString('vi-VN') : '...';
    const to = value.toDate ? new Date(value.toDate).toLocaleDateString('vi-VN') : '...';
    return `${from} – ${to}`;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-2 h-11 px-3 py-2.5 rounded-xl border text-sm shadow-theme-xs transition-colors min-w-[180px]',
            hasValue
              ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90'
          )}
        >
          <CalendarDays size={15} className={hasValue ? 'text-brand-500 shrink-0' : 'text-gray-400 shrink-0'} />
          <span className="flex-1 text-left truncate text-sm">{formatLabel()}</span>
          {hasValue ? (
            <X
              size={14}
              className="text-brand-400 hover:text-brand-700 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ fromDate: '', toDate: '' });
              }}
            />
          ) : (
            <ChevronDown size={14} className="text-gray-400 shrink-0" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 space-y-3" align="start">
        <div className="flex flex-col gap-1">
          {PRESETS.map((preset) => (
            <button
              key={preset.labelKey}
              type="button"
              className="text-xs text-left px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              onClick={() => applyPreset(preset.getDates)}
            >
              {t(preset.labelKey)}
            </button>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{t('bookingFromDate')}</p>
            <DatePicker
              size="sm"
              value={value.fromDate ? new Date(value.fromDate) : undefined}
              onChange={(date) => onChange({ ...value, fromDate: date ? toIso(date, false) : '' })}
              placeholder="dd/mm/yyyy"
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{t('bookingToDate')}</p>
            <DatePicker
              size="sm"
              value={value.toDate ? new Date(value.toDate) : undefined}
              onChange={(date) => onChange({ ...value, toDate: date ? toIso(date, true) : '' })}
              placeholder="dd/mm/yyyy"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
