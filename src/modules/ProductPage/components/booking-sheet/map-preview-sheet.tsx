import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { TOUR_HUB_COORDS } from '@/lib/goong';

const GoongMap = dynamic(() => import('./goong-map'), { ssr: false });

interface MapPreviewSheetProps {
  isOpen: boolean;
  pickup: { lat: number; lng: number; name: string } | null;
  onClose: () => void;
}

export default function MapPreviewSheet({ isOpen, pickup, onClose }: MapPreviewSheetProps) {
  const { t } = useTranslation('productPage');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !pickup) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Map sheet — phone frame sized, slides up */}
          <motion.div
            className="relative w-full max-w-[430px] h-full max-h-[932px] bg-white flex flex-col overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-[#F0F0F0] flex-shrink-0 z-10">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#0F6E56]" />
                <span className="text-[16px] font-bold text-[#111]">{t('booking.mapTitle')}</span>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                <X size={16} className="text-[#444]" />
              </button>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
              <GoongMap pickup={pickup} hub={TOUR_HUB_COORDS} />
            </div>

            {/* Bottom info */}
            <div
              className="flex-shrink-0 bg-white border-t border-[#F0F0F0] px-5 py-4"
              style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0F6E56] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#999] uppercase tracking-wider">
                    {t('booking.pickupLabel')}
                  </p>
                  <p className="text-[14px] font-semibold text-[#111] mt-0.5 leading-snug">{pickup.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 mt-3">
                <div className="w-8 h-8 rounded-full bg-[#FF8000] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#999] uppercase tracking-wider">{t('booking.tourHub')}</p>
                  <p className="text-[14px] font-semibold text-[#111] mt-0.5">{t('booking.tourHubName')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
