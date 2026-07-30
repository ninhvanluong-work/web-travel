import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/BookingStore';

const MESSENGER_APPS = ['WhatsApp', 'Zalo', 'Telegram', 'Line'] as const;

interface ContactInfoCardProps {
  currency: string;
}

export function ContactInfoCard({ currency }: ContactInfoCardProps) {
  const { t } = useTranslation('productPage');

  const contactName = useBookingStore.use.contactName();
  const setContactName = useBookingStore.use.setContactName();
  const contactPhone = useBookingStore.use.contactPhone();
  const setContactPhone = useBookingStore.use.setContactPhone();
  const contactEmail = useBookingStore.use.contactEmail();
  const setContactEmail = useBookingStore.use.setContactEmail();
  const contactMessenger = useBookingStore.use.contactMessenger();
  const setContactMessenger = useBookingStore.use.setContactMessenger();
  const contactMessengerHandle = useBookingStore.use.contactMessengerHandle();
  const setContactMessengerHandle = useBookingStore.use.setContactMessengerHandle();

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[16px] px-5 py-5 shadow-sm space-y-5 font-sans">
      <p className="text-[10px] font-bold text-[#0F6E56] uppercase tracking-widest">
        {t('booking.contactInfoSection')}
      </p>

      {/* Name */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
          {t('booking.contactName')} <span className="text-red-400 normal-case">*</span>
        </label>
        <Input
          size="sm"
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder={t('booking.contactNamePlaceholder')}
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
          {t('booking.contactPhone')} <span className="text-red-400 normal-case">*</span>
        </label>
        <PhoneInput
          value={contactPhone}
          onChange={setContactPhone}
          defaultCountry={currency === '₫' ? 'VN' : 'US'}
          placeholder={t('booking.contactPhone')}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
          {t('booking.contactEmail')} <span className="text-red-400 normal-case">*</span>
        </label>
        <Input
          size="sm"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder={t('booking.contactEmailPlaceholder')}
        />
      </div>

      {/* Chat App */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
          {t('booking.contactMessenger')}
        </label>
        <div className="flex flex-wrap gap-2">
          {MESSENGER_APPS.map((app) => {
            const active = contactMessenger === app;
            return (
              <button
                key={app}
                type="button"
                onClick={() => {
                  if (active) {
                    setContactMessenger('');
                    setContactMessengerHandle('');
                  } else {
                    setContactMessenger(app);
                    setContactMessengerHandle('');
                  }
                }}
                className={cn(
                  'px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all',
                  active
                    ? 'bg-[#0F6E56] border-[#0F6E56] text-white'
                    : 'bg-[#F7F7F7] border-[#E8E8E8] text-[#555] hover:border-[#0F6E56] hover:text-[#0F6E56]'
                )}
              >
                {app}
              </button>
            );
          })}
        </div>
        <AnimatePresence>
          {contactMessenger && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <Input
                size="sm"
                type="text"
                value={contactMessengerHandle}
                onChange={(e) => setContactMessengerHandle(e.target.value)}
                placeholder={t('booking.messengerHandlePlaceholder', { app: contactMessenger })}
                className="mt-1"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Privacy notice */}
      <div className="flex gap-2 pt-2">
        <span className="text-[#0F6E56] mt-0.5 flex-shrink-0">🔒</span>
        <p className="text-[11px] text-[#888] leading-relaxed">
          {t('booking.contactPrivacyNotice')}{' '}
          <span className="text-[#0F6E56] font-medium underline underline-offset-2 cursor-pointer">
            {t('booking.contactPrivacyPolicy')}
          </span>
        </p>
      </div>
    </div>
  );
}
