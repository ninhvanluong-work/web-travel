import dayjs from 'dayjs';
import { Check, Copy, Trash2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import type { IDestination } from '@/api/destination/types';

import { DESTINATION_NS } from '../../constants';
import { UserNameLabel } from '../../DestinationListPage/components/user-name-label';

const DATE_FORMAT = 'DD/MM/YYYY HH:mm';

const dtClass = 'text-[11px] font-semibold uppercase tracking-wide text-gray-400';

function AuditRow({ label, date, userId }: { label: string; date: string; userId: string | null }) {
  return (
    <div>
      <dt className={dtClass}>{label}</dt>
      <dd className="mt-1 text-gray-800 dark:text-white/90 tabular-nums">{dayjs(date).format(DATE_FORMAT)}</dd>
      <dd className="mt-0.5 text-xs text-gray-500">
        <UserNameLabel userId={userId} />
      </dd>
    </div>
  );
}

interface DestinationInfoCardProps {
  destination: IDestination;
  disabled: boolean;
  onDelete: () => void;
}

export function DestinationInfoCard({ destination, disabled, onDelete }: DestinationInfoCardProps) {
  const { t } = useTranslation(DESTINATION_NS);
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(destination.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context) — the id stays selectable as text
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-slate-100 dark:border-gray-800 px-5 py-4 rounded-t-2xl">
        <h2 className="text-base font-bold text-slate-800 dark:text-white/90 tracking-tight">{t('secInformation')}</h2>
      </div>

      <dl className="px-5 py-5 space-y-4 text-sm">
        <AuditRow label={t('createdAtLabel')} date={destination.createdAt} userId={destination.createdBy} />
        <AuditRow label={t('updatedAtLabel')} date={destination.updatedAt} userId={destination.updatedBy} />

        <div>
          <dt className={dtClass}>{t('idLabel')}</dt>
          <dd className="mt-1 flex items-center gap-1.5">
            <code className="flex-1 min-w-0 truncate text-xs text-gray-600 dark:text-gray-400" title={destination.id}>
              {destination.id}
            </code>
            <button
              type="button"
              onClick={handleCopyId}
              aria-label={copied ? t('copied') : t('copyId')}
              className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:hover:bg-white/10"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </dd>
        </div>
      </dl>

      <div className="border-t border-slate-100 dark:border-gray-800 px-5 py-4">
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:border-red-900/50 dark:hover:bg-red-950/30"
        >
          <Trash2 size={14} />
          {t('deleteDestination')}
        </button>
      </div>
    </div>
  );
}
