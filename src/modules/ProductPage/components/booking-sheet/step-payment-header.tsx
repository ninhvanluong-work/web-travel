import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

export function StepPaymentHeader() {
  const { t } = useTranslation('productPage');

  return (
    <div className="flex flex-col items-center text-center pt-4 pb-2 gap-2">
      <motion.div
        initial={{ scale: 0.5, rotate: -20 }}
        animate={{ scale: [0.5, 1.1, 1], rotate: [-20, 10, 0] }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-[#EAF7F1] flex items-center justify-center text-[36px] leading-none"
      >
        🎉
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.25 }}
        className="text-[22px] font-bold text-[#111] mt-1"
      >
        {t('booking.paymentAlmostThere')}
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.25 }}
        className="text-[14px] text-[#777]"
      >
        {t('booking.paymentSubtitle')}
      </motion.p>
    </div>
  );
}
