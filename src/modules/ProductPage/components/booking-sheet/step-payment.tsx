import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

import { useBookingStore } from '@/stores/BookingStore';

interface StepPaymentProps {
  productName: string;
  duration: string;
  total: number;
  currency: string;
  onEditBooking: () => void;
}

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
  const date = useBookingStore.use.date();
  const guests = useBookingStore.use.guests();

  const fmt = (n: number) => (currency === '₫' ? `₫${n.toLocaleString('vi-VN')}` : `$${n.toLocaleString('en-US')}`);

  const guestLabel =
    [
      guests.adults > 0 ? `${guests.adults} adult${guests.adults > 1 ? 's' : ''}` : '',
      guests.children > 0 ? `${guests.children} child${guests.children > 1 ? 'ren' : ''}` : '',
    ]
      .filter(Boolean)
      .join(', ') || '—';

  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-8">
      {/* Celebration header */}
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
          Almost there!
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.25 }}
          className="text-[14px] text-[#777]"
        >
          Your booking is ready — choose how to pay
        </motion.p>
      </div>

      {/* Staggered content */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">
        {/* Order Summary card */}
        <motion.div
          variants={fadeUp}
          className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm"
        >
          <div className="px-5 py-3">
            <p className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-widest">Order Summary</p>
          </div>

          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-[14px] font-medium text-[#555] flex-shrink-0 w-[70px]">Tour</span>
            <span className="text-[14px] font-semibold text-[#111] text-right">{productName}</span>
          </div>

          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-[14px] font-medium text-[#555] flex-shrink-0 w-[70px]">Date</span>
            <span className="text-[14px] font-semibold text-[#111] text-right">
              {date ? format(date, 'EEE, MMM d, yyyy') : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-[14px] font-medium text-[#555] flex-shrink-0 w-[70px]">Guests</span>
            <span className="text-[14px] font-semibold text-[#111] text-right">{guestLabel}</span>
          </div>

          <div className="flex items-center justify-between px-5 pt-2 pb-4">
            <span className="text-[14px] font-bold text-[#111]">Total due</span>
            <span className="text-[18px] font-bold text-[#0F6E56]">{fmt(total)}</span>
          </div>
        </motion.div>

        {/* Payment buttons */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <button className="w-full rounded-[16px] bg-[#5B5FE8] flex items-center justify-between px-5 py-[18px] shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                  <rect x="1" y="1" width="20" height="14" rx="3" stroke="white" strokeWidth="1.8" />
                  <rect x="1" y="5" width="20" height="3" fill="white" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-white leading-snug">Pay with Card</p>
                <p className="text-[13px] text-white/70 mt-0.5">Visa, Mastercard, Amex</p>
              </div>
            </div>
            <span className="text-white/80 text-[18px] flex-shrink-0 ml-2">→</span>
          </button>

          <button className="w-full rounded-[16px] bg-[#FFC439] flex items-center justify-between px-5 py-[18px] shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-[#003087] flex items-center justify-center flex-shrink-0">
                <span className="text-[14px] font-black text-white tracking-tight leading-none">PP</span>
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#1C2B5E] leading-snug">PayPal</p>
                <p className="text-[13px] text-[#1C2B5E]/70 mt-0.5">Fast &amp; secure checkout</p>
              </div>
            </div>
            <span className="text-[#1C2B5E]/50 text-[18px] flex-shrink-0 ml-2">→</span>
          </button>
        </motion.div>

        {/* Security note */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-1.5 text-[12px] text-[#999]">
          <Lock size={12} />
          <span>256-bit SSL encryption &middot; Instant confirmation</span>
        </motion.div>

        {/* Edit link */}
        <motion.div variants={fadeUp}>
          <button onClick={onEditBooking} className="w-full text-center text-[13px] text-[#0F6E56] font-medium">
            ← Edit booking details
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
