import * as React from 'react';

import { cn } from '@/lib/utils';

const STEP = 100_000;

export function formatVND(value: number): string {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('vi-VN').format(value);
}

function parseVND(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export interface PriceInputProps {
  value: number;
  onChange: (v: number) => void;
  className?: string;
}

const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(({ value, onChange, className }, ref) => {
  const [display, setDisplay] = React.useState(() => formatVND(value));
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => inputRef.current!);

  React.useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDisplay(formatVND(value));
    }
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplay(e.target.value);
    onChange(parseVND(e.target.value));
  }

  function handleBlur() {
    const clamped = Math.max(0, parseVND(display));
    onChange(clamped);
    setDisplay(formatVND(clamped));
  }

  function handleFocus() {
    const numeric = parseVND(display);
    setDisplay(numeric === 0 ? '' : String(numeric));
  }

  function step(delta: number) {
    const next = Math.max(0, (value || 0) + delta);
    onChange(next);
    setDisplay(formatVND(next));
  }

  return (
    <div
      className={cn(
        'flex items-stretch h-11 rounded-lg border border-input overflow-hidden w-full',
        'focus-within:ring-2 focus-within:ring-brand-500/10 focus-within:border-brand-300',
        className
      )}
    >
      <button
        type="button"
        onClick={() => step(-STEP)}
        tabIndex={-1}
        className="w-11 shrink-0 flex items-center justify-center border-r border-input bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors text-lg font-medium select-none"
      >
        −
      </button>

      <div className="relative flex-1 flex items-center">
        <input
          ref={inputRef}
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="0"
          className="w-full h-full px-2 text-sm text-center bg-transparent outline-none placeholder:text-gray-400"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 pointer-events-none select-none">
          VNĐ
        </span>
      </div>

      <button
        type="button"
        onClick={() => step(+STEP)}
        tabIndex={-1}
        className="w-11 shrink-0 flex items-center justify-center border-l border-input bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors text-lg font-medium select-none"
      >
        +
      </button>
    </div>
  );
});

PriceInput.displayName = 'PriceInput';

export { PriceInput };
