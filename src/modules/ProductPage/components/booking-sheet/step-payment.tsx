import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { useCapturePaypalOrder, useCreatePaypalOrder, useCreateVnpayPaymentUrl, usePaypalConfig } from '@/api/payment';
import AlertBanner from '@/components/ui/AlertBanner';
import { useBookingStore } from '@/stores/BookingStore';

import { StepPaymentHeader } from './step-payment-header';
import { StepPaymentOrderSummary } from './step-payment-order-summary';
import { StepPaymentPaypalButton } from './step-payment-paypal-button';
import { StepPaymentSuccess } from './step-payment-success';

interface StepPaymentProps {
  productName: string;
  duration: string;
  total: number;
  currency: string;
  onEditBooking: () => void;
}

const VNPAY_MIN_AMOUNT = 10_000;
const VNPAY_RETURN_ORIGIN_KEY = 'vnpay_return_origin';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function StepPayment({
  productName,
  duration: _duration,
  total,
  currency,
  onEditBooking,
}: StepPaymentProps) {
  const { t } = useTranslation('productPage');

  const bookingId = useBookingStore.use.bookingId();
  const date = useBookingStore.use.date();
  const guests = useBookingStore.use.guests();

  const isVnd = currency === '₫' || currency === 'VND';
  const isUsd = !isVnd;

  const [paymentSuccess, setPaymentSuccess] = React.useState(false);
  const [cancelMessage, setCancelMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const { data: paypalConfig, isLoading: isLoadingConfig } = usePaypalConfig({
    enabled: isUsd && !!bookingId,
  });

  const { mutateAsync: callCreateOrder } = useCreatePaypalOrder();
  const { mutateAsync: callCaptureOrder, isLoading: isCapturing } = useCapturePaypalOrder();
  const { mutateAsync: callCreateVnpayUrl, isLoading: isCreatingVnpay } = useCreateVnpayPaymentUrl();

  const fmt = (n: number) => (currency === '₫' ? `₫${n.toLocaleString('vi-VN')}` : `$${n.toLocaleString('en-US')}`);

  const guestLabel =
    [
      guests.adults > 0 ? t('booking.adult', { count: guests.adults }) : '',
      guests.children > 0 ? t('booking.child', { count: guests.children }) : '',
    ]
      .filter(Boolean)
      .join(', ') || '—';

  const handleCreateOrder = async (): Promise<string> => {
    if (!bookingId) {
      setErrorMessage(t('booking.paymentMissingBookingId'));
      throw new Error('Missing bookingId');
    }
    setCancelMessage(null);
    setErrorMessage(null);
    try {
      return await callCreateOrder({ bookingId });
    } catch {
      setErrorMessage(t('booking.paymentCreateOrderError'));
      throw new Error('create-order failed');
    }
  };

  const handleVnpayCheckout = async () => {
    if (!bookingId) {
      setErrorMessage(t('booking.paymentMissingBookingId'));
      return;
    }
    setCancelMessage(null);
    setErrorMessage(null);
    try {
      const { paymentUrl } = await callCreateVnpayUrl({ bookingId });
      sessionStorage.setItem(VNPAY_RETURN_ORIGIN_KEY, window.location.href);
      window.location.href = paymentUrl;
    } catch {
      setErrorMessage(t('booking.paymentCreateOrderError'));
    }
  };

  const handleApprove = async (data: { orderID: string }) => {
    if (!bookingId) return;
    setErrorMessage(null);
    try {
      const result = await callCaptureOrder({ bookingId, orderId: data.orderID });
      if (result.payment.status === 'succeed') {
        setPaymentSuccess(true);
      } else {
        setErrorMessage(t('booking.paymentNotCompleted'));
      }
    } catch {
      setErrorMessage(t('booking.paymentCaptureError'));
    }
  };

  if (paymentSuccess) {
    return <StepPaymentSuccess productName={productName} />;
  }

  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-8">
      <StepPaymentHeader />

      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">
        <motion.div variants={fadeUp}>
          <StepPaymentOrderSummary
            productName={productName}
            date={date}
            guestLabel={guestLabel}
            totalFormatted={fmt(total)}
          />
        </motion.div>

        {(errorMessage || cancelMessage) && (
          <motion.div variants={fadeUp}>
            {errorMessage && <AlertBanner variant="error" title={t('booking.errorTitle')} message={errorMessage} />}
            {!errorMessage && cancelMessage && (
              <AlertBanner variant="info" title={t('booking.paymentCancelled')} message={cancelMessage} />
            )}
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <button className="w-full h-[64px] rounded-[16px] bg-[#5B5FE8] flex items-center justify-between px-5 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                  <rect x="1" y="1" width="20" height="14" rx="3" stroke="white" strokeWidth="1.8" />
                  <rect x="1" y="5" width="20" height="3" fill="white" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[15px] font-bold text-white leading-snug">{t('booking.paymentCard')}</p>
                <p className="text-[13px] text-white/70 mt-0.5 leading-none">{t('booking.paymentCardSubtext')}</p>
              </div>
            </div>
            <span className="text-white/80 text-[18px] flex-shrink-0 ml-2">→</span>
          </button>

          {isVnd ? (
            <>
              {total < VNPAY_MIN_AMOUNT && (
                <AlertBanner
                  variant="warning"
                  title={t('booking.errorTitle')}
                  message={t('booking.paymentVnpayMinLimit')}
                />
              )}
              <button
                onClick={handleVnpayCheckout}
                disabled={isCreatingVnpay || total < VNPAY_MIN_AMOUNT}
                className="w-full h-[64px] rounded-[16px] bg-[#0065af] hover:bg-[#005596] active:scale-[0.98] disabled:opacity-60 transition-all flex items-center justify-between px-5 shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center flex-shrink-0">
                    {isCreatingVnpay ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0065af]" />
                    ) : (
                      <span className="text-[14px] font-black text-[#0065af]">VN</span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-bold text-white leading-snug">{t('booking.paymentVnpay')}</p>
                    <p className="text-[12px] text-white/80 mt-0.5 leading-none">{t('booking.paymentVnpaySubtext')}</p>
                  </div>
                </div>
                <span className="text-white/80 text-[18px] flex-shrink-0 ml-2">→</span>
              </button>
            </>
          ) : (
            <>
              {isLoadingConfig || !paypalConfig?.clientId ? (
                <div className="w-full h-[55px] rounded-[16px] bg-[#F4F4F4] animate-pulse flex items-center justify-center text-[13px] text-[#888] font-medium">
                  {t('booking.paymentLoadingPaypal')}
                </div>
              ) : (
                <StepPaymentPaypalButton
                  clientId={paypalConfig.clientId}
                  currency={paypalConfig.currency}
                  isCapturing={isCapturing}
                  onCreateOrder={handleCreateOrder}
                  onApprove={handleApprove}
                  onError={() => setErrorMessage(t('booking.paymentGatewayError'))}
                  onCancel={() => setCancelMessage(t('booking.paymentCancelled'))}
                />
              )}
            </>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center justify-center gap-1.5 text-[12px] text-[#999]">
          <Lock size={12} />
          <span>{t('booking.paymentSecurityNote')}</span>
        </motion.div>

        {!isCapturing && (
          <motion.div variants={fadeUp}>
            <button onClick={onEditBooking} className="w-full text-center text-[13px] text-[#0F6E56] font-medium">
              {t('booking.paymentEditBooking')}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
