import dayjs from 'dayjs';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

import type { IProduct } from '@/api/product';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type ProductStatus = 'draft' | 'published' | 'hidden';

const STATUS_CONFIG: Record<ProductStatus, { label: string; className: string }> = {
  draft: { label: 'Bản nháp', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  published: { label: 'Công khai', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  hidden: { label: 'Đã ẩn', className: 'bg-slate-50 text-slate-600 ring-slate-200' },
};

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'published', label: 'Công khai' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'hidden', label: 'Ẩn' },
];

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

interface Props {
  product: IProduct;
  onChangeStatus: (product: IProduct, status: ProductStatus) => void;
  onDelete: (product: IProduct) => void;
}

export function ProductTableRow({ product, onChangeStatus, onDelete }: Props) {
  const statusCfg = STATUS_CONFIG[product.status as ProductStatus] ?? STATUS_CONFIG.draft;

  return (
    <TableRow className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
      {/* Tour name */}
      <TableCell className="py-6">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold',
              getAvatarColor(product.name)
            )}
          >
            {product.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="font-semibold text-sm text-gray-900 dark:text-white/90 hover:text-brand-600 transition-colors line-clamp-1 block"
            >
              {product.name}
            </Link>
            {product.code && <p className="text-[11px] text-gray-400">{product.code}</p>}
          </div>
        </div>
      </TableCell>

      {/* Supplier */}
      <TableCell className="py-6">
        {product.supplier ? (
          <span className="text-sm text-gray-700 truncate max-w-[140px] block">{product.supplier.name}</span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </TableCell>

      {/* Destination */}
      <TableCell className="py-6 text-sm text-gray-600">
        {product.destination?.name ?? <span className="text-gray-400">—</span>}
      </TableCell>

      {/* Status badge — static display */}
      <TableCell className="py-6">
        <span
          className={cn(
            'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ring-1',
            statusCfg.className
          )}
        >
          {statusCfg.label}
        </span>
      </TableCell>

      {/* Price */}
      <TableCell className="py-6 text-sm font-medium text-orange-600 whitespace-nowrap">
        {formatPrice(product.minPrice)}
      </TableCell>

      {/* Rating */}
      <TableCell className="py-6">
        <StarRating point={product.reviewPoint} />
      </TableCell>

      {/* Created at */}
      <TableCell className="py-6 text-xs text-gray-500 whitespace-nowrap">
        {dayjs(product.createdAt).format('DD/MM/YYYY')}
      </TableCell>

      {/* Actions — "..." menu only */}
      <TableCell className="w-14">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center h-11 w-11 rounded-xl text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-all"
            >
              <MoreHorizontal size={28} strokeWidth={2.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            {/* Edit */}
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${product.id}/edit`} className="flex items-center">
                <Pencil size={14} className="mr-2" />
                Chỉnh sửa
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Status change options */}
            {STATUS_OPTIONS.filter((o) => o.value !== product.status).map((opt) => (
              <DropdownMenuItem key={opt.value} onSelect={() => onChangeStatus(product, opt.value)}>
                {opt.label}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* Delete */}
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onSelect={() => onDelete(product)}
            >
              <Trash2 size={14} className="mr-2" />
              Xóa tour
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
