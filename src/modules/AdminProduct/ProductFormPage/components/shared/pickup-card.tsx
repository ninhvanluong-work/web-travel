import { Star, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';

export interface PickupRow {
  id?: string;
  name: string;
  address: string;
  isPopular: boolean;
  mapUrl: string;
  _saving?: boolean;
}

interface Props {
  row: PickupRow;
  index: number;
  onPatch: (patch: Partial<PickupRow>) => void;
  onBlurSave: () => void;
  onTogglePopular: () => void;
  onRemove: () => void;
  isSubmitted?: boolean;
}

export function PickupCard({ row, index, onPatch, onBlurSave, onTogglePopular, onRemove, isSubmitted }: Props) {
  const nameError = isSubmitted && !row.name.trim();
  return (
    <div
      className={`rounded-xl border bg-white overflow-hidden transition-opacity ${
        row._saving ? 'opacity-60' : ''
      } border-slate-200`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 bg-slate-50/50">
        <span className="text-xs font-semibold text-slate-500 flex-1">Location #{index + 1}</span>
        <button
          type="button"
          disabled={row._saving}
          onClick={onTogglePopular}
          title={row.isPopular ? 'Popular location' : 'Mark as popular'}
          className={`shrink-0 transition-colors ${
            row.isPopular ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'
          }`}
        >
          <Star size={14} fill={row.isPopular ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          disabled={row._saving}
          onClick={onRemove}
          className="shrink-0 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-40"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="px-3 py-3 space-y-2">
        <div className="space-y-1">
          <label className="text-[11px] text-slate-500 font-medium">
            Location Name <span className="text-red-500">*</span>
          </label>
          <Input
            size="sm"
            placeholder="e.g., Hoan Kiem Lake, Hotel lobby..."
            value={row.name}
            disabled={row._saving}
            aria-invalid={nameError ? true : undefined}
            className={
              nameError ? 'border-red-400 text-red-600 focus-visible:ring-red-400 placeholder:text-red-300' : undefined
            }
            onChange={(e) => onPatch({ name: e.target.value })}
            onBlur={onBlurSave}
          />
          {nameError && <p className="text-[11px] text-red-500 mt-1 font-medium">Location name is required</p>}
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-slate-500 font-medium">Address</label>
          <Input
            size="sm"
            placeholder="Address"
            value={row.address}
            disabled={row._saving}
            onChange={(e) => onPatch({ address: e.target.value })}
            onBlur={onBlurSave}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-slate-500 font-medium">Map URL</label>
          <Input
            size="sm"
            placeholder="Map URL (Goong / Google Maps)"
            value={row.mapUrl}
            disabled={row._saving}
            onChange={(e) => onPatch({ mapUrl: e.target.value })}
            onBlur={onBlurSave}
          />
        </div>
      </div>
    </div>
  );
}
