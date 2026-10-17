import dayjs from 'dayjs';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { memo } from 'react';

import type { IDestination } from '@/api/destination/types';
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

import { DESTINATION_NS, DESTINATION_ROUTES } from '../../constants';
import { UserChip } from './user-name-label';

const WHITESPACE_RE = /\s+/g;

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

/** Collapse paragraphs into one line so `line-clamp` shows real content instead of blank lines. */
function toPreview(text: string) {
  return text.replace(WHITESPACE_RE, ' ').trim();
}

function DateCell({ date }: { date: string }) {
  const d = dayjs(date);
  return (
    <div className="leading-tight tabular-nums">
      <p className="text-xs text-gray-700 dark:text-gray-300">{d.format('DD/MM/YYYY')}</p>
      <p className="mt-0.5 text-[11px] text-gray-400">{d.format('HH:mm')}</p>
    </div>
  );
}

interface Props {
  destination: IDestination;
  onDelete: (destination: IDestination) => void;
}

function DestinationTableRowBase({ destination, onDelete }: Props) {
  const { t } = useTranslation(DESTINATION_NS);
  const editHref = DESTINATION_ROUTES.EDIT(destination.id);
  const preview = toPreview(destination.description);

  return (
    <TableRow className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
      {/* Name */}
      <TableCell className="py-6">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-[32px] h-[32px] min-w-[32px] rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold',
              getAvatarColor(destination.name)
            )}
          >
            {destination.name.charAt(0).toUpperCase()}
          </div>
          {/* min-w-0 wrapper: lets the name truncate instead of squeezing the avatar */}
          <div className="min-w-0">
            <Link
              href={editHref}
              className="block truncate font-semibold text-sm text-gray-900 dark:text-white/90 hover:text-brand-600 transition-colors"
            >
              {destination.name}
            </Link>
          </div>
        </div>
      </TableCell>

      {/* Description preview */}
      <TableCell className="py-6 max-w-[420px]">
        {preview ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{preview}</p>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </TableCell>

      {/* Created by / at */}
      <TableCell className="py-6">
        <UserChip userId={destination.createdBy} />
      </TableCell>
      <TableCell className="py-6 whitespace-nowrap">
        <DateCell date={destination.createdAt} />
      </TableCell>

      {/* Updated by / at */}
      <TableCell className="py-6">
        <UserChip userId={destination.updatedBy} />
      </TableCell>
      <TableCell className="py-6 whitespace-nowrap">
        <DateCell date={destination.updatedAt} />
      </TableCell>

      {/* Actions */}
      <TableCell className="w-14">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              aria-label={t('actions')}
              className="h-11 w-11 rounded-xl text-gray-500 hover:text-brand-600 hover:bg-brand-50 p-0"
            >
              <MoreHorizontal size={28} strokeWidth={2.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuItem asChild>
              <Link href={editHref} className="flex items-center">
                <Pencil size={14} className="mr-2" />
                {t('edit')}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onSelect={() => onDelete(destination)}
            >
              <Trash2 size={14} className="mr-2" />
              {t('deleteDestination')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export const DestinationTableRow = memo(DestinationTableRowBase);
