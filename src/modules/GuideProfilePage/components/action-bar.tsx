import { motion } from 'framer-motion';
import { useState } from 'react';

import { useAlertStore } from '@/stores/use-alert-store';

import type { GuideProfileData } from '../data/mock-guide';
import QrSheet from './qr-sheet';

interface ActionBarProps {
  guide: Pick<GuideProfileData, 'id' | 'name'>;
}

export default function ActionBar({ guide }: ActionBarProps) {
  const [qrOpen, setQrOpen] = useState(false);

  const handleShare = async () => {
    const url = `https://vvv.travel/g/${guide.id}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: guide.name, url });
      } catch {
        // user cancelled
      }
    } else {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
        }
        useAlertStore.getState().addAlert({ type: 'success', title: 'Đã sao chép liên kết' });
      } catch {
        useAlertStore.getState().addAlert({ type: 'error', title: 'Không thể sao chép liên kết' });
      }
    }
  };

  return (
    <>
      <div className="p-[18px] flex gap-[10px] border-b border-neutral-200 bg-white">
        <motion.button
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.1 }}
          className="flex-1 bg-neutral-black text-white py-3 rounded-md text-[13px] font-medium"
        >
          Đặt tour với {guide.name.split(' ').pop()}
        </motion.button>

        <motion.button
          whileHover={{ rotate: 5 }}
          transition={{ duration: 0.15 }}
          onClick={() => setQrOpen(true)}
          aria-label="QR code"
          className="p-3 rounded-md border border-neutral-200"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <rect x="10" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <rect x="1" y="10" width="5" height="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <rect x="3" y="3" width="1" height="1" fill="currentColor" />
            <rect x="12" y="3" width="1" height="1" fill="currentColor" />
            <rect x="3" y="12" width="1" height="1" fill="currentColor" />
            <rect x="9" y="9" width="2" height="2" fill="currentColor" />
            <rect x="13" y="9" width="2" height="2" fill="currentColor" />
            <rect x="9" y="13" width="2" height="2" fill="currentColor" />
            <rect x="13" y="13" width="2" height="2" fill="currentColor" />
          </svg>
        </motion.button>

        <motion.button
          whileHover={{ rotate: 5 }}
          transition={{ duration: 0.15 }}
          onClick={handleShare}
          aria-label="Share"
          className="p-3 rounded-md border border-neutral-200"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1V10M8 1L5 4M8 1L11 4M2 8V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V8"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </div>

      <QrSheet open={qrOpen} onClose={() => setQrOpen(false)} guideId={guide.id} guideName={guide.name} />
    </>
  );
}
