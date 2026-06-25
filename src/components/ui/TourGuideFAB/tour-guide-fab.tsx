import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';

import { useUserStore } from '@/stores/UserStore';
import { ROUTE } from '@/types';

const HINT_DURATION = 3000;
const PULSE_INTERVAL = 10000;

export function TourGuideFAB() {
  const user = useUserStore.use.user();
  const router = useRouter();
  const { t } = useTranslation('common');

  const [isExpanded, setIsExpanded] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [isPulsing, setIsPulsing] = useState(false);
  const lastScrollY = useRef(0);

  const isOnOwnProfile = router.pathname === '/guide/[id]' && router.query.id === user?.tourGuideId;

  useEffect(() => {
    const timer = setTimeout(() => setIsExpanded(false), HINT_DURATION);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, PULSE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setOpacity(currentY > lastScrollY.current ? 0.5 : 1);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTourGuide = user?.role === 'guide' || user?.role === 'tour_guide';
  if (!isTourGuide || isOnOwnProfile) return null;

  return (
    <motion.button
      style={{ opacity }}
      animate={{ width: isExpanded ? 'auto' : 52 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      onClick={() => router.push(ROUTE.GUIDE_PROFILE_PATH(user.tourGuideId!))}
      className="fixed bottom-6 right-4 z-50 h-[52px] min-w-[52px] px-3.5
                 rounded-full bg-neutral-black text-white shadow-xl
                 flex items-center gap-2.5 overflow-hidden transition-opacity duration-300
                 cursor-pointer"
      aria-label={t('tourGuideFab.label')}
    >
      {isPulsing && (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-neutral-black pointer-events-none"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      )}

      <svg className="shrink-0 w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>

      <AnimatePresence>
        {isExpanded && (
          <motion.span
            key="fab-label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-semibold whitespace-nowrap font-dinpro pr-1"
          >
            {t('tourGuideFab.label')}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
