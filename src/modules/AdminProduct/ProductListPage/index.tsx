import { CheckCircle2, FileText, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { useDestinationList, useProductList, useSupplierList } from '@/api/product';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatCard } from '@/components/ui/stat-card';
import { useProductFilters } from '@/hooks/use-product-filters';
import { ROUTE } from '@/types/routes';

import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { ProductFilterBar } from './components/ProductFilterBar';
import { ProductTable } from './components/ProductTable';
import { useProductListActions } from './hooks/use-product-list-actions';

const PAGE_SIZE = 10;

export default function ProductListPage() {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);

  const { keyword, setKeyword, selects, updateSelect, hasActiveFilters, resetFilters, page, setPage, queryFilters } =
    useProductFilters();

  const { data: suppliersData } = useSupplierList();
  const { data: destinationsData } = useDestinationList();
  const suppliers = suppliersData ?? [];
  const destinations = destinationsData ?? [];

  const { data, isLoading, isFetching, refetch } = useProductList({
    variables: {
      keyword: queryFilters.keyword || undefined,
      supplierId: queryFilters.supplierId || undefined,
      destinationId: queryFilters.destinationId || undefined,
      status: queryFilters.status || undefined,
      fromDate: queryFilters.fromDate || undefined,
      toDate: queryFilters.toDate || undefined,
      page,
      pageSize: PAGE_SIZE,
    },
    keepPreviousData: true,
  } as any);

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;
  const pageOffset = (page - 1) * PAGE_SIZE;

  const publishedCount = items.filter((p) => p.status === 'published').length;
  const draftCount = items.filter((p) => p.status === 'draft').length;

  const { deleteTarget, setDeleteTarget, handleChangeStatus, handleDeleteConfirm } = useProductListActions(refetch);

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Danh sách Tour</h1>
        <Button
          variant="primary"
          size="xs"
          rounded="md"
          blur={false}
          className="flex items-center gap-1.5 px-5 h-9 bg-brand-500 hover:bg-brand-600 border-0 shadow-theme-xs"
          onClick={() => router.push(ROUTE.ADMIN_PRODUCTS_CREATE)}
        >
          <Icons.plusCircle size={15} />
          Thêm tour mới
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Tổng số tour"
          value={total}
          icon={Icons.packageIcon}
          accentClass="bg-blue-500"
          lightBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
        />
        <StatCard
          label="Đang công khai"
          value={publishedCount}
          icon={CheckCircle2}
          accentClass="bg-emerald-500"
          lightBgClass="bg-emerald-50"
          iconColorClass="text-emerald-600"
        />
        <StatCard
          label="Bản nháp"
          value={draftCount}
          icon={FileText}
          accentClass="bg-amber-400"
          lightBgClass="bg-amber-50"
          iconColorClass="text-amber-600"
        />
      </div>

      {/* Main table card */}
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Toolbar row */}
        <div className="px-5 py-5 flex items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative flex-1 max-w-sm">
            <Icons.search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Tìm kiếm tour..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 transition dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 h-11 px-5 rounded-xl border text-sm font-medium shadow-theme-xs transition-all ${
                    hasActiveFilters
                      ? 'border-brand-300 text-brand-600 bg-brand-50'
                      : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300'
                  }`}
                >
                  <SlidersHorizontal size={16} />
                  Bộ lọc
                  {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" />}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[350px] p-7 rounded-2xl shadow-theme-lg border-gray-100 bg-white dark:bg-gray-900"
              >
                <div className="flex items-center justify-between mb-6">
                  <p className="text-base font-bold text-gray-900 dark:text-white text-nowrap">Bộ lọc nâng cao</p>
                  {hasActiveFilters && (
                    <button onClick={resetFilters} className="text-xs text-brand-600 hover:underline font-medium">
                      Xóa tất cả
                    </button>
                  )}
                </div>
                <ProductFilterBar
                  selects={selects}
                  suppliers={suppliers}
                  destinations={destinations}
                  hasActiveFilters={hasActiveFilters}
                  onSelectChange={updateSelect}
                  onReset={() => {
                    resetFilters();
                    setFilterOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Table Content with spacer */}
        <div className="pt-2">
          <ProductTable
            products={items}
            isLoading={isLoading || isFetching}
            onChangeStatus={handleChangeStatus}
            onDelete={setDeleteTarget}
          />
        </div>

        {/* Pagination - TailAdmin Style */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-5 flex items-center justify-between bg-white dark:bg-transparent">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Hiển thị{' '}
            <span className="text-gray-900 dark:text-white">
              {pageOffset + 1}–{Math.min(pageOffset + items.length, total)}
            </span>{' '}
            / <span className="text-gray-900 dark:text-white">{total}</span> tour
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              <Icons.chevronLeft size={16} />
              Trước
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-lg text-sm font-semibold transition-all ${
                      p === page
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              Sau
              <Icons.chevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        target={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
