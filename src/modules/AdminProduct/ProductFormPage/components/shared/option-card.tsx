import { Copy, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export interface OptionRow {
  id?: string;
  title: string;
  isActive: boolean;
  currency: string;
  description?: string | null;
  include: string[];
  _saving?: boolean;
}

interface Props {
  row: OptionRow;
  index: number;
  onPatch: (patch: Partial<OptionRow>) => void;
  onClone: () => void;
  onRemove: () => void;
  isSubmitted?: boolean;
}

export function OptionCard({ row, index, onPatch, onClone, onRemove, isSubmitted }: Props) {
  const titleError = isSubmitted && !row.title.trim();
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white overflow-hidden transition-opacity ${
        row._saving ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50/50">
        <span className="text-xs font-semibold text-slate-400 tabular-nums w-5 shrink-0">#{index + 1}</span>
        <span className="flex-1 text-xs font-medium text-slate-600 truncate">
          {row.title || <span className="text-slate-400 font-normal">Untitled package</span>}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">{row.isActive ? 'Active' : 'Inactive'}</span>
          <Switch
            checked={row.isActive}
            disabled={row._saving}
            onCheckedChange={(checked) => onPatch({ isActive: checked })}
            className="data-[state=checked]:bg-emerald-500"
          />
          <button
            type="button"
            title="Clone"
            disabled={row._saving}
            onClick={onClone}
            className="text-slate-400 hover:text-brand-600 transition-colors disabled:opacity-40"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            title="Delete"
            disabled={row._saving}
            onClick={onRemove}
            className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-3 py-3">
        <div className="space-y-1">
          <label className="text-[11px] text-slate-500 font-medium">Package name</label>
          <Input
            size="sm"
            placeholder="e.g., Standard, Premium..."
            value={row.title}
            disabled={row._saving}
            aria-invalid={titleError ? true : undefined}
            onChange={(e) => onPatch({ title: e.target.value })}
            className={titleError ? 'border-red-400 focus-visible:ring-red-300' : undefined}
          />
          {titleError && <p className="text-[11px] text-red-500">Package name is required</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-500 font-medium">Include (one per line)</label>
          <textarea
            rows={Math.max(3, row.include.length + 1)}
            placeholder={'Shared guide\nLunch included\nTransport'}
            value={row.include.join('\n')}
            disabled={row._saving}
            onChange={(e) =>
              onPatch({
                include: e.target.value
                  .split('\n')
                  .map((s) => s.trimStart())
                  .filter(Boolean),
              })
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-300 resize-none disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
