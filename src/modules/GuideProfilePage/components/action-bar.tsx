import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import type { ITourGuideProfile } from '@/api/tour-guide/types';
import { useAlertStore } from '@/stores/use-alert-store';
import { useUserStore } from '@/stores/UserStore';
import { ROUTE } from '@/types';

import EditProfileSheet from './edit-profile-sheet';
import ManageMomentsSheet from './manage-moments-sheet';
import QrSheet from './qr-sheet';
import RatingSheet from './rating-sheet';

interface ActionBarProps {
  guide: Pick<ITourGuideProfile, 'id' | 'name'>;
  isOwner: boolean;
}

export default function ActionBar({ guide, isOwner }: ActionBarProps) {
  const { t } = useTranslation('guidePage');
  const router = useRouter();
  const user = useUserStore.use.user();
  const [qrOpen, setQrOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [manageMomentsOpen, setManageMomentsOpen] = useState(false);

  const handleShare = async () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/guide/${guide.id}`;
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
        useAlertStore.getState().addAlert({ type: 'success', title: t('actionBar.shareCopied') });
      } catch {
        useAlertStore.getState().addAlert({ type: 'error', title: t('actionBar.shareFailed') });
      }
    }
  };

  return (
    <>
      <div className="p-[18px] flex gap-[10px] border-b border-neutral-200 bg-white">
        <motion.button
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.1 }}
          className="flex-1 bg-neutral-black text-white py-3 px-3 rounded-md text-[13px] font-medium truncate"
        >
          {t('bookTour', { name: guide.name.split(' ').pop() })}
        </motion.button>

        {isOwner ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.1 }}
            onClick={() => setEditOpen(true)}
            className="px-3 py-3 rounded-md border border-neutral-200 text-[13px] font-medium whitespace-nowrap flex items-center justify-center"
            title={t('editProfile')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:hidden block"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span className="hidden sm:inline">{t('editProfile')}</span>
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.1 }}
            onClick={() => {
              if (!user) {
                router.push({ pathname: ROUTE.SIGN_IN, query: { callbackUrl: `/guide/${guide.id}` } });
                return;
              }
              setRatingOpen(true);
            }}
            className="px-3 py-3 rounded-md border border-neutral-200 text-[13px] font-medium whitespace-nowrap flex items-center justify-center"
            title={t('rateMe')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:hidden block"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="hidden sm:inline">{t('rateMe')}</span>
          </motion.button>
        )}

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
      <RatingSheet open={ratingOpen} onClose={() => setRatingOpen(false)} guideId={guide.id} guideName={guide.name} />
      <EditProfileSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        guideId={guide.id}
        guideName={guide.name}
        onOpenManageMoments={() => {
          setEditOpen(false);
          setManageMomentsOpen(true);
        }}
      />
      <ManageMomentsSheet open={manageMomentsOpen} onClose={() => setManageMomentsOpen(false)} guideId={guide.id} />
    </>
  );
}
