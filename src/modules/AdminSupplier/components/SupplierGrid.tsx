import { Loader2, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import type { ISupplier } from '@/api/supplier/types';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AVATAR_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

interface SupplierGridProps {
  suppliers: ISupplier[];
  isLoading?: boolean;
  onEdit: (supplier: ISupplier) => void;
  onDelete: (supplier: ISupplier) => void;
}

export function SupplierGrid({ suppliers, isLoading, onEdit, onDelete }: SupplierGridProps) {
  const { t } = useTranslation('adminPage');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
        <Icons.user size={40} className="opacity-25" />
        <p className="text-sm font-medium text-gray-500">{t('noSuppliersYet')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
      {suppliers.map((supplier) => (
        <div
          key={supplier.id}
          className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] p-5 flex flex-col gap-3"
        >
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
              {supplier.avatar?.startsWith('http') ? (
                <Image src={supplier.avatar} alt={supplier.name} fill className="object-cover" sizes="48px" />
              ) : (
                <div
                  className={cn(
                    'w-full h-full flex items-center justify-center text-white text-base font-bold',
                    getAvatarColor(supplier.name)
                  )}
                >
                  {supplier.name[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="font-semibold text-sm text-gray-900 dark:text-white/90 truncate">{supplier.name}</p>
                {supplier.isVerified && <ShieldCheck size={13} className="text-emerald-500 shrink-0" />}
              </div>
              <p className="text-[11px] text-gray-400">{supplier.contact || '—'}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={cn(
                  'w-3.5 h-3.5',
                  supplier.ratingRate > 0 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                )}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {supplier.ratingRate.toFixed(1)}
            </span>
            <span className="text-gray-300">·</span>
            <span>
              {supplier.tourOffered} {t('toursOffered')}
            </span>
            <span className="text-gray-300">·</span>
            <span>{t('yearsOfExp', { count: supplier.expYears })}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="xs"
              blur={false}
              className="flex-1 h-8 rounded-lg text-xs text-gray-600 hover:text-brand-600 hover:bg-brand-50 gap-1.5"
              onClick={() => onEdit(supplier)}
            >
              <Pencil size={12} />
              {t('edit')}
            </Button>
            <Button
              variant="ghost"
              size="xs"
              blur={false}
              className="flex-1 h-8 rounded-lg text-xs text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
              onClick={() => onDelete(supplier)}
            >
              <Trash2 size={12} />
              {t('delete')}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
