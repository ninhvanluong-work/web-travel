import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';

import { useSupplierList } from '@/api/supplier/queries';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { ROUTE } from '@/types';

import { SupplierPagination } from './components/supplier-pagination';
import { SupplierToolbar } from './components/supplier-toolbar';
import { SupplierDeleteModal } from './components/SupplierDeleteModal';
import { SupplierKpiCards } from './components/SupplierKpiCards';
import { SupplierTable } from './components/SupplierTable';
import { useSupplierListState } from './hooks/use-supplier-list-state';

const CLIENT_PAGE_SIZE = 10;

export default function SupplierListPage() {
  const { t } = useTranslation('adminPage');
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useSupplierList({
    variables: { pageSize: 49 },
  } as any);

  const allItems = useMemo(() => data?.items ?? [], [data?.items]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const result = kw
      ? allItems.filter((s) => s.name.toLowerCase().includes(kw) || s.contact.toLowerCase().includes(kw))
      : allItems;
    return [...result].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [allItems, keyword]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / CLIENT_PAGE_SIZE));
  const pageOffset = (page - 1) * CLIENT_PAGE_SIZE;
  const items = filtered.slice(pageOffset, pageOffset + CLIENT_PAGE_SIZE);

  const { deleteTarget, setDeleteTarget, handleDeleteConfirm, isDeleting } = useSupplierListState(refetch);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('supplierListTitle')}</h1>
        <Button
          variant="primary"
          size="xs"
          rounded="md"
          blur={false}
          className="flex items-center gap-1.5 px-5 h-9 bg-brand-500 hover:bg-brand-600 border-0 shadow-theme-xs"
          onClick={() => router.push(ROUTE.ADMIN_SUPPLIERS_CREATE)}
        >
          <Icons.plusCircle size={15} />
          {t('addSupplier')}
        </Button>
      </div>

      <SupplierKpiCards total={allItems.length} />

      <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <SupplierToolbar
          keyword={keyword}
          isFetching={isFetching}
          isLoading={isLoading}
          onKeywordChange={handleKeywordChange}
        />

        <div className="pt-2">
          <SupplierTable suppliers={items} isLoading={isLoading} isFetching={isFetching} onDelete={setDeleteTarget} />
        </div>

        <SupplierPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageOffset={pageOffset}
          itemsCount={items.length}
          onPageChange={setPage}
        />
      </div>

      <SupplierDeleteModal
        target={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
