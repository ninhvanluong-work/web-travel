import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export interface DepartureRow {
  id?: string;
  time: string;
  label: string;
  note: string;
  isActive: boolean;
  order: number;
  _saving?: boolean;
}

interface Props {
  value: DepartureRow[];
  onChange: (rows: DepartureRow[]) => void;
  isSubmitted?: boolean;
}

export function DepartureSection({ value, onChange, isSubmitted }: Props) {
  const patch = (index: number, p: Partial<DepartureRow>) =>
    onChange(value.map((r, i) => (i === index ? { ...r, ...p } : r)));

  const handleAdd = () => onChange([...value, { time: '', label: '', note: '', isActive: true, order: value.length }]);

  const handleRemove = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-medium">
                <th className="py-2.5 pl-3 pr-2 text-left w-24">Time</th>
                <th className="py-2.5 px-2 text-left">Label</th>
                <th className="py-2.5 px-2 text-left">Note</th>
                <th className="py-2.5 px-2 text-center w-16">Active</th>
                <th className="py-2.5 pl-2 pr-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {value.map((row, i) => (
                <tr
                  key={row.id ?? `pending-${i}`}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors"
                >
                  <td className="py-2 pl-3 pr-2">
                    <input
                      type="time"
                      value={row.time}
                      onChange={(e) => patch(i, { time: e.target.value })}
                      className={`w-full rounded-lg border bg-white px-2 py-1.5 text-xs tabular-nums focus:outline-none focus:ring-1 ${
                        isSubmitted && !row.time
                          ? 'border-red-400 text-red-500 focus:ring-red-300'
                          : 'border-slate-200 text-slate-700 focus:ring-brand-300'
                      }`}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      size="sm"
                      placeholder="e.g., Morning departure"
                      value={row.label}
                      onChange={(e) => patch(i, { label: e.target.value })}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      size="sm"
                      placeholder="e.g., Arrive 15 min early"
                      value={row.note}
                      onChange={(e) => patch(i, { note: e.target.value })}
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <Switch
                      checked={row.isActive}
                      onCheckedChange={(checked) => patch(i, { isActive: checked })}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </td>
                  <td className="py-2 pl-2 pr-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemove(i)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
        Add departure time
      </Button>
    </div>
  );
}
