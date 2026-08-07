import { Package, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { OptionCard, type OptionRow } from '../shared/option-card';

interface Props {
  value: OptionRow[];
  onChange: (rows: OptionRow[]) => void;
  isSubmitted?: boolean;
}

export function OptionsSection({ value, onChange, isSubmitted }: Props) {
  const patch = (index: number, p: Partial<OptionRow>) =>
    onChange(value.map((r, i) => (i === index ? { ...r, ...p } : r)));

  const handleAdd = () =>
    onChange([...value, { title: '', isActive: true, currency: 'VND', description: null, include: [] }]);

  const handleClone = (index: number) => {
    const src = value[index];
    onChange([...value, { ...src, id: undefined }]);
  };

  const handleRemove = (index: number) => onChange(value.filter((_, i) => i !== index));

  if (value.length === 0) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2 text-slate-400 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50/40 transition-colors"
      >
        <Package size={20} className="opacity-50" />
        <span className="text-sm font-medium">No packages yet</span>
        <span className="text-xs">Click to add the first package</span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {value.map((row, i) => (
        <OptionCard
          key={row.id ?? `pending-${i}`}
          row={row}
          index={i}
          onPatch={(p) => patch(i, p)}
          onClone={() => handleClone(i)}
          onRemove={() => handleRemove(i)}
          isSubmitted={isSubmitted}
        />
      ))}

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
        Add package
      </Button>
    </div>
  );
}
