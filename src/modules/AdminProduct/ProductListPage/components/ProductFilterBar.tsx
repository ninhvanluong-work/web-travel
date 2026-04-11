import { X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProductSelectFilters } from '@/hooks/use-product-filters';
import type { LookupItem } from '@/lib/validations/product';

import { DateRangeDropdown } from './DateRangeDropdown';

interface Props {
  keyword: string;
  selects: ProductSelectFilters;
  suppliers: LookupItem[];
  destinations: LookupItem[];
  hasActiveFilters: boolean;
  onKeywordChange: (v: string) => void;
  onSelectChange: (patch: Partial<ProductSelectFilters>) => void;
  onReset: () => void;
}

export function ProductFilterBar({
  keyword,
  selects,
  suppliers,
  destinations,
  hasActiveFilters,
  onKeywordChange,
  onSelectChange,
  onReset,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Keyword — debounced in hook */}
        <div className="space-y-1 min-w-[200px] flex-1">
          <label className="text-xs font-medium text-gray-500">Từ khóa</label>
          <Input
            size="sm"
            placeholder="Tìm theo tên tour..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
          />
        </div>

        {/* Supplier */}
        <div className="space-y-1 w-[152px]">
          <label className="text-xs font-medium text-gray-500">Nhà cung cấp</label>
          <Select value={selects.supplierId} onValueChange={(v) => onSelectChange({ supplierId: v })}>
            <SelectTrigger inputSize="sm" className="w-full">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Destination */}
        <div className="space-y-1 w-[152px]">
          <label className="text-xs font-medium text-gray-500">Điểm đến</label>
          <Select value={selects.destinationId} onValueChange={(v) => onSelectChange({ destinationId: v })}>
            <SelectTrigger inputSize="sm" className="w-full">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              {destinations.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-1 w-[130px]">
          <label className="text-xs font-medium text-gray-500">Trạng thái</label>
          <Select value={selects.status} onValueChange={(v) => onSelectChange({ status: v })}>
            <SelectTrigger inputSize="sm" className="w-full">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="published">Công khai</SelectItem>
              <SelectItem value="hidden">Đã ẩn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date range */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Thời gian tạo</label>
          <DateRangeDropdown
            value={{ fromDate: selects.fromDate, toDate: selects.toDate }}
            onChange={({ fromDate, toDate }) => onSelectChange({ fromDate, toDate })}
          />
        </div>

        {/* Clear link */}
        {hasActiveFilters && (
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors pb-1"
            onClick={onReset}
          >
            <X size={12} />
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
