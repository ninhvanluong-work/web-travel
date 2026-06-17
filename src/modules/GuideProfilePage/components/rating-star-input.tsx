import { AnimatePresence, motion, useAnimate } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

interface RatingStarInputProps {
  value: number | null;
  onChange: (value: number) => void;
}

export default function RatingStarInput({ value, onChange }: RatingStarInputProps) {
  const { t } = useTranslation('guidePage');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [scope, animate] = useAnimate();

  function handleClick(star: number) {
    onChange(star);
    for (let i = 0; i < star; i++) {
      void animate(`[data-star="${i + 1}"]`, { scale: [1, 1.25, 0.95, 1] }, { delay: i * 0.06, duration: 0.3 });
    }
  }

  const display = hoverRating ?? value;

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-medium text-neutral-black">
        {t('ratingSheet.overallRating')} <span className="text-red-500">*</span>
      </p>

      <div ref={scope} className="flex gap-2" onMouseLeave={() => setHoverRating(null)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.button
            key={i}
            type="button"
            data-star={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(i)}
            onMouseEnter={() => setHoverRating(i)}
            className="p-0.5"
          >
            <Star
              size={28}
              className={
                display !== null && i <= display ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
              }
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {display !== null && (
          <motion.p
            key={display}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-[12px] text-amber-500 font-medium"
          >
            {t(`ratingLabels.${display}`)}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
