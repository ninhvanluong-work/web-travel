import { AnimatePresence } from 'framer-motion';
import React from 'react';

import { useAlertStore } from '@/stores/use-alert-store';

import { AlertToast } from './alert-toast';

export function GlobalAlertProvider() {
  const alerts = useAlertStore((state) => state.alerts);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none w-[calc(100%-32px)] max-w-[400px] flex flex-col gap-2"
    >
      <AnimatePresence initial={false} mode="sync">
        {alerts.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <AlertToast alert={alert} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
