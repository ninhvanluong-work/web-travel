import { MapPin, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { PickupCard, type PickupRow } from '../shared/pickup-card';

interface Props {
  value: PickupRow[];
  onChange: (rows: PickupRow[]) => void;
  isSubmitted?: boolean;
}

export function PickupSection({ value, onChange, isSubmitted }: Props) {
  const patch = (index: number, p: Partial<PickupRow>) =>
    onChange(value.map((r, i) => (i === index ? { ...r, ...p } : r)));

  const handleAdd = () => onChange([...value, { name: '', address: '', isPopular: false, mapUrl: '' }]);

  const handleTogglePopular = (index: number) => patch(index, { isPopular: !value[index].isPopular });

  const handleRemove = (index: number) => onChange(value.filter((_, i) => i !== index));

  if (value.length === 0) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2 text-slate-400 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50/40 transition-colors"
      >
        <MapPin size={20} className="opacity-50" />
        <span className="text-sm font-medium">No pickup locations yet</span>
        <span className="text-xs">Click to add the first location</span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {value.map((row, i) => (
          <PickupCard
            key={row.id ?? `pending-${i}`}
            row={row}
            index={i}
            onPatch={(p) => patch(i, p)}
            onBlurSave={() => {}}
            onTogglePopular={() => handleTogglePopular(i)}
            onRemove={() => handleRemove(i)}
            isSubmitted={isSubmitted}
          />
        ))}
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
        Add location
      </Button>
    </div>
  );
}
