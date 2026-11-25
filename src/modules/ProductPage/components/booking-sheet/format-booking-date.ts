import { format } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

/** Booking date in the UI language, e.g. "Thứ 3, 17/11/2026" (vi) or "Tue, Nov 17, 2026" (en). */
export function formatBookingDate(date: Date, language: string): string {
  return language === 'vi'
    ? format(date, 'EEE, dd/MM/yyyy', { locale: vi })
    : format(date, 'EEE, MMM d, yyyy', { locale: enUS });
}
