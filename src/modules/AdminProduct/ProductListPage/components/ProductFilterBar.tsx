import { useEffect, useState } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProductSelectFilters } from '@/hooks/use-product-filters';
import type { LookupItem } from '@/lib/validations/product';

import { DateRangeDropdown } from './DateRangeDropdown';

interface Props {
  selects: ProductSelectFilters;
  suppliers: LookupItem[];
  destinations: LookupItem[];
  onSelectChange: (patch: ProductSelectFilters) => void;
  onReset: () => void;
}

export function ProductFilterBar({ selects, suppliers, destinations, onSelectChange, onReset }: Props) {
  // Local state to hold selections before "Apply" is clicked
  const [localSelects, setLocalSelects] = useState<ProductSelectFilters>(selects);

  // Sync local state when external state changes (e.g., when popover opens)
  useEffect(() => {
    setLocalSelects(selects);
  }, [selects]);

  const handleUpdateLocal = (patch: Partial<ProductSelectFilters>) => {
    setLocalSelects((prev) => ({ ...prev, ...patch }));
  };

  const handleApply = () => {
    onSelectChange(localSelects);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Supplier */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Nhà cung cấp</p>
        <Select value={localSelects.supplierId} onValueChange={(v) => handleUpdateLocal({ supplierId: v })}>
          <SelectTrigger
            inputSize="sm"
            className="w-full h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl"
          >
            <SelectValue placeholder="Tất cả nhà cung cấp" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-theme-lg">
            <SelectItem value="">Tất cả nhà cung cấp</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Destination */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Điểm đến</p>
        <Select value={localSelects.destinationId} onValueChange={(v) => handleUpdateLocal({ destinationId: v })}>
          <SelectTrigger
            inputSize="sm"
            className="w-full h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl"
          >
            <SelectValue placeholder="Tất cả điểm đến" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-theme-lg">
            <SelectItem value="">Tất cả điểm đến</SelectItem>
            {destinations.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Trạng thái</p>
        <Select value={localSelects.status} onValueChange={(v) => handleUpdateLocal({ status: v })}>
          <SelectTrigger
            inputSize="sm"
            className="w-full h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl"
          >
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-theme-lg">
            <SelectItem value="">Tất cả trạng thái</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
            <SelectItem value="published">Công khai</SelectItem>
            <SelectItem value="hidden">Đã ẩn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date range */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Thời gian tạo</p>
        <DateRangeDropdown
          value={{ fromDate: localSelects.fromDate, toDate: localSelects.toDate }}
          onChange={({ fromDate, toDate }) => handleUpdateLocal({ fromDate, toDate })}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          className="flex-1 h-11 flex items-center justify-center text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
          onClick={onReset}
        >
          Xóa
        </button>
        <button
          type="button"
          className="flex-[2] h-11 flex items-center justify-center text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all shadow-md shadow-brand-500/20"
          onClick={handleApply}
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}
