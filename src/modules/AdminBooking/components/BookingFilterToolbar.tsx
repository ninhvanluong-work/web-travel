import { Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import { useProductList } from '@/api/product/queries';
import { useSupplierList } from '@/api/supplier/queries';
import { Icons } from '@/assets/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SelectWithSearch from '@/components/ui/select-with-search';

import type { BookingFilters } from '../hooks/use-booking-list-state';
import { BookingDateRangeDropdown } from './booking-date-range-dropdown';

interface BookingFilterToolbarProps {
  filters: BookingFilters;
  isFetching: boolean;
  isLoading: boolean;
  hasActiveFilters: boolean;
  onFilterChange: (patch: Partial<BookingFilters>) => void;
  onReset: () => void;
}

export function BookingFilterToolbar({
  filters,
  isFetching,
  isLoading,
  hasActiveFilters,
  onFilterChange,
  onReset,
}: BookingFilterToolbarProps) {
  const { t } = useTranslation('adminPage');

  const { data: supplierData, isLoading: suppliersLoading } = useSupplierList({
    variables: { pageSize: 50 },
  } as any);

  const { data: productData, isLoading: productsLoading } = useProductList({
    variables: { pageSize: 50 },
  } as any);

  const supplierOptions = (supplierData?.items ?? []).map((s) => ({ label: s.name, value: s.id }));
  const productOptions = (productData?.items ?? []).map((p) => ({ label: p.name, value: p.id }));

  return (
    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Keyword */}
        <div className="relative flex-1 min-w-[220px]">
          <Icons.search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder={t('bookingSearchPlaceholder')}
            value={filters.keyword}
            onChange={(e) => onFilterChange({ keyword: e.target.value })}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 transition dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Status */}
        <Select value={filters.status || 'all'} onValueChange={(v) => onFilterChange({ status: v === 'all' ? '' : v })}>
          <SelectTrigger className="h-11 w-[150px] rounded-xl">
            <SelectValue placeholder={t('bookingAllStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('bookingAllStatuses')}</SelectItem>
            <SelectItem value="paid">{t('bookingStatus_paid')}</SelectItem>
            <SelectItem value="pending">{t('bookingStatus_pending')}</SelectItem>
            <SelectItem value="cancel">{t('bookingStatus_cancel')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Date range */}
        <BookingDateRangeDropdown
          value={{ fromDate: filters.fromDate, toDate: filters.toDate }}
          onChange={(r) => onFilterChange(r)}
        />

        {isFetching && !isLoading && <Loader2 size={15} className="animate-spin text-brand-500 shrink-0" />}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors shrink-0"
          >
            {t('clearAll')}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Supplier */}
        <div className="w-[220px]">
          <SelectWithSearch
            placeholder={t('bookingAllSuppliers')}
            value={filters.supplierId}
            onValueChange={(v) => onFilterChange({ supplierId: v })}
            data={[{ label: t('bookingAllSuppliers'), value: '' }, ...supplierOptions]}
            disabled={suppliersLoading}
            className="h-11 rounded-xl border-gray-200 bg-white text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
          />
        </div>

        {/* Product */}
        <div className="w-[260px]">
          <SelectWithSearch
            placeholder={t('bookingAllProducts')}
            value={filters.productId}
            onValueChange={(v) => onFilterChange({ productId: v })}
            data={[{ label: t('bookingAllProducts'), value: '' }, ...productOptions]}
            disabled={productsLoading}
            className="h-11 rounded-xl border-gray-200 bg-white text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
          />
        </div>
      </div>
    </div>
  );
}
