import dayjs from 'dayjs';
import { Check, Copy, KeyRound, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import type { IAdminUser } from '@/api/user/types';
import { ROUTE } from '@/types';

import { RoleBadge } from '../../components/role-badge';
import { USER_NS } from '../../constants';

const DATE_FORMAT = 'DD/MM/YYYY HH:mm';
const dtClass = 'text-[11px] font-semibold uppercase tracking-wide text-gray-400';

interface UserInfoCardProps {
  user: IAdminUser;
  canResetPassword: boolean;
  canDelete: boolean;
  disabled: boolean;
  onResetPassword: () => void;
  onDelete: () => void;
}

export function UserInfoCard({
  user,
  canResetPassword,
  canDelete,
  disabled,
  onResetPassword,
  onDelete,
}: UserInfoCardProps) {
  const { t } = useTranslation(USER_NS);
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context) — the id stays selectable as text
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-slate-100 dark:border-gray-800 px-5 py-4 rounded-t-2xl flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-800 dark:text-white/90 tracking-tight">{t('secInformation')}</h2>
        <RoleBadge role={user.role} />
      </div>

      <dl className="px-5 py-5 space-y-4 text-sm">
        <div>
          <dt className={dtClass}>{t('createdAtLabel')}</dt>
          <dd className="mt-1 text-gray-800 dark:text-white/90 tabular-nums">
            {user.createdAt ? dayjs(user.createdAt).format(DATE_FORMAT) : '—'}
          </dd>
        </div>
        <div>
          <dt className={dtClass}>{t('updatedAtLabel')}</dt>
          <dd className="mt-1 text-gray-800 dark:text-white/90 tabular-nums">
            {user.updatedAt ? dayjs(user.updatedAt).format(DATE_FORMAT) : '—'}
          </dd>
        </div>
        <div>
          <dt className={dtClass}>{t('guideProfileLabel')}</dt>
          <dd className="mt-1">
            {user.tourGuideId ? (
              <Link
                href={ROUTE.ADMIN_GUIDES_EDIT(user.tourGuideId)}
                className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
              >
                <User size={14} />
                {t('viewGuideProfile')}
              </Link>
            ) : (
              <span className="text-gray-400">{t('noGuideProfile')}</span>
            )}
          </dd>
        </div>
        <div>
          <dt className={dtClass}>{t('idLabel')}</dt>
          <dd className="mt-1 flex items-center gap-1.5">
            <code className="flex-1 min-w-0 truncate text-xs text-gray-600 dark:text-gray-400" title={user.id}>
              {user.id}
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

      {canResetPassword || canDelete ? (
        <div className="border-t border-slate-100 dark:border-gray-800 px-5 py-4 space-y-2">
          {canResetPassword ? (
            <button
              type="button"
              onClick={onResetPassword}
              disabled={disabled}
              className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <KeyRound size={14} />
              {t('resetPassword')}
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
              className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
            >
              <Trash2 size={14} />
              {t('deleteUser')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
