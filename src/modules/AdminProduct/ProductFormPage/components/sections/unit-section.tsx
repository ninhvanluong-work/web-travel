import { Boxes, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { UnitFormValues } from '@/lib/validations/product';

export type UnitRow = UnitFormValues;

interface Props {
  value: UnitRow[];
  onChange: (rows: UnitRow[]) => void;
  isSubmitted?: boolean;
}

export function UnitSection({ value, onChange, isSubmitted }: Props) {
  const patch = (index: number, p: Partial<UnitRow>) =>
    onChange(value.map((r, i) => (i === index ? { ...r, ...p } : r)));

  const handleAdd = () => onChange([...value, { name: '', note: '' }]);

  const handleRemove = (index: number) => onChange(value.filter((_, i) => i !== index));

  if (value.length === 0) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2 text-slate-400 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50/40 transition-colors"
      >
        <Boxes size={20} className="opacity-50" />
        <span className="text-sm font-medium">No units yet</span>
        <span className="text-xs">Click to add the first unit (e.g., Adult, Child)</span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2 font-medium text-slate-600 w-8">#</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">Name *</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">Note</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {value.map((row, i) => {
              const nameInvalid = isSubmitted && !row.name.trim();
              return (
                <tr key={row.id ?? `unit-${i}`} className="group">
                  <td className="px-3 py-2 text-slate-400 text-xs">{i + 1}</td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => patch(i, { name: e.target.value })}
                      placeholder="e.g., Adult"
                      aria-invalid={nameInvalid ? true : undefined}
                      className={`w-full text-sm px-2 py-1 rounded-md border bg-white focus:outline-none focus:ring-1 focus:ring-brand-400 ${
                        nameInvalid ? 'border-rose-400 bg-rose-50/40 placeholder:text-rose-300' : 'border-slate-200'
                      }`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.note ?? ''}
                      onChange={(e) => patch(i, { note: e.target.value })}
                      placeholder="Optional note"
                      className="w-full text-sm px-2 py-1 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-400"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(i)}
                      className="p-1 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="xs"
        rounded="md"
        blur={false}
        className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 border border-brand-200 px-3 gap-1"
        onClick={handleAdd}
      >
        <Plus size={12} />
        Add unit
      </Button>
    </div>
  );
}
