'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { Icons } from '@/assets/icons';

interface ItineraryStep {
  step: number;
  time: string;
  title: string;
  description: string;
}

interface ItineraryAccordionProps {
  steps: ItineraryStep[];
}

export default function ItineraryAccordion({ steps }: ItineraryAccordionProps) {
  const [openStep, setOpenStep] = useState<number | null>(null);

  const toggle = (step: number) => setOpenStep(openStep === step ? null : step);

  return (
    <div className="px-[18px] pb-[22px] border-t border-black/[0.08] pt-6">
      <p className="text-base font-medium">Itinerary</p>
      <p className="text-[12px] text-[#888884] mt-0.5">tap to see details for each leg</p>

      <div className="mt-4 flex flex-col gap-2.5">
        {steps.map((step) => {
          const isOpen = openStep === step.step;
          return (
            <div key={step.step} className="border border-black/[0.08] rounded-[14px] overflow-hidden bg-[#F1EFE8]">
              <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => toggle(step.step)}>
                <span className="w-8 h-8 rounded-full bg-white border border-black/[0.1] flex items-center justify-center text-[13px] font-medium flex-shrink-0">
                  {step.step}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-[#888884]">{step.time}</p>
                  <p className="text-[14px] font-medium mt-0.5">{step.title}</p>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <Icons.chevronRight className="w-[14px] h-[14px] opacity-50" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      className="px-4 pb-4 text-[13px] text-[#888884] leading-[1.55] [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mt-1"
                      dangerouslySetInnerHTML={{ __html: step.description }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
