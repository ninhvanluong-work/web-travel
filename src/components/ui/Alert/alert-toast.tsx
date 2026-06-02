import {
  CheckCircledIcon,
  Cross2Icon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type AlertItem, useAlertStore } from '@/stores/use-alert-store';

const ICON_MAP = {
  success: <CheckCircledIcon className="w-[18px] h-[18px] shrink-0" />,
  warning: <ExclamationTriangleIcon className="w-[18px] h-[18px] shrink-0" />,
  error: <CrossCircledIcon className="w-[18px] h-[18px] shrink-0" />,
  info: <InfoCircledIcon className="w-[18px] h-[18px] shrink-0" />,
} as const;

const PROGRESS_COLOR = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
  info: 'bg-sky-500',
} as const;

export function AlertToast({ alert }: { alert: AlertItem }) {
  const removeAlert = useAlertStore((state) => state.removeAlert);

  const defaultDuration = alert.type === 'success' || alert.type === 'info' ? 4000 : 0;
  const duration = alert.duration ?? defaultDuration;

  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingRef = useRef<number>(duration);

  useEffect(() => {
    if (duration === 0) return undefined;

    if (!isPaused) {
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, remainingRef.current - elapsed);
        setProgress((remaining / duration) * 100);

        if (remaining <= 0) {
          clearInterval(timerRef.current!);
          removeAlert(alert.id);
        }
      }, 20);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, duration, alert.id, removeAlert]);

  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      <Alert variant={alert.type} className="rounded-2xl shadow-lg backdrop-blur-md overflow-hidden py-4 px-5 pr-12">
        {ICON_MAP[alert.type]}

        <div className="space-y-1">
          <AlertTitle className="font-semibold text-[15px] leading-snug">{alert.title}</AlertTitle>

          {alert.description && (
            <AlertDescription className="text-sm opacity-90 leading-normal">{alert.description}</AlertDescription>
          )}

          {alert.action && (
            <Button
              variant="ghost"
              size="icon"
              blur={false}
              onClick={() => {
                alert.action?.onClick();
                removeAlert(alert.id);
              }}
              className="mt-2 h-auto px-0 text-xs font-semibold underline hover:no-underline hover:bg-transparent"
            >
              {alert.action.label}
            </Button>
          )}
        </div>

        <Button
          variant="icon"
          size="icon"
          rounded="full"
          blur={false}
          onClick={() => removeAlert(alert.id)}
          className="absolute top-3 right-3 p-1"
          aria-label="Close"
        >
          <Cross2Icon className="w-3.5 h-3.5" />
        </Button>

        {duration > 0 && (
          <div className={cn('absolute bottom-0 left-0 w-full h-[3px] bg-black/5')}>
            <div
              className={cn('h-full', PROGRESS_COLOR[alert.type])}
              style={{ width: `${progress}%`, transition: 'width 20ms linear' }}
            />
          </div>
        )}
      </Alert>
    </motion.div>
  );
}
