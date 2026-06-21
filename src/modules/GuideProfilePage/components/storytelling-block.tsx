import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

// 16px font × 1.65 line-height × 4 lines ≈ 106px
const COLLAPSED_HEIGHT = 106;

interface StorytellingBlockProps {
  bio: string;
}

export default function StorytellingBlock({ bio }: StorytellingBlockProps) {
  const { t } = useTranslation('guidePage');
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      setNeedsTruncation(textRef.current.scrollHeight > COLLAPSED_HEIGHT);
    }
  }, [bio]);

  return (
    <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
      <p className="text-[11px] text-neutral-500 uppercase font-medium mb-2.5" style={{ letterSpacing: '0.5px' }}>
        {t('whyThisJob')}
      </p>

      <motion.div
        initial={false}
        animate={{ height: expanded || !needsTruncation ? 'auto' : COLLAPSED_HEIGHT }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="relative overflow-hidden"
      >
        <p
          ref={textRef}
          className={`text-[16px] text-neutral-900 leading-[1.65] font-normal ${!expanded ? 'line-clamp-4' : ''}`}
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {bio}
        </p>
      </motion.div>

      {needsTruncation && !expanded && (
        <Button
          variant="ghost"
          blur={false}
          className="mt-1 text-[12px] text-neutral-500 py-[9px] px-0 underline underline-offset-2"
          onClick={() => setExpanded(true)}
        >
          {t('readMore', { defaultValue: 'Read more' })}
        </Button>
      )}

      {needsTruncation && expanded && (
        <Button
          variant="ghost"
          blur={false}
          className="mt-1 text-[12px] text-neutral-500 py-[9px] px-0 underline underline-offset-2"
          onClick={() => setExpanded(false)}
        >
          {t('showLess', { defaultValue: 'Show less' })}
        </Button>
      )}
    </div>
  );
}
