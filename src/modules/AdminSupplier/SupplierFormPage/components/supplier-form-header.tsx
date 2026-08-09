import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { Button } from '@/components/ui/button';
import { ROUTE } from '@/types';

interface SupplierFormHeaderProps {
  isEdit: boolean;
  isPending: boolean;
  onSave: () => void;
}

export function SupplierFormHeader({ isEdit, isPending, onSave }: SupplierFormHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation('adminPage');

  return (
    <div className="sticky top-[72px] z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between gap-4 shadow-theme-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          rounded="md"
          blur={false}
          className="shrink-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => router.push(ROUTE.ADMIN_SUPPLIERS)}
        >
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white/90 truncate leading-tight">
          {isEdit ? t('editSupplier') : t('addSupplier')}
        </h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isPending && <Loader2 size={16} className="animate-spin text-gray-400" />}
        <Button
          variant="primary"
          size="xs"
          rounded="md"
          blur={false}
          disabled={isPending}
          onClick={onSave}
          className="px-5 h-9 bg-brand-500 hover:bg-brand-600 border-0 shadow-theme-xs"
        >
          {isEdit ? t('saveChanges') : t('createSupplier')}
        </Button>
      </div>
    </div>
  );
}
