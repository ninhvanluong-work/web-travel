import type { ITourGuide } from '@/api/tour-guide/types';
import { Icons } from '@/assets/icons';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { GuideTableRow } from './GuideTableRow';

interface GuideTableProps {
  guides: ITourGuide[];
  isLoading?: boolean;
  onDelete: (guide: ITourGuide) => void;
}

const thClass =
  '!text-[11px] !font-semibold !uppercase !tracking-wide !text-gray-500 dark:!text-gray-400 !px-5 !py-3.5 !h-auto';

export function GuideTable({ guides, isLoading, onDelete }: GuideTableProps) {
  return (
    <div className={`overflow-x-auto transition-opacity ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-gray-800">
            <TableHead className={`${thClass} min-w-[220px]`}>Guide</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>Exp (năm)</TableHead>
            <TableHead className={`${thClass} min-w-[140px]`}>Rating</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>Tours Led</TableHead>
            <TableHead className={`${thClass} whitespace-nowrap`}>Ngày tạo</TableHead>
            <TableHead className={`${thClass} !w-14`} />
          </TableRow>
        </TableHeader>

        <TableBody className="[&_td]:px-5 [&_td]:py-4">
          {guides.length === 0 ? (
            <TableRow>
              <td colSpan={6}>
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                  <Icons.user size={40} className="opacity-25" />
                  <p className="text-sm font-medium text-gray-500">No guides yet</p>
                </div>
              </td>
            </TableRow>
          ) : (
            guides.map((guide) => <GuideTableRow key={guide.id} guide={guide} onDelete={onDelete} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
