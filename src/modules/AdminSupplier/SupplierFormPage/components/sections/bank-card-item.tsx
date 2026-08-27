import { Check, Copy, Pencil, Star, Trash2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import type { ISupplierPayment } from '@/api/supplier-payment/types';
import { cn } from '@/lib/utils';

interface BankCardItemProps {
  payment: ISupplierPayment;
  isSettingDefault: boolean;
  isDeleting: boolean;
  onSetDefault: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatAccountNumber(num: string): string {
  return num
    .replace(/\s/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function SilverEmvChip() {
  return (
    <div className="relative w-10 h-7 rounded-md overflow-hidden bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 border border-slate-300/80 shadow-xs shrink-0 flex items-center justify-center">
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-[3px] gap-px opacity-50">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-slate-600/40 rounded-[1px]" />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent" />
    </div>
  );
}

const CARD_THEMES = [
  'from-[#0f1f38] via-[#14294a] to-[#0b1628] border-blue-500/30',
  'from-[#1e1530] via-[#281b40] to-[#120d1e] border-purple-500/30',
  'from-[#0d2624] via-[#123633] to-[#081716] border-emerald-500/30',
  'from-[#1a202c] via-[#2d3748] to-[#171923] border-slate-600/40',
];

function getAccountNumber(payment: ISupplierPayment): string {
  if (payment.method === 'bank') {
    return payment.details.accountNumber ?? '';
  }
  if (payment.method === 'card') {
    return payment.details.cardNumber ?? '';
  }
  return '';
}

function getAccountHolder(payment: ISupplierPayment): string | undefined {
  if (payment.method === 'bank') {
    return payment.details.accountHolder;
  }
  if (payment.method === 'card') {
    return payment.details.cardHolder;
  }
  return undefined;
}

function getBankLabel(payment: ISupplierPayment, t: (key: string) => string): string {
  if (payment.method === 'bank') {
    return payment.details.bankName ?? payment.method;
  }
  if (payment.method === 'card') {
    return t('paymentCard');
  }
  return payment.method.toUpperCase();
}

function getCardTheme(payment: ISupplierPayment): string {
  if (payment.isDefault) {
    return 'from-[#0f2444] via-[#16305a] to-[#0d1b34] border-blue-500/40 shadow-blue-950/40';
  }
  const hash = payment.id.charCodeAt(0) + payment.id.charCodeAt(payment.id.length - 1);
  return CARD_THEMES[hash % CARD_THEMES.length];
}

export function BankCardItem({
  payment,
  isSettingDefault,
  isDeleting,
  onSetDefault,
  onEdit,
  onDelete,
}: BankCardItemProps) {
  const { t } = useTranslation('adminPage');
  const [copied, setCopied] = useState(false);

  const accountNum = getAccountNumber(payment);
  const accountHolder = getAccountHolder(payment);
  const bankLabel = getBankLabel(payment, t);

  const handleCopy = () => {
    if (!accountNum) return;
    navigator.clipboard.writeText(accountNum).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const cardTheme = getCardTheme(payment);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-gradient-to-br border text-white shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[190px]',
        cardTheme
      )}
    >
      {/* Decorative ambient light */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-white/5 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/[0.03] to-transparent" />

      {/* Card Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        {/* Header: Bank Name (Left) + Copy Button (Right) */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-sm sm:text-base tracking-wide text-white uppercase leading-snug line-clamp-2 max-w-[200px]">
            {bankLabel}
          </h4>

          {accountNum && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">{t('copied')}</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Body: Chip + Account Number */}
        <div className="flex items-center gap-4 py-1">
          <SilverEmvChip />

          {accountNum && (
            <div className="flex-1 min-w-0">
              <span className="font-mono text-base sm:text-lg font-semibold tracking-[0.18em] text-white block truncate">
                {formatAccountNumber(accountNum)}
              </span>
            </div>
          )}
        </div>

        {/* Footer info: Account holder + Default Badge */}
        <div className="flex items-end justify-between gap-2 pt-1">
          <div>
            {accountHolder && (
              <>
                <span className="text-[9px] font-semibold tracking-widest text-white/40 uppercase block">
                  ACCOUNT HOLDER
                </span>
                <span className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase block truncate max-w-[180px]">
                  {accountHolder}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {payment.isDefault && (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-400 border border-emerald-500/40 uppercase shadow-xs">
                <Star size={10} className="fill-emerald-400 text-emerald-400" />
                DEFAULT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer Bar */}
      <div className="bg-black/30 backdrop-blur-xs border-t border-white/10 flex items-center divide-x divide-white/10 text-xs font-medium text-white/70 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 py-2 text-center hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Pencil size={12} />
          <span>{t('edit')}</span>
        </button>

        {!payment.isDefault && (
          <button
            type="button"
            onClick={onSetDefault}
            disabled={isSettingDefault}
            className="flex-1 py-2 text-center text-amber-300/80 hover:text-amber-300 hover:bg-white/5 transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Star size={12} />
            <span>{t('paymentSetDefault')}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="flex-1 py-2 text-center text-rose-400/80 hover:text-rose-400 hover:bg-white/5 transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Trash2 size={12} />
          <span>{t('delete')}</span>
        </button>
      </div>
    </div>
  );
}
