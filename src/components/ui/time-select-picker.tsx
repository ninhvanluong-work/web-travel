import * as React from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface TimeSelectPickerProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function TimeSelectPicker({ value, onChange, disabled }: TimeSelectPickerProps) {
  let currentHour = '08';
  let currentMinute = '00';
  if (value && value.includes(':')) {
    const [h, m] = value.split(':');
    if (h) currentHour = h;
    if (m) currentMinute = m;
  }

  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')), []);
  const minutes = React.useMemo(() => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')), []);

  return (
    <div className="w-full flex items-center gap-2">
      <Select disabled={disabled} value={currentHour} onValueChange={(h) => onChange(`${h}:${currentMinute}`)}>
        <SelectTrigger className="h-10 text-[13px] flex-1 bg-white border-slate-200 hover:bg-slate-50 transition-colors">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h} hour
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-slate-400 font-semibold shrink-0">:</span>

      <Select disabled={disabled} value={currentMinute} onValueChange={(m) => onChange(`${currentHour}:${m}`)}>
        <SelectTrigger className="h-10 text-[13px] flex-1 bg-white border-slate-200 hover:bg-slate-50 transition-colors">
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m} min
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
