import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/BookingStore';

const MESSENGER_APPS = ['WhatsApp', 'Zalo', 'Telegram', 'Line'] as const;

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function getEmailError(email: string, t: (key: string) => string): string | null {
  if (!email.trim()) return t('booking.errorEmailRequired');
  if (!isValidEmail(email)) return t('booking.errorEmailInvalid');
  return null;
}

export function ContactInfoCard() {
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

  const [touched, setTouched] = React.useState({
    name: false,
    phone: false,
    email: false,
    handle: false,
  });

  const touch = (field: keyof typeof touched) => setTouched((prev) => ({ ...prev, [field]: true }));

  const errors = {
    name: !contactName.trim() ? t('booking.errorNameRequired') : null,
    phone: !contactPhone.trim() ? t('booking.errorPhoneRequired') : null,
    email: getEmailError(contactEmail, t),
    handle:
      contactMessenger && !contactMessengerHandle.trim()
        ? t('booking.errorHandleRequired', { app: contactMessenger })
        : null,
  };

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
          onBlur={() => touch('name')}
          placeholder={t('booking.contactNamePlaceholder')}
          className={cn(touched.name && errors.name && 'border-red-400 focus:border-red-400')}
        />
        {touched.name && errors.name && <p className="text-[12px] text-red-500 leading-snug">{errors.name}</p>}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
          {t('booking.contactPhone')} <span className="text-red-400 normal-case">*</span>
        </label>
        <PhoneInput
          value={contactPhone}
          onChange={setContactPhone}
          onBlur={() => touch('phone')}
          defaultCountry="VN"
          placeholder={t('booking.contactPhone')}
          className={cn(touched.phone && errors.phone && 'border-red-400')}
        />
        {touched.phone && errors.phone && <p className="text-[12px] text-red-500 leading-snug">{errors.phone}</p>}
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
          onBlur={() => touch('email')}
          placeholder={t('booking.contactEmailPlaceholder')}
          className={cn(touched.email && errors.email && 'border-red-400 focus:border-red-400')}
        />
        {touched.email && errors.email && <p className="text-[12px] text-red-500 leading-snug">{errors.email}</p>}
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
                    setTouched((prev) => ({ ...prev, handle: false }));
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
                onBlur={() => touch('handle')}
                placeholder={t('booking.messengerHandlePlaceholder', { app: contactMessenger })}
                className={cn('mt-1', touched.handle && errors.handle && 'border-red-400 focus:border-red-400')}
              />
              {touched.handle && errors.handle && (
                <p className="text-[12px] text-red-500 leading-snug mt-1">{errors.handle}</p>
              )}
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
