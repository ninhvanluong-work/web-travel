import dayjs from 'dayjs';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { ITourGuide } from '@/api/tour-guide/types';
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
import { ROUTE } from '@/types/routes';

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

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={cn(
            'w-3.5 h-3.5',
            i <= Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
          )}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">({value.toFixed(1)})</span>
    </div>
  );
}

interface Props {
  guide: ITourGuide;
  onDelete: (guide: ITourGuide) => void;
}

export function GuideTableRow({ guide, onDelete }: Props) {
  return (
    <TableRow className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
      {/* Guide */}
      <TableCell className="py-4">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
            {guide.avatar ? (
              <Image src={guide.avatar} alt={guide.name} fill className="object-cover" sizes="36px" />
            ) : (
              <div
                className={cn(
                  'w-full h-full flex items-center justify-center text-white text-xs font-bold',
                  getAvatarColor(guide.name)
                )}
              >
                {guide.name[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={ROUTE.ADMIN_GUIDES_EDIT(guide.id)}
              className="font-semibold text-sm text-gray-900 dark:text-white/90 hover:text-brand-600 transition-colors line-clamp-1 block"
            >
              {guide.name}
            </Link>
            <p className="text-[11px] text-gray-400">ID-{guide.id.slice(-4).toUpperCase()}</p>
          </div>
        </div>
      </TableCell>

      {/* Exp */}
      <TableCell className="py-4">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200">
          {guide.expYear} năm
        </span>
      </TableCell>

      {/* Rating */}
      <TableCell className="py-4">
        <StarRating value={guide.ratingValue} />
      </TableCell>

      {/* Tours led */}
      <TableCell className="py-4 text-sm text-gray-700">{guide.ratingCount}</TableCell>

      {/* Created at */}
      <TableCell className="py-4 text-xs text-gray-500 whitespace-nowrap">
        {dayjs(guide.createdAt).format('DD/MM/YYYY')}
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
              <Link href={ROUTE.ADMIN_GUIDES_EDIT(guide.id)} className="flex items-center">
                <Pencil size={14} className="mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onSelect={() => onDelete(guide)}
            >
              <Trash2 size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
