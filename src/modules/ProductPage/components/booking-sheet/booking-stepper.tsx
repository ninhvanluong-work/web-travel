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
            {/* Each step gets equal flex space, centered */}
            <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0',
                  isCompleted || isActive ? 'bg-[#0F6E56] text-white' : 'bg-[#EBEBEB] text-[#AAA]'
                )}
              >
                {isCompleted ? <Check size={13} strokeWidth={2.5} /> : stepNum}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium text-center leading-none whitespace-nowrap',
                  isActive || isCompleted ? 'text-[#0F6E56]' : 'text-[#BBB]'
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line centered on the circle row */}
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-[2px] mt-[13px] mx-1',
                  'w-full flex-[0.8]',
                  stepNum < currentStep ? 'bg-[#0F6E56]' : 'bg-[#E5E5E5]'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
