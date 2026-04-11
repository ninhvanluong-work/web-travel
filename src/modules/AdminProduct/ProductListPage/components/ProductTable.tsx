import { useRouter } from 'next/router';

import type { IProduct } from '@/api/product';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ROUTE } from '@/types/routes';

import { ProductTableRow } from './ProductTableRow';

type ProductStatus = 'draft' | 'published' | 'hidden';

interface ProductTableProps {
  products: IProduct[];
  pageOffset: number;
  isLoading?: boolean;
  onChangeStatus: (product: IProduct, status: ProductStatus) => void;
  onDelete: (product: IProduct) => void;
}

const COLUMNS = [
  { label: '#', className: 'w-10 text-center' },
  { label: 'Tên tour', className: 'min-w-[200px]' },
  { label: 'Nhà cung cấp', className: 'min-w-[160px]' },
  { label: 'Điểm đến', className: 'min-w-[120px]' },
  { label: 'Trạng thái', className: 'whitespace-nowrap' },
  { label: 'Giá từ', className: 'whitespace-nowrap' },
  { label: 'Đánh giá', className: 'min-w-[120px]' },
  { label: 'Ngày tạo', className: 'whitespace-nowrap' },
  { label: '', className: 'w-24' },
];

export function ProductTable({ products, pageOffset, isLoading, onChangeStatus, onDelete }: ProductTableProps) {
  const router = useRouter();
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto transition-opacity ${
        isLoading ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-gray-200">
            {COLUMNS.map((col, i) => (
              <TableHead
                key={i}
                className={`text-[11px] font-semibold uppercase tracking-wide text-gray-500 py-3 ${col.className}`}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <td colSpan={COLUMNS.length}>
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
            products.map((product, i) => (
              <ProductTableRow
                key={product.id}
                product={product}
                index={pageOffset + i}
                onChangeStatus={onChangeStatus}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
