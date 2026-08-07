import { motion } from 'framer-motion';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const shakeVariants = {
  animate: {
    x: [0, -8, 8, -6, 6, -4, 4, 0],
    transition: { duration: 0.6, delay: 0.2 },
  },
};

const scaleSpringVariants = {
  initial: { scale: 0.5, rotate: -20 },
  animate: {
    scale: [0.5, 1.15, 1],
    rotate: [-20, 10, 0],
    transition: { type: 'spring' as const, stiffness: 300, damping: 18, delay: 0.1 },
  },
};

const VNPAY_RETURN_ORIGIN_KEY = 'vnpay_return_origin';

export default function VnpayReturnPage() {
  const router = useRouter();
  const { t } = useTranslation('productPage');
  const { status, txnRef, bookingId, amount } = router.query;

  const isSuccess = status === 'success';
  const amountVal = Number(amount) || 0;

  const handleRetry = () => {
    const origin = sessionStorage.getItem(VNPAY_RETURN_ORIGIN_KEY);
    sessionStorage.removeItem(VNPAY_RETURN_ORIGIN_KEY);
    if (origin) {
      window.location.href = origin;
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-black/[0.04]"
      >
        {isSuccess ? (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <motion.div
                variants={scaleSpringVariants}
                initial="initial"
                animate="animate"
                className="w-20 h-20 bg-[#EAF7F1] rounded-full flex items-center justify-center text-[44px] leading-none mb-5"
              >
                ✅
              </motion.div>
              <h1 className="text-[22px] font-bold text-gray-900 mb-2">{t('booking.paymentVnpaySuccessTitle')}</h1>
              <p className="text-[14px] text-gray-500 leading-relaxed">{t('booking.paymentVnpaySuccessMessage')}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-3 text-[13px] border border-gray-100 mb-6">
              {bookingId && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400 shrink-0">{t('booking.paymentVnpayBookingId')}</span>
                  <span className="font-mono font-medium text-gray-800 text-right break-all">{bookingId}</span>
                </div>
              )}
              {txnRef && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400 shrink-0">{t('booking.paymentVnpayTxnRef')}</span>
                  <span className="font-mono font-medium text-gray-800 text-right">{txnRef}</span>
                </div>
              )}
              {amountVal > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400 shrink-0">{t('booking.paymentVnpayAmount')}</span>
                  <span className="font-bold text-[#0F6E56]">{amountVal.toLocaleString('vi-VN')} ₫</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/')}
                className="w-full py-3.5 bg-[#0F6E56] text-white rounded-full font-semibold text-[14px] hover:bg-[#0c5945] transition-colors"
              >
                {t('booking.paymentVnpayBackHome')}
              </button>
              <button
                onClick={() => router.push('/search')}
                className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-full font-semibold text-[14px] hover:bg-gray-200 transition-colors"
              >
                {t('booking.paymentVnpayViewSearch')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <motion.div
                variants={shakeVariants}
                animate="animate"
                className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-[44px] leading-none mb-5"
              >
                ❌
              </motion.div>
              <h1 className="text-[22px] font-bold text-gray-900 mb-2">{t('booking.paymentVnpayFailedTitle')}</h1>
              <p className="text-[14px] text-gray-500 leading-relaxed">{t('booking.paymentVnpayFailedMessage')}</p>
            </div>

            {(bookingId || amountVal > 0) && (
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3 text-[13px] border border-gray-100 mb-6">
                {bookingId && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400 shrink-0">{t('booking.paymentVnpayBookingId')}</span>
                    <span className="font-mono font-medium text-gray-800 text-right break-all">{bookingId}</span>
                  </div>
                )}
                {amountVal > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400 shrink-0">{t('booking.paymentVnpayAmount')}</span>
                    <span className="font-medium text-gray-800">{amountVal.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleRetry}
                className="w-full py-3.5 bg-[#0065af] text-white rounded-full font-semibold text-[14px] hover:bg-[#005596] transition-colors"
              >
                {t('booking.paymentVnpayRetry')}
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-full font-semibold text-[14px] hover:bg-gray-200 transition-colors"
              >
                {t('booking.paymentVnpayBackHome')}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'vi', ['common', 'productPage'])),
    },
  };
};
