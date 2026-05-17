import { ChevronsUpDown } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';

import type { IProduct } from '@/api/product';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ROUTE } from '@/types/routes';

import { ProductTableRow } from './ProductTableRow';

type ProductStatus = 'draft' | 'published' | 'hidden';

interface ProductTableProps {
  products: IProduct[];
  isLoading?: boolean;
  onChangeStatus: (product: IProduct, status: ProductStatus) => void;
  onDelete: (product: IProduct) => void;
}

type SortKey = 'name' | 'minPrice' | 'createdAt';

function SortableHeader({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sort: { key: SortKey; dir: 'asc' | 'desc' } | null;
  onSort: (key: SortKey) => void;
}) {
  const active = sort?.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 group hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
    >
      {label}
      <ChevronsUpDown size={12} className={active ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-500'} />
    </button>
  );
}

export function ProductTable({ products, isLoading, onChangeStatus, onDelete }: ProductTableProps) {
  const router = useRouter();
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' } | null>(null);

  function handleSort(key: SortKey) {
    setSort((prev) => (prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  }

  const sorted = [...products].sort((a, b) => {
    if (!sort) return 0;
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (sort.key === 'name') return a.name.localeCompare(b.name) * dir;
    if (sort.key === 'minPrice') return (a.minPrice - b.minPrice) * dir;
    if (sort.key === 'createdAt') return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
    return 0;
  });

  const thClass =
    '!text-[11px] !font-semibold !uppercase !tracking-wide !text-gray-500 dark:!text-gray-400 !px-5 !py-3.5 !h-auto';

  return (
    <div className={`overflow-x-auto transition-opacity ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-gray-800">
            <TableHead className={`${thClass} min-w-[220px]`}>
              <SortableHeader label="Tên tour" sortKey="name" sort={sort} onSort={handleSort} />
            </TableHead>
            <TableHead className={`${thClass} min-w-[160px]`}>Nhà cung cấp</TableHead>
            <TableHead className={`${thClass} min-w-[120px]`}>Điểm đến</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>Trạng thái</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>
              <SortableHeader label="Giá từ" sortKey="minPrice" sort={sort} onSort={handleSort} />
            </TableHead>
            <TableHead className={`${thClass} min-w-[120px]`}>Đánh giá</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>
              <SortableHeader label="Ngày tạo" sortKey="createdAt" sort={sort} onSort={handleSort} />
            </TableHead>
            <TableHead className={`${thClass} !w-14`} />
          </TableRow>
        </TableHeader>

        <TableBody className="[&_td]:px-5 [&_td]:py-4">
          {sorted.length === 0 ? (
            <TableRow>
              <td colSpan={8}>
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                  <Icons.packageIcon size={40} className="opacity-25" />
                  <p className="text-sm font-medium text-gray-500">Chưa có tour nào</p>
                  <p className="text-xs text-gray-400">Nhấn nút bên dưới để tạo tour đầu tiên</p>
                  <Button
                    variant="primary"
                    size="xs"
                    rounded="md"
                    blur={false}
                    className="mt-1 flex items-center gap-1.5 px-4"
                    onClick={() => router.push(ROUTE.ADMIN_PRODUCTS_CREATE)}
                  >
                    <Icons.plusCircle size={14} />
                    Thêm tour mới
                  </Button>
                </div>
              </td>
            </TableRow>
          ) : (
            sorted.map((product) => (
              <ProductTableRow key={product.id} product={product} onChangeStatus={onChangeStatus} onDelete={onDelete} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
