import dayjs from 'dayjs';
import { MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import type { IBookingListItem } from '@/api/booking/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { BookingStatusBadge } from './BookingStatusBadge';
import { PassengerTooltip } from './PassengerTooltip';

function formatPrice(totalPrice: string, currency: string): string {
  const num = Number(totalPrice);
  if (Number.isNaN(num)) return `${totalPrice} ${currency}`;
  if (currency === 'USD') return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;
  return `${new Intl.NumberFormat('vi-VN').format(num)} VND`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{title}</p>
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02] px-4 py-3 space-y-2.5">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 dark:text-white/90 text-right">{value}</span>
    </div>
  );
}

interface BookingDetailDrawerProps {
  booking: IBookingListItem | null;
  onClose: () => void;
}

export function BookingDetailDrawer({ booking, onClose }: BookingDetailDrawerProps) {
  const { t } = useTranslation('adminPage');

  return (
    <Sheet open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
        {booking && (
          <div className="space-y-5 pt-2">
            <SheetHeader>
              <SheetTitle className="font-mono text-base">{booking.bookingCode}</SheetTitle>
              <div className="flex items-center gap-2 pt-1">
                <BookingStatusBadge status={booking.status} />
                <span className="text-xs text-gray-400">
                  {t('createdAt')} {dayjs(booking.createdAt).format('DD/MM/YYYY HH:mm')}
                </span>
              </div>
            </SheetHeader>

            <Section title={t('bookingDetailCustomer')}>
              <Field label={t('guideName')} value={booking.username} />
              <Field label="Email" value={booking.email} />
              <Field
                label={t('bookingDetailPhone')}
                value={
                  <div className="flex items-center gap-2 justify-end">
                    <span>{booking.phone}</span>
                    {booking.messengerApp?.length > 0 &&
                      booking.messengerApp.map((app) => {
                        const isZalo = app.name.toLowerCase() === 'zalo';
                        const href = isZalo
                          ? `https://zalo.me/${booking.phone}`
                          : `https://wa.me/${booking.phone.replace(/\D/g, '')}`;
                        return (
                          <a
                            key={app.name}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={app.name}
                            className="text-gray-400 hover:text-brand-500 transition-colors"
                          >
                            {isZalo ? <MessageCircle size={14} /> : <Phone size={14} />}
                          </a>
                        );
                      })}
                  </div>
                }
              />
            </Section>

            <Section title={t('bookingDetailTour')}>
              <Field label={t('tourNameLabel')} value={booking.productName} />
              <Field label={t('bookingOption')} value={booking.optionName} />
              <Field label={t('bookingSupplier')} value={booking.supplierName} />
            </Section>

            <Section title={t('bookingDetailTravel')}>
              <Field label={t('bookingTravelDate')} value={dayjs(booking.travelDate).format('DD/MM/YYYY')} />
              <Field label={t('bookingDeparture')} value={`${booking.departureLabel} (${booking.departureTime})`} />
              {booking.pickupLocationName && <Field label={t('bookingPickup')} value={booking.pickupLocationName} />}
              <Field label={t('bookingPassengers')} value={<PassengerTooltip passengers={booking.passengers} />} />
              <Field
                label={t('bookingTotalPrice')}
                value={
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatPrice(booking.totalPrice, booking.currency)}
                  </span>
                }
              />
            </Section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
