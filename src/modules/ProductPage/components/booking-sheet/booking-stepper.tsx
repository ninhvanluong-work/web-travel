import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

const STEPS = ['Info', 'Options', 'Review', 'Payment'] as const;

interface BookingStepperProps {
  currentStep: number;
}

export default function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <div className="flex items-start px-4 py-4 bg-white border-b border-black/[0.07]">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <React.Fragment key={label}>
            <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 overflow-hidden',
                  isCompleted || isActive ? 'bg-[#0F6E56] text-white' : 'bg-[#EBEBEB] text-[#AAA]'
                )}
              >
                <AnimatePresence initial={false} mode="wait">
                  {isCompleted ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 30 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="flex items-center justify-center"
                    >
                      <Check size={13} strokeWidth={2.5} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key={`num-${stepNum}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      {stepNum}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              <span
                className={cn(
                  'text-[10px] font-medium text-center leading-none whitespace-nowrap',
                  isActive || isCompleted ? 'text-[#0F6E56]' : 'text-[#BBB]'
                )}
              >
                {label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div className="h-[2px] mt-[13px] mx-1 w-full flex-[0.8] bg-[#E5E5E5] relative overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 bottom-0 bg-[#0F6E56]"
                  initial={{ width: '0%' }}
                  animate={{ width: stepNum < currentStep ? '100%' : '0%' }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
