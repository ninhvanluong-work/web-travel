import { CheckCircle2, FileText } from 'lucide-react';
import { useRouter } from 'next/router';

import { useDestinationList, useProductList, useSupplierList } from '@/api/product';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-full bg-slate-50 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Danh sách Tour</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý tất cả các sản phẩm tour du lịch</p>
        </div>
        <Button
          variant="primary"
          size="xs"
          rounded="md"
          blur={false}
          className="flex items-center gap-1.5 px-5 h-9 shadow-sm"
          onClick={() => router.push(ROUTE.ADMIN_PRODUCTS_CREATE)}
        >
          <Icons.plusCircle size={15} />
          Thêm tour mới
        </Button>
      </div>

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

      <ProductFilterBar
        keyword={keyword}
        selects={selects}
        suppliers={suppliers}
        destinations={destinations}
        hasActiveFilters={hasActiveFilters}
        onKeywordChange={setKeyword}
        onSelectChange={updateSelect}
        onReset={resetFilters}
      />

      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {isLoading ? (
          <span className="text-gray-400">Đang tải...</span>
        ) : (
          <>
            <span className="text-gray-700 font-bold text-sm normal-case">{total}</span> tour tìm thấy
          </>
        )}
      </p>

      <ProductTable
        products={items}
        pageOffset={pageOffset}
        isLoading={isLoading || isFetching}
        onChangeStatus={handleChangeStatus}
        onDelete={setDeleteTarget}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {pageOffset + 1}–{Math.min(pageOffset + items.length, total)} / {total} tour
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              rounded="md"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3"
              blur={false}
            >
              « Trước
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'primary' : 'ghost'}
                size="xs"
                rounded="md"
                onClick={() => setPage(p)}
                className="w-8"
                blur={p !== page}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="xs"
              rounded="md"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3"
              blur={false}
            >
              Sau »
            </Button>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        target={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
