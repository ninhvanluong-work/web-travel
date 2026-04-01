import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ItineraryFormValues } from '@/lib/validations/product';

import { ItineraryFormRow } from '../shared/ItineraryFormRow';

interface ItineraryTabProps {
  itineraries: ItineraryFormValues[];
  onChange: (itineraries: ItineraryFormValues[]) => void;
}

const DEFAULT_ITINERARY: ItineraryFormValues = {
  name: '',
  featured_name: '',
  order: 1,
  description: '',
};

export function ItineraryTab({ itineraries, onChange }: ItineraryTabProps) {
  const handleChange = (index: number, patch: Partial<ItineraryFormValues>) => {
    onChange(itineraries.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const handleRemove = (index: number) => {
    const updated = itineraries.filter((_, i) => i !== index).map((it, i) => ({ ...it, order: i + 1 }));
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...itineraries, { ...DEFAULT_ITINERARY, order: itineraries.length + 1 }]);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Lịch trình</h2>
          <Button
            type="button"
            variant="primary"
            size="xs"
            rounded="md"
            className="flex items-center gap-1 px-3"
            blur={false}
            onClick={handleAdd}
          >
            <Plus size={14} />
            Thêm ngày
          </Button>
        </div>

        {itineraries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Chưa có lịch trình nào. Nhấn &quot;Thêm ngày&quot; để tạo.
          </p>
        ) : (
          <div className="space-y-3">
            {itineraries
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((it, i) => (
                <ItineraryFormRow key={i} value={it} index={i} onChange={handleChange} onRemove={handleRemove} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
