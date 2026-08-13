import dayjs from 'dayjs';
import { Eye, MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import type { IBookingListItem } from '@/api/booking/types';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';

import { BookingStatusBadge } from './BookingStatusBadge';
import { PassengerTooltip } from './PassengerTooltip';

function formatPrice(totalPrice: string, currency: string): string {
  const num = Number(totalPrice);
  if (Number.isNaN(num)) return `${totalPrice} ${currency}`;
  if (currency === 'USD') return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;
  return `${new Intl.NumberFormat('vi-VN').format(num)} VND`;
}

interface BookingTableRowProps {
  booking: IBookingListItem;
  onViewDetail: (booking: IBookingListItem) => void;
}

export function BookingTableRow({ booking, onViewDetail }: BookingTableRowProps) {
  const { t } = useTranslation('adminPage');

  return (
    <TableRow className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
      {/* Booking Code */}
      <TableCell>
        <button
          type="button"
          onClick={() => onViewDetail(booking)}
          className="font-mono text-sm text-brand-600 hover:underline dark:text-brand-400"
        >
          {booking.bookingCode}
        </button>
      </TableCell>

      {/* Customer */}
      <TableCell>
        <div className="space-y-0.5">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">{booking.username}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-400">{booking.phone}</span>
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
                    {isZalo ? <MessageCircle size={13} /> : <Phone size={13} />}
                  </a>
                );
              })}
          </div>
        </div>
      </TableCell>

      {/* Product */}
      <TableCell>
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{booking.productName}</p>
        <p className="text-xs text-gray-400 line-clamp-1">{booking.optionName}</p>
      </TableCell>

      {/* Travel Date */}
      <TableCell className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
        {dayjs(booking.travelDate).format('DD/MM/YYYY')}
      </TableCell>

      {/* Passengers */}
      <TableCell>
        <PassengerTooltip passengers={booking.passengers} />
      </TableCell>

      {/* Total Price */}
      <TableCell className="whitespace-nowrap">
        <span className="font-bold text-sm text-gray-900 dark:text-white">
          {formatPrice(booking.totalPrice, booking.currency)}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell>
        <BookingStatusBadge status={booking.status} />
      </TableCell>

      {/* Actions */}
      <TableCell className="w-14">
        <Button
          variant="ghost"
          className="h-9 w-9 rounded-xl text-gray-400 hover:text-brand-600 hover:bg-brand-50 p-0"
          onClick={() => onViewDetail(booking)}
          title={t('bookingDetailTitle')}
        >
          <Eye size={16} />
        </Button>
      </TableCell>
    </TableRow>
  );
}
