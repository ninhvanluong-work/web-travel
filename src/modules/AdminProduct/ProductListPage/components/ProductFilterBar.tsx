import { RotateCcw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LookupItem } from '@/lib/validations/product';

import type { ProductFilters } from '../use-product-filters';

interface ProductFilterBarProps {
  filters: ProductFilters;
  suppliers: LookupItem[];
  destinations: LookupItem[];
  onChange: (patch: Partial<ProductFilters>) => void;
  onApply: () => void;
  onReset: () => void;
}

export function ProductFilterBar({
  filters,
  suppliers,
  destinations,
  onChange,
  onApply,
  onReset,
}: ProductFilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
      {/* Row 1: keyword + 3 selects */}
      <div className="grid grid-cols-[1fr_160px_160px_140px] gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Từ khóa</label>
          <Input
            size="sm"
            placeholder="Tìm theo tên tour..."
            value={filters.keyword}
            onChange={(e) => onChange({ keyword: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onApply()}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Nhà cung cấp</label>
          <Select value={filters.supplierId} onValueChange={(v) => onChange({ supplierId: v })}>
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

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Điểm đến</label>
          <Select value={filters.destinationId} onValueChange={(v) => onChange({ destinationId: v })}>
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

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Trạng thái</label>
          <Select value={filters.status} onValueChange={(v) => onChange({ status: v })}>
            <SelectTrigger inputSize="sm" className="w-full">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="published">Công khai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: date range + actions */}
      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Từ ngày</label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => onChange({ fromDate: e.target.value })}
            className="h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:border-main"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Đến ngày</label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => onChange({ toDate: e.target.value })}
            className="h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:border-main"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="secondary"
            size="xs"
            rounded="md"
            blur={false}
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 h-9"
          >
            <RotateCcw size={13} />
            Đặt lại
          </Button>
          <Button
            variant="primary"
            size="xs"
            rounded="md"
            blur={false}
            onClick={onApply}
            className="flex items-center gap-1.5 px-4 h-9"
          >
            <Search size={13} />
            Tìm kiếm
          </Button>
        </div>
      </div>
    </div>
  );
}
