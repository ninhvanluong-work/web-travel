import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

const numVariants = {
  enter: (d: number) => ({ y: d > 0 ? 15 : -15, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (d: number) => ({ y: d > 0 ? -15 : 15, opacity: 0 }),
};

interface GuestCounterProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}

export function GuestCounter({ value, min = 0, max = 99, onChange }: GuestCounterProps) {
  const prevValueRef = React.useRef(value);
  const scrollDirRef = React.useRef(1);

  if (value !== prevValueRef.current) {
    scrollDirRef.current = value > prevValueRef.current ? 1 : -1;
    prevValueRef.current = value;
  }

  const scrollDir = scrollDirRef.current;
  const isAtMin = value <= min;
  const isAtMax = value >= max;

  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={isAtMin}
        className={cn(
          'w-9 h-9 rounded-full border-2 flex items-center justify-center select-none',
          isAtMin ? 'border-[#DDD] text-[#CCC]' : 'border-[#0F6E56] text-[#0F6E56]'
        )}
      >
        <Minus size={16} strokeWidth={2.5} />
      </motion.button>

      <div className="w-6 h-7 flex items-center justify-center overflow-hidden relative">
        <AnimatePresence mode="popLayout" initial={false} custom={scrollDir}>
          <motion.span
            key={value}
            custom={scrollDir}
            variants={numVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="absolute text-[18px] font-bold tabular-nums text-[#111]"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={isAtMax}
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center select-none',
          isAtMax ? 'bg-[#DDD] text-[#AAA]' : 'bg-[#0F6E56] text-white'
        )}
      >
        <Plus size={16} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}

export function GuestCardSkeleton() {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[16px] px-5 py-5 flex items-center justify-between shadow-sm animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-16 bg-[#E5E5E5] rounded" />
        <div className="h-3 w-28 bg-[#F0F0F0] rounded" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#E5E5E5]" />
        <div className="w-6 h-5 bg-[#E5E5E5] rounded" />
        <div className="w-9 h-9 rounded-full bg-[#E5E5E5]" />
      </div>
    </div>
  );
}
