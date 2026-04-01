import dayjs from 'dayjs';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/router';

import type { IProduct } from '@/api/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-red-500',
  'bg-yellow-500',
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

const STATUS_BADGE: Record<string, { variant: 'warning' | 'success' | 'secondary'; label: string }> = {
  draft: { variant: 'warning', label: 'Bản nháp' },
  published: { variant: 'success', label: 'Công khai' },
};

function StarRating({ point }: { point: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={cn(
            'w-3.5 h-3.5',
            i <= Math.round(point) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
          )}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">({point})</span>
    </div>
  );
}

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)}đ`;
}

interface ProductTableRowProps {
  product: IProduct;
  index: number;
  onTogglePublish: (product: IProduct) => void;
  onDelete: (product: IProduct) => void;
}

export function ProductTableRow({ product, index, onTogglePublish, onDelete }: ProductTableRowProps) {
  const router = useRouter();
  const statusInfo = STATUS_BADGE[product.status] ?? STATUS_BADGE.draft;

  return (
    <TableRow className="hover:bg-slate-50/70 transition-colors">
      <TableCell className="text-center text-sm text-gray-500">{index + 1}</TableCell>

      {/* Tên tour */}
      <TableCell>
        <p className="font-semibold text-sm text-gray-900 line-clamp-1">{product.name}</p>
        {product.code && <p className="text-[11px] text-gray-400">{product.code}</p>}
      </TableCell>

      {/* Nhà cung cấp */}
      <TableCell>
        {product.supplier ? (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'rounded-full w-7 h-7 flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
                getAvatarColor(product.supplier.name)
              )}
            >
              {product.supplier.name[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 truncate max-w-[120px]">{product.supplier.name}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </TableCell>

      {/* Điểm đến */}
      <TableCell className="text-sm text-gray-600">
        {product.destination?.name ?? <span className="text-gray-400">—</span>}
      </TableCell>

      {/* Trạng thái */}
      <TableCell>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </TableCell>

      {/* Giá từ */}
      <TableCell className="text-sm font-medium text-orange-600 whitespace-nowrap">
        {formatPrice(product.minPrice)}
      </TableCell>

      {/* Đánh giá */}
      <TableCell>
        <StarRating point={product.reviewPoint} />
      </TableCell>

      {/* Ngày tạo */}
      <TableCell className="text-xs text-gray-500 whitespace-nowrap">
        {dayjs(product.createdAt).format('DD/MM/YYYY')}
      </TableCell>

      {/* Thao tác */}
      <TableCell>
        <div className="flex items-center gap-1">
          <Tooltip label="Chỉnh sửa">
            <Button
              variant="ghost"
              size="icon"
              rounded="md"
              onClick={() => router.push(`/admin/products/${product.id}/edit`)}
            >
              <Pencil size={15} className="text-gray-600" />
            </Button>
          </Tooltip>

          <Tooltip label={product.status === 'published' ? 'Gỡ về nháp' : 'Đăng công khai'}>
            <button
              type="button"
              onClick={() => onTogglePublish(product)}
              className={cn(
                'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
                product.status === 'published' ? 'bg-green-500' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200',
                  product.status === 'published' ? 'translate-x-4' : 'translate-x-0.5'
                )}
              />
            </button>
          </Tooltip>

          <Tooltip label="Xóa sản phẩm">
            <Button
              variant="ghost"
              size="icon"
              rounded="md"
              className="hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(product)}
            >
              <Trash2 size={15} />
            </Button>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}
