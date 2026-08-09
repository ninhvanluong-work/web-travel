import { Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import { Icons } from '@/assets/icons';

interface SupplierToolbarProps {
  keyword: string;
  isFetching: boolean;
  isLoading: boolean;
  onKeywordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SupplierToolbar({ keyword, isFetching, isLoading, onKeywordChange }: SupplierToolbarProps) {
  const { t } = useTranslation('adminPage');

  return (
    <div className="px-5 py-5 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
      <div className="relative flex-1 max-w-sm">
        <Icons.search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder={t('searchSuppliersPlaceholder')}
          value={keyword}
          onChange={onKeywordChange}
          className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 transition dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-gray-500"
        />
      </div>

      {isFetching && !isLoading && <Loader2 size={15} className="animate-spin text-brand-500 shrink-0" />}
    </div>
  );
}
