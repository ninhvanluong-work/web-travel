import dayjs from 'dayjs';
import {
  Building2,
  Calendar,
  Check,
  Clock,
  Compass,
  Copy,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  User,
  Users,
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import type { IBookingListItem } from '@/api/booking/types';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCopy } from '@/hooks/useCopy';

import { BookingPaymentTab } from './BookingPaymentTab';
import { BookingStatusBadge } from './BookingStatusBadge';
import { PassengerTooltip } from './PassengerTooltip';

function formatPrice(totalPrice: string, currency: string): string {
  const num = Number(totalPrice);
  if (Number.isNaN(num)) return `${totalPrice} ${currency}`;
  if (currency === 'USD') return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;
  return `${new Intl.NumberFormat('vi-VN').format(num)} VND`;
}

function Section({
  title,
  icon: Icon,
  iconColorClass,
  children,
}: {
  title: string;
  icon: React.ElementType;
  iconColorClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <Icon size={14} className={iconColorClass} />
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</p>
      </div>
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/30 p-5 space-y-3.5 shadow-sm">
        {children}
      </div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  icon: FieldIcon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4 py-0.5 text-xs">
      <span className="text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-2 font-medium">
        {FieldIcon && <FieldIcon size={14} className="text-slate-400 shrink-0" />}
        {label}
      </span>
      <span className="text-slate-800 dark:text-slate-100 font-semibold text-right max-w-[65%] truncate">{value}</span>
    </div>
  );
}

function BookingCodeCopy({ code }: { code: string }) {
  const [copied, copy] = useCopy(false);
  return (
    <button
      type="button"
      onClick={() => copy(code)}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-mono text-sm font-bold border border-slate-200/60 dark:border-slate-700/60"
    >
      <span>{code}</span>
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-400" />}
    </button>
  );
}

interface BookingDetailDrawerProps {
  booking: IBookingListItem | null;
  onClose: () => void;
}

export function BookingDetailDrawer({ booking, onClose }: BookingDetailDrawerProps) {
  const { t } = useTranslation('adminPage');
  const [activeTab, setActiveTab] = useState('info');

  return (
    <Sheet open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-[520px] w-full overflow-y-auto p-6 md:p-7">
        {booking && (
          <div className="space-y-6">
            <SheetHeader className="space-y-2 pr-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <BookingCodeCopy code={booking.bookingCode} />
                <BookingStatusBadge status={booking.status} />
              </div>
              <p className="text-xs text-slate-400 font-normal">
                {t('createdAt')}:{' '}
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {dayjs(booking.createdAt).format('DD/MM/YYYY HH:mm')}
                </span>
              </p>
            </SheetHeader>

            <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full h-11 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl grid grid-cols-2 gap-1">
                <TabsTrigger
                  value="info"
                  className="rounded-xl text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 h-9"
                >
                  <FileText size={14} />
                  <span>{t('admin.booking.info.tab.title')}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="payment"
                  className="rounded-xl text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 h-9"
                >
                  <CreditCard size={14} />
                  <span>{t('admin.booking.payment.tab.title')}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-5 mt-5 focus-visible:outline-none">
                {/* Customer Section */}
                <Section title={t('bookingDetailCustomer')} icon={User} iconColorClass="text-blue-500">
                  <FieldRow label={t('guideName')} value={booking.username} icon={User} />
                  <FieldRow label="Email" value={booking.email} icon={Mail} />
                  <FieldRow
                    label={t('bookingDetailPhone')}
                    icon={Phone}
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
                                className="text-slate-400 hover:text-brand-500 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                {isZalo ? <MessageCircle size={14} /> : <Phone size={14} />}
                              </a>
                            );
                          })}
                      </div>
                    }
                  />
                </Section>

                {/* Tour Section */}
                <Section title={t('bookingDetailTour')} icon={Compass} iconColorClass="text-emerald-500">
                  <FieldRow label={t('tourNameLabel')} value={booking.productName} icon={Compass} />
                  <FieldRow label={t('bookingOption')} value={booking.optionName} icon={Package} />
                  <FieldRow label={t('bookingSupplier')} value={booking.supplierName} icon={Building2} />
                </Section>

                {/* Travel Info Section */}
                <Section title={t('bookingDetailTravel')} icon={Calendar} iconColorClass="text-amber-500">
                  <FieldRow
                    label={t('bookingTravelDate')}
                    value={dayjs(booking.travelDate).format('DD/MM/YYYY')}
                    icon={Calendar}
                  />
                  <FieldRow
                    label={t('bookingDeparture')}
                    value={`${booking.departureLabel} (${booking.departureTime})`}
                    icon={Clock}
                  />
                  {booking.pickupLocationName && (
                    <FieldRow label={t('bookingPickup')} value={booking.pickupLocationName} icon={MapPin} />
                  )}
                  <FieldRow
                    label={t('bookingPassengers')}
                    value={<PassengerTooltip passengers={booking.passengers} />}
                    icon={Users}
                  />

                  {/* Highlighted Price Banner */}
                  <div className="mt-4 pt-3.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 rounded-2xl px-4 py-3.5">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                      {t('bookingTotalPrice')}
                    </span>
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                      {formatPrice(booking.totalPrice, booking.currency)}
                    </span>
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="payment" className="mt-5 focus-visible:outline-none">
                <BookingPaymentTab bookingId={booking.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
