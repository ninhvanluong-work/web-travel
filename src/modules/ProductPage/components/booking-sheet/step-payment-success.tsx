import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

interface StepPaymentSuccessProps {
  productName: string;
}

export function StepPaymentSuccess({ productName }: StepPaymentSuccessProps) {
  const { t } = useTranslation('productPage');
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-5 text-center gap-4">
      <motion.div
        initial={{ scale: 0.5, rotate: -20 }}
        animate={{ scale: [0.5, 1.1, 1], rotate: [-20, 10, 0] }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-[#EAF7F1] flex items-center justify-center text-[44px] leading-none"
      >
        ✅
      </motion.div>
      <h2 className="text-[22px] font-bold text-[#111]">{t('booking.paymentSuccessTitle')}</h2>
      <p className="text-[14px] text-[#666] leading-relaxed">{t('booking.paymentSuccessMessage', { productName })}</p>
      <button
        onClick={() => router.push('/')}
        className="mt-6 px-8 py-3 bg-[#0F6E56] text-white rounded-full text-[14px] font-semibold"
      >
        {t('booking.paymentSuccessHome')}
      </button>
    </div>
  );
}
