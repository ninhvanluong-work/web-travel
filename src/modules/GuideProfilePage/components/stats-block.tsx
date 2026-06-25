import { animate, useInView } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { useAlertStore } from '@/stores/use-alert-store';

import type { GuideProfileData } from '../data/mock-guide';

interface StatsBlockProps {
  metrics: GuideProfileData['metrics'];
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  useEffect(() => {
    if (!inView || !ref.current) return undefined;
    const el = ref.current;
    const controls = animate(0, value, {
      duration: 1,
      ease: 'easeOut',
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}

export default function StatsBlock({ metrics }: StatsBlockProps) {
  const { t } = useTranslation('guidePage');
  return (
    <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
      <div className="grid grid-cols-3 text-center">
        <div>
          <p className="text-[26px] font-medium text-neutral-black leading-none tracking-[-0.5px]">
            <AnimatedNumber value={metrics.toursLed} />
          </p>
          <p className="text-caption2 text-neutral-500 mt-1.5">{t('toursLed')}</p>
        </div>

        <div className="border-x border-neutral-200">
          <p className="text-[26px] font-medium text-neutral-black leading-none tracking-[-0.5px]">
            <AnimatedNumber value={metrics.yearsOfExperience} />
            <span className="text-[14px] text-neutral-500 font-normal"> {t('years')}</span>
          </p>
          <p className="text-caption2 text-neutral-500 mt-1.5">{t('inCareer')}</p>
        </div>

        <div
          className="cursor-pointer"
          onClick={() => {
            if (metrics.languages.length > 3) {
              useAlertStore.getState().addAlert({
                type: 'info',
                title: t('languages'),
                description: metrics.languages.join(' · '),
              });
            }
          }}
        >
          <p className="text-[26px] font-medium text-neutral-black leading-none tracking-[-0.5px]">
            <AnimatedNumber value={metrics.languages.length} />
            <span className="text-[14px] text-neutral-500 font-normal"> {t('languages')}</span>
          </p>
          <p className="text-caption2 text-neutral-500 mt-1.5">
            {metrics.languages.length > 3
              ? `${metrics.languages.slice(0, 3).join(' · ')} (+${metrics.languages.length - 3})`
              : metrics.languages.join(' · ')}
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        fullWidth
        blur={false}
        className="mt-4 text-[11px] text-neutral-500 py-2 gap-1 rounded-md"
      >
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="inline-block">
          <path
            d="M3 4H13M3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4M3 4L4 2H12L13 4M6 7V11M10 7V11"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        {t('dispatchTours')}
      </Button>
    </div>
  );
}
