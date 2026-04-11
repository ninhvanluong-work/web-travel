import dayjs from 'dayjs';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

import type { IProduct } from '@/api/product';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

type ProductStatus = 'draft' | 'published' | 'hidden';

const STATUS_CONFIG: Record<ProductStatus, { label: string; className: string }> = {
  draft: { label: 'Bản nháp', className: 'bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100' },
  published: { label: 'Công khai', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100' },
  hidden: { label: 'Đã ẩn', className: 'bg-slate-50 text-slate-600 ring-slate-200 hover:bg-slate-100' },
};

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'published', label: '✅ Công khai' },
  { value: 'draft', label: '📝 Bản nháp' },
  { value: 'hidden', label: '🙈 Ẩn' },
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

interface Props {
  product: IProduct;
  index: number;
  onChangeStatus: (product: IProduct, status: ProductStatus) => void;
  onDelete: (product: IProduct) => void;
}

export function ProductTableRow({ product, index, onChangeStatus, onDelete }: Props) {
  const statusCfg = STATUS_CONFIG[product.status as ProductStatus] ?? STATUS_CONFIG.draft;

  return (
    <TableRow className="hover:bg-slate-50/70 transition-colors">
      <TableCell className="text-center text-sm text-gray-500">{index + 1}</TableCell>

      {/* Tour name — clickable link */}
      <TableCell>
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="font-semibold text-sm text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
        >
          {product.name}
        </Link>
        {product.code && <p className="text-[11px] text-gray-400">{product.code}</p>}
      </TableCell>

      {/* Supplier */}
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

      {/* Destination */}
      <TableCell className="text-sm text-gray-600">
        {product.destination?.name ?? <span className="text-gray-400">—</span>}
      </TableCell>

      {/* Status badge — click to change */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ring-1 cursor-pointer transition-colors',
                statusCfg.className
              )}
            >
              {statusCfg.label}
              <span className="opacity-50">▾</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px]">
            {STATUS_OPTIONS.filter((o) => o.value !== product.status).map((opt) => (
              <DropdownMenuItem key={opt.value} onSelect={() => onChangeStatus(product, opt.value)}>
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>

      {/* Price */}
      <TableCell className="text-sm font-medium text-orange-600 whitespace-nowrap">
        {formatPrice(product.minPrice)}
      </TableCell>

      {/* Rating */}
      <TableCell>
        <StarRating point={product.reviewPoint} />
      </TableCell>

      {/* Created at */}
      <TableCell className="text-xs text-gray-500 whitespace-nowrap">
        {dayjs(product.createdAt).format('DD/MM/YYYY')}
      </TableCell>

      {/* Actions: edit + 3-dot menu */}
      <TableCell>
        <div className="flex items-center gap-1">
          <Tooltip label="Chỉnh sửa">
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Pencil size={15} />
            </Link>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onSelect={() => onDelete(product)}
              >
                <Trash2 size={14} className="mr-2" />
                Xóa tour
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
