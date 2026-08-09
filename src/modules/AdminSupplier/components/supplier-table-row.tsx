import dayjs from 'dayjs';
import { MoreHorizontal, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import type { ISupplier } from '@/api/supplier/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ROUTE } from '@/types';

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

interface SupplierTableRowProps {
  supplier: ISupplier;
  onDelete: (supplier: ISupplier) => void;
}

export function SupplierTableRow({ supplier, onDelete }: SupplierTableRowProps) {
  const { t } = useTranslation('adminPage');

  return (
    <TableRow className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
      {/* Avatar + Name */}
      <TableCell className="py-4">
        <div className="flex items-center gap-2.5">
          <Link
            href={ROUTE.ADMIN_SUPPLIERS_EDIT(supplier.id)}
            className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 block"
          >
            {supplier.avatar?.startsWith('http') ? (
              <Image src={supplier.avatar} alt={supplier.name} fill className="object-cover" sizes="36px" />
            ) : (
              <div
                className={cn(
                  'w-full h-full flex items-center justify-center text-white text-xs font-bold',
                  getAvatarColor(supplier.name)
                )}
              >
                {supplier.name[0].toUpperCase()}
              </div>
            )}
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                href={ROUTE.ADMIN_SUPPLIERS_EDIT(supplier.id)}
                className="font-semibold text-sm text-gray-900 dark:text-white/90 hover:text-brand-600 transition-colors line-clamp-1"
              >
                {supplier.name}
              </Link>
              {supplier.isVerified && <ShieldCheck size={14} className="text-emerald-500 shrink-0" />}
            </div>
            <p className="text-[11px] text-gray-400">ID-{supplier.id.slice(-4).toUpperCase()}</p>
          </div>
        </div>
      </TableCell>

      {/* Contact */}
      <TableCell className="py-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
        {supplier.contact || '—'}
      </TableCell>

      {/* Created At */}
      <TableCell className="py-4 text-xs text-gray-500 whitespace-nowrap">
        {dayjs(supplier.createdAt).format('DD/MM/YYYY')}
      </TableCell>

      {/* Updated At */}
      <TableCell className="py-4 text-xs text-gray-500 whitespace-nowrap">
        {dayjs(supplier.updatedAt).format('DD/MM/YYYY')}
      </TableCell>

      {/* Actions */}
      <TableCell className="w-14">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-11 w-11 rounded-xl text-gray-500 hover:text-brand-600 hover:bg-brand-50 p-0"
            >
              <MoreHorizontal size={28} strokeWidth={2.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuItem asChild>
              <Link href={ROUTE.ADMIN_SUPPLIERS_EDIT(supplier.id)} className="flex items-center">
                <Pencil size={14} className="mr-2" />
                {t('edit')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onSelect={() => onDelete(supplier)}
            >
              <Trash2 size={14} className="mr-2" />
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
