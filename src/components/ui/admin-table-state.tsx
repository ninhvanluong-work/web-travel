import { Loader2, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { TableRow } from '@/components/ui/table';

interface AdminTableLoadingRowProps {
  colSpan: number;
}

/** Full-width spinner row for the first load of an admin table (before any data exists). */
export function AdminTableLoadingRow({ colSpan }: AdminTableLoadingRowProps) {
  return (
    <TableRow>
      <td colSpan={colSpan}>
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
      </td>
    </TableRow>
  );
}

interface AdminTableEmptyRowProps {
  colSpan: number;
  icon: LucideIcon;
  title: string;
  description?: string;
  /** e.g. "Clear search" when filtered, or a create button when the table is truly empty */
  action?: ReactNode;
}

/** Full-width empty-state row: "no records yet" or "nothing matches the search / filters". */
export function AdminTableEmptyRow({ colSpan, icon: Icon, title, description, action }: AdminTableEmptyRowProps) {
  return (
    <TableRow>
      <td colSpan={colSpan}>
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <Icon size={40} className="opacity-25" />
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {description ? <p className="text-xs text-gray-400">{description}</p> : null}
          {action}
        </div>
      </td>
    </TableRow>
  );
}

interface AdminClearFiltersButtonProps {
  label: string;
  onClick: () => void;
}

/** Text button shown in a filtered empty state, same style as the User / Destination lists. */
export function AdminClearFiltersButton({ label, onClick }: AdminClearFiltersButtonProps) {
  return (
    <button type="button" onClick={onClick} className="text-xs text-brand-600 hover:underline">
      {label}
    </button>
  );
}
