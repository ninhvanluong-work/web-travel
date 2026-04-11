import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import { CalendarDays, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

import { DatePicker } from '@/components/ui/date-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateRange {
  fromDate: string;
  toDate: string;
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESETS = [
  { label: 'Hôm nay', getDates: () => ({ from: new Date(), to: new Date() }) },
  { label: '7 ngày qua', getDates: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: '30 ngày qua', getDates: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
];

function toIso(date: Date, isEnd: boolean): string {
  const d = isEnd ? endOfDay(date) : startOfDay(date);
  return d.toISOString();
}

export function DateRangeDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const hasValue = value.fromDate || value.toDate;

  function applyPreset(getDates: () => { from: Date; to: Date }) {
    const { from, to } = getDates();
    onChange({ fromDate: toIso(from, false), toDate: toIso(to, true) });
    setOpen(false);
  }

  function clearDates() {
    onChange({ fromDate: '', toDate: '' });
  }

  const label = (() => {
    if (!value.fromDate && !value.toDate) return 'Thời gian tạo';
    const from = value.fromDate ? format(new Date(value.fromDate), 'dd/MM/yy') : '...';
    const to = value.toDate ? format(new Date(value.toDate), 'dd/MM/yy') : '...';
    return `${from} – ${to}`;
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 text-xs h-8 px-2.5 rounded-lg border transition-colors ${
            hasValue
              ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <CalendarDays size={13} className={hasValue ? 'text-indigo-500' : 'text-gray-400'} />
          <span className="max-w-[160px] truncate">{label}</span>
          {hasValue ? (
            <X
              size={12}
              className="text-indigo-400 hover:text-indigo-700 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                clearDates();
              }}
            />
          ) : (
            <ChevronDown size={12} className="text-gray-400 shrink-0" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 space-y-3" align="start">
        {/* Preset buttons */}
        <div className="flex flex-col gap-1">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="text-xs text-left px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              onClick={() => applyPreset(preset.getDates)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Từ ngày</p>
            <DatePicker
              size="sm"
              value={value.fromDate ? new Date(value.fromDate) : undefined}
              onChange={(date) => onChange({ ...value, fromDate: date ? toIso(date, false) : '' })}
              placeholder="dd/mm/yyyy"
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Đến ngày</p>
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
