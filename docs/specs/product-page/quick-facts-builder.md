---
title: 'Dynamic Facts Builder cho Section Thông tin nhanh (English Version - Perfect Layout & UI Component)'
created: '2026-05-22'
status: 'draft'
domain: 'product-page'
related: 'spec-admin-product-fields-sync.md'
---

# Spec: Dynamic Facts Builder cho Section Thông tin nhanh (Quick Facts) - TimeSelectPicker UI Component & Bố Cục Thẳng Hàng Premium

## 1. Vấn đề / Mục tiêu

Trang chi tiết sản phẩm phía Client (`ProductPage`) hiển thị một danh sách **Fact Sheet** (Thông tin nhanh) rất quan trọng và đẹp mắt bao gồm: Độ khó, Ngôn ngữ, Điểm khởi hành, Quy mô nhóm tối đa, Thời lượng chuyến đi, Giờ đón khách (Pickup), Giờ trả khách (Drop-off), Số ngày và Số đêm.

Để đảm bảo **toàn bộ trải nghiệm trang Product phải bằng tiếng Anh đồng bộ từ trang quản trị Admin đến trang hiển thị Client**, hệ thống quản trị phía Admin (`AdminProduct/ProductFormPage`) cần được cập nhật toàn bộ nhãn, gợi ý và tùy chọn sang tiếng Anh, đồng thời nâng cấp thành **Dynamic Facts Builder** dạng danh sách động.

Đồng thời, chúng ta phát hiện hai vấn đề lớn về giao diện hiện tại:

1. **Lệch pha bố cục nghiêm trọng:** Dropdown loại quá hẹp, ô nhập giá trị thì co rúm lại (do wrapper div của `<Input>` thiếu class `w-full`), còn ô Giờ đón/trả lại dãn rộng ra 100% diện tích, tạo nên sự mất cân đối cực kỳ thiếu chuyên nghiệp.
2. **Thiếu component chọn giờ dùng chung:** Qua tìm kiếm kỹ lưỡng trong thư mục `src/components`, hệ thống **chỉ có `DatePicker` chọn ngày và `Calendar`, hoàn toàn chưa có bất kỳ component chọn giờ (TimePicker/TimeSelect) nào**.

**Mục tiêu:**

- **Tạo mới một UI Component dùng chung `TimeSelectPicker`** tại `src/components/ui/time-select-picker.tsx` gồm dropdown chọn Giờ (00-23) và Phút (00-59) bằng tiếng Anh, hỗ trợ tái sử dụng cho toàn bộ dự án.
- Tiếng Anh hóa toàn bộ giao diện và dữ liệu tĩnh của mục Thông tin nhanh (Quick Facts).
- **Tái cấu trúc bố cục thẳng hàng tăm tắp (Perfect Grid/Flex Alignment):** Thiết lập chiều rộng cố định, cân xứng tuyệt đối cho các cột:
  - Cột dropdown loại thông tin: Cố định `w-[240px]` để chứa trọn vẹn các nhãn tiếng Anh.
  - Cột ô nhập giá trị: Cố định `w-[360px]` cho tất cả các loại input (Select, Text, Time, Autocomplete) để tạo sự đồng đều, vuông vức, chuyên nghiệp 100%.
  - Tất cả các input con bên trong (kể cả UI `TimeSelectPicker` và `Input` thường) đều dãn rộng `w-full` và chiếm trọn `360px` của container.
- Cho phép người dùng tùy ý chọn loại thông tin từ 9 loại chuẩn tiếng Anh.
- Tự động ẩn hoặc disabled các loại thông tin đã chọn để tránh trùng lặp.
- Di chuyển Section này lên ngay dưới section **Mô tả sản phẩm** để đồng bộ logic cấu trúc hiển thị.
- Tự động hóa 100% việc lưu trữ, đồng bộ API Payload dạng mảng `{ key, name }` và khôi phục bản nháp (Auto-save) mượt mà.

---

## 2. Hành vi mong muốn (User Experience)

| Hành động                                                   | Kết quả mong đợi                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Truy cập form Admin                                         | Section "Quick facts" nằm trang trọng ngay dưới section "Product Overview". Hiển thị danh sách các thông tin đã cấu hình trước đó hoặc banner trống bằng tiếng Anh nếu chưa có.                                                                                                                                                                           |
| Click "+ Add fact"                                          | Một hàng thông tin mới xuất hiện với **bố cục thẳng hàng tăm tắp**. Ô giá trị hiển thị dạng disabled kèm placeholder "Select type first..." cho đến khi người dùng chọn loại thông tin ở cột bên trái.                                                                                                                                                    |
| Chọn Loại thông tin (Dropdown)                              | Danh sách loại thông tin chỉ hiển thị các loại chưa được chọn ở các hàng khác (hoặc làm mờ/disabled) để chặn tuyệt đối trùng lặp thông tin. Các loại hiển thị bằng tiếng Anh (ví dụ: `Difficulty`, `Language`, `Pickup time`...).                                                                                                                         |
| Chọn loại "Pickup time" hoặc "Drop-off time"                | Ô nhập giá trị tự động biến đổi thành 2 Dropdown Select chọn **Hour** (00 - 23) và **Minute** (00 - 59), ngăn cách bởi dấu `:`. Khi thay đổi, giá trị tự động lưu dưới dạng chuỗi chuẩn `HH:MM`. Chiều rộng tổng thể vẫn giữ nguyên `w-[360px]` bằng các hàng khác.                                                                                       |
| Chọn loại "Group size", "Days", "Nights"                    | Ô nhập giá trị biến thành input số nguyên dương. Tự động loại bỏ mọi ký tự chữ hoặc ký tự đặc biệt khi người dùng gõ. Chiều rộng dãn ra đầy đủ `w-[360px]`.                                                                                                                                                                                               |
| Chọn loại "Difficulty", "Language", "Departure", "Duration" | Ô nhập giá trị biến thành một Combobox Input thông minh bằng tiếng Anh. Khi click vào sẽ hiển thị danh sách gợi ý tiếng Anh phổ biến. Người dùng có thể gõ để tìm kiếm. Nếu gõ từ khóa mới chưa có trong danh sách, một dòng **`+ Create new: "[Từ khóa]"`** xuất hiện; khi bấm vào sẽ chọn từ khóa đó làm giá trị. Chiều rộng dãn ra đầy đủ `w-[360px]`. |
| Click nút "Xóa" (Biểu tượng Thùng rác)                      | Dòng thông tin đó bị xóa ngay lập tức khỏi Builder. Loại thông tin tương ứng lập tức khả dụng trở lại trong Dropdown chọn loại ở các hàng khác.                                                                                                                                                                                                           |
| Ấn Lưu sản phẩm / Tự động khôi phục nháp                    | Dữ liệu mảng `elements` dạng `{ key, name }` được gửi thẳng lên API và khôi phục nguyên vẹn 100% khi load trang hoặc khôi phục bản nháp.                                                                                                                                                                                                                  |

---

## 3. Thay đổi kỹ thuật đề xuất

### 3.1. [NEW] UI Component `TimeSelectPicker` dùng chung

Chúng ta tạo mới file [time-select-picker.tsx](file:///d:/Remote/web-travel/src/components/ui/time-select-picker.tsx) để sử dụng lâu dài:

```tsx
// src/components/ui/time-select-picker.tsx
import * as React from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface TimeSelectPickerProps {
  value: string; // Định dạng "HH:MM" hoặc ""
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function TimeSelectPicker({ value, onChange, disabled }: TimeSelectPickerProps) {
  let currentHour = '08';
  let currentMinute = '00';
  if (value && value.includes(':')) {
    const parts = value.split(':');
    if (parts[0]) currentHour = parts[0];
    if (parts[1]) currentMinute = parts[1];
  }

  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')), []);
  const minutes = React.useMemo(() => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')), []);

  return (
    <div className="w-full flex items-center gap-2">
      <Select disabled={disabled} value={currentHour} onValueChange={(h) => onChange(`${h}:${currentMinute}`)}>
        <SelectTrigger className="h-10 text-[13px] flex-1 bg-white border-slate-200 hover:bg-slate-50 transition-colors">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h} hour
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-slate-400 font-semibold shrink-0">:</span>

      <Select disabled={disabled} value={currentMinute} onValueChange={(m) => onChange(`${currentHour}:${m}`)}>
        <SelectTrigger className="h-10 text-[13px] flex-1 bg-white border-slate-200 hover:bg-slate-50 transition-colors">
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m} min
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

### 3.2. Tiếng Anh hóa Option Keys & Schema Validation

Chúng ta cập nhật lại `ELEMENT_KEY_OPTIONS` trong `src/lib/validations/product.ts` sang tiếng Anh hoàn toàn:

```typescript
// src/lib/validations/product.ts
export const ELEMENT_KEY_OPTIONS = [
  { label: 'Difficulty', value: 'difficulty' },
  { label: 'Language', value: 'language' },
  { label: 'Departure', value: 'departure' },
  { label: 'Group size', value: 'groupSize' },
  { label: 'Duration', value: 'duration' },
  { label: 'Pickup time', value: 'pickup' },
  { label: 'Drop-off time', value: 'dropOff' },
  { label: 'Days', value: 'day' },
  { label: 'Nights', value: 'night' },
];
```

Đồng bộ hàm helper text ở phía Client `src/modules/ProductPage/adapter.ts`:

// src/modules/ProductPage/adapter.ts
// Thay đổi nhãn fallback mặc định sang tiếng Anh:
time: item.featuredName ?? `Point ${idx + 1}`, // Thay vì `Điểm ${idx + 1}`

// Tự động định dạng trường groupSize phía Client thành "Up to X people" nếu dữ liệu là số nguyên dương:
let groupSize = byKey.groupSize ?? '—';
if (groupSize !== '—' && /^\d+$/.test(groupSize)) {
groupSize = `Up to ${groupSize} people`;
}

````

### 3.3. Thay đổi Vị trí Bố cục và Sidebar Navigation

Trong `src/modules/AdminProduct/ProductFormPage/index.tsx`, di chuyển `section-quick-facts` lên dưới `section-overview` và dịch nhãn sang tiếng Anh:

```typescript
const NAV_SECTIONS = [
  { id: 'section-banner', label: 'Product Video', icon: Tv },
  { id: 'section-tags', label: 'Product Tags', icon: Tag },
  { id: 'section-overview', label: 'Product Overview', icon: FileText },
  { id: 'section-quick-facts', label: 'Quick Facts', icon: MapPin }, // <-- Chuyển lên đây và dùng tiếng Anh
  { id: 'section-experiences', label: 'Highlights', icon: Sparkles },
  // ...
];
````

### 3.4. Viết Component Dynamic Facts Builder với Bố cục Thẳng Hàng Premium

Chúng ta tái cấu trúc hoàn toàn file `src/modules/AdminProduct/ProductFormPage/components/sections/quick-facts-section.tsx`:

```tsx
import { Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeSelectPicker } from '@/components/ui/time-select-picker'; // <-- Import UI component dùng chung mới
import { cn } from '@/lib/utils';
import { ELEMENT_KEY_OPTIONS, type ProductFormValues } from '@/lib/validations/product';

// 1. Định nghĩa Suggestions tĩnh bằng tiếng Anh
const MOCK_SUGGESTIONS: Record<string, string[]> = {
  difficulty: ['Easy', 'Medium', 'Hard', 'Very hard'],
  language: ['English', 'Vietnamese', 'French', 'Chinese', 'Japanese'],
  departure: ['Ha Noi', 'Da Nang', 'Ho Chi Minh City', 'Nha Trang', 'Phu Quoc'],
  duration: ['1 day', '2 days 1 night', '3 days 2 nights', '4 days 3 nights'],
};

const NUMBER_KEYS = new Set(['groupSize', 'day', 'night']);
const TIME_KEYS = new Set(['pickup', 'dropOff']);
const AUTOCOMPLETE_KEYS = new Set(['difficulty', 'language', 'departure', 'duration']);

// 2. Component Autocomplete Combobox bằng tiếng Anh (Full Width)
interface ComboboxInputProps {
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
  disabled?: boolean;
}

function ComboboxInput({ value, onChange, suggestions, placeholder = 'Select or enter...', disabled }: ComboboxInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = suggestions.filter((s) => s.toLowerCase().includes(search.toLowerCase()));
  const hasExactMatch = suggestions.some((s) => s.toLowerCase() === search.trim().toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="w-full flex h-10 items-center justify-between rounded-lg border border-input bg-white px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all text-left"
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown size={14} className="opacity-50 shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popper-anchor-width)] p-0">
        <Command className="w-full">
          <CommandInput placeholder="Search suggestions..." value={search} onValueChange={setSearch} />
          <CommandList className="max-h-[200px] overflow-y-auto w-full">
            {filtered.length === 0 && !search.trim() && (
              <div className="p-4 text-center text-[12px] text-slate-400">No suggestions found</div>
            )}
            <CommandGroup>
              {filtered.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={() => {
                    onChange(item);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="flex items-center justify-between text-[13px] px-3 py-2 cursor-pointer hover:bg-slate-50 rounded-md"
                >
                  <span>{item}</span>
                  <Check size={14} className={cn('text-brand-500', value === item ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}

              {search.trim() && !hasExactMatch && (
                <CommandItem
                  value={search}
                  onSelect={() => {
                    onChange(search.trim());
                    setOpen(false);
                    setSearch('');
                  }}
                  className="flex items-center gap-1.5 text-[13px] text-brand-600 font-medium px-3 py-2 cursor-pointer hover:bg-brand-50 rounded-md mt-1 border-t border-dashed border-slate-100"
                >
                  <Plus size={14} />
                  <span>Create new: &quot;{search.trim()}&quot;</span>
                </CommandItem>
              )}
            </CommandGroup>
          </Command>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// 3. Component Input Giá trị (Đồng bộ Full Width)
function ValueInput({
  factKey,
  value,
  onChange,
  disabled,
}: {
  factKey: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  if (!factKey) {
    return (
      <Input
        size="sm"
        placeholder="Select type first..."
        disabled
        value=""
        fullWidth
        className="w-full bg-slate-50 text-slate-400"
      />
    );
  }

  if (TIME_KEYS.has(factKey)) {
    return <TimeSelectPicker value={value} onChange={onChange} disabled={disabled} />;
  }

  if (NUMBER_KEYS.has(factKey)) {
    return (
      <Input
        size="sm"
        placeholder="Enter number..."
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        inputMode="numeric"
        fullWidth
        className="w-full"
        disabled={disabled}
      />
    );
  }

  if (AUTOCOMPLETE_KEYS.has(factKey)) {
    return (
      <ComboboxInput
        value={value}
        onChange={onChange}
        suggestions={MOCK_SUGGESTIONS[factKey] || []}
        placeholder={`Select or enter ${ELEMENT_KEY_OPTIONS.find((o) => o.value === factKey)?.label.toLowerCase()}...`}
        disabled={disabled}
      />
    );
  }

  return (
    <Input
      size="sm"
      placeholder="Enter value..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      className="w-full"
      disabled={disabled}
    />
  );
}

// 4. Component Main Section (Bố cục Thẳng Hàng Tuyệt Đối)
export function QuickFactsSection() {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove, update } = useFieldArray({ control, name: 'elements' });

  const usedKeys = fields.map((f) => f.key);

  return (
    <div className="space-y-4">
      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-[14px] font-medium text-slate-600">No quick facts configured</p>
          <p className="text-[13px] text-slate-400 mt-1">Click the button below to add quick facts for this tour</p>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((item, index) => (
          <div key={item.id} className="flex items-center gap-4">
            {/* Cột Dropdown Loại thông tin: Cố định 240px */}
            <Select value={item.key} onValueChange={(v) => update(index, { key: v, name: '' })}>
              <SelectTrigger
                inputSize="sm"
                className="w-[240px] shrink-0 bg-slate-50/50 border-slate-200 hover:bg-white transition-colors"
              >
                <SelectValue placeholder="Select fact type..." />
              </SelectTrigger>
              <SelectContent>
                {ELEMENT_KEY_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    disabled={usedKeys.includes(opt.value) && opt.value !== item.key}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Cột Ô Nhập Giá trị: Cố định 360px, thẳng hàng tăm tắp */}
            <div className="w-[360px] shrink-0 flex">
              <ValueInput
                factKey={item.key}
                value={item.name}
                onChange={(v) => update(index, { ...item, name: v })}
              />
            </div>

            {/* Nút Xóa */}
            <button
              type="button"
              onClick={() => remove(index)}
              className="shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={() => append({ key: '', name: '' })}
        disabled={fields.length >= ELEMENT_KEY_OPTIONS.length}
        className="gap-2 h-9 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-theme-xs transition-colors rounded-lg font-medium text-[13px]"
      >
        <Plus size={14} className="text-brand-500" />
        Add fact
      </Button>
    </div>
  );
}
```

---

## 4. Dependencies & Conflicts

- **Depends on:** Không có.
- **Modifies:**
  - `src/components/ui/time-select-picker.tsx` [NEW UI Component]
  - `src/modules/AdminProduct/ProductFormPage/components/sections/quick-facts-section.tsx`
  - `src/lib/validations/product.ts` (cấu trúc Schema `elements`)
  - `src/api/product/requests.ts` (mapping Payload gửi API)
  - `src/modules/AdminProduct/ProductFormPage/index.tsx` (Vị trí Section và Sidebar Navigation)
  - `src/modules/ProductPage/adapter.ts` (Dịch text mặc định)
- **Must NOT break:**
  - Khả năng khôi phục nháp (Auto-save) của trường `elements`.
  - Hiển thị Fact Sheet ngoài màn hình chi tiết sản phẩm phía Client (`ProductPage`).
- **Conflicts with:** Không có.

---

## 5. Out of scope

- Thay đổi các icon được hiển thị trên giao diện Client (đã được định nghĩa cứng theo key của Fact Sheet).
- Tạo cơ sở dữ liệu hoặc bảng riêng cho các tag/element gợi ý (được định nghĩa tĩnh `MOCK_SUGGESTIONS` ngay trong code Frontend để tối giản tài nguyên hệ thống).

---

## 6. Kế hoạch kiểm thử & Xác minh (Verification)

### 6.1. Kiểm thử thủ công trên Giao diện Admin Form

- **Thêm dòng thông tin:** Bấm "+ Add fact" -> Xác nhận dòng mới được thêm, ô input bên phải bị disabled và hiển thị placeholder "Select type first...".
- **Kiểm thử bố cục thẳng hàng:** Thêm nhiều hàng với các loại khác nhau (Difficulty, Pickup time, Group size) -> Xác nhận:
  - Tất cả các dropdown cột 1 có cùng chiều rộng `240px` và mép phải thẳng hàng nhau.
  - Tất cả các ô nhập liệu cột 2 có cùng chiều rộng `360px` và mép trái/phải thẳng hàng tăm tắp, không bị thụt thò hay dòng dài dòng ngắn khập khiễng.
- **Kiểm thử TimeSelectPicker mới:**
  - Chọn loại "Pickup time" -> Xác nhận ô input chuyển thành 2 select chọn Hour và Minute từ UI component `TimeSelectPicker`.
  - Chọn Hour: "07", Minute: "30" -> Xác nhận giá trị được lưu chuẩn xác.
- **Kiểm thử Autocomplete & Tạo mới:**
  - Chọn loại "Difficulty" -> Ô bên phải chuyển thành Popover Button.
  - Click vào -> Xác nhận danh sách gợi ý "Easy", "Medium", "Hard", "Very hard" hiển thị.
  - Nhập chữ "Ha" vào ô tìm kiếm -> Xác nhận gợi ý lọc ra "Hard".
  - Nhập chữ "Insane" (không có trong danh sách) -> Xác nhận xuất hiện dòng **`+ Create new: "Insane"`**.
  - Click vào dòng tạo mới -> Xác nhận giá trị "Insane" được gán làm giá trị của hàng.
- **Kiểm thử Nhập số:**
  - Chọn loại "Group size" -> Nhập chữ "abc12d" -> Xác nhận ô chỉ lưu giá trị số "12", mọi chữ cái bị loại bỏ ngay lập tức.
- **Kiểm thử Xóa dòng:** Bấm nút Thùng rác bên cạnh dòng -> Xác nhận dòng bị xóa, và loại thông tin tương ứng mở lại khả dụng ở các dropdown hàng khác.

### 6.2. Kiểm thử Tích hợp & Đồng bộ API

1. **Tạo mới Tour du lịch:** Điền đầy đủ thông tin, cấu hình 3 dòng thông tin nhanh (ví dụ: Difficulty: Hard, Pickup time: 08:30, Group size: 15). Ấn Lưu.
2. **Xác nhận qua API Payload:** F12 Network tab -> Kiểm tra request `POST /product` -> Xác nhận payload gửi đi có dạng:
   ```json
   "elements": [
     { "key": "difficulty", "name": "Hard" },
     { "key": "pickup", "name": "08:30" },
     { "key": "groupSize", "name": "15" }
   ]
   ```
3. **Xác nhận Load dữ liệu khi Edit:** Quay lại màn hình danh sách, chọn Chỉnh sửa Tour vừa tạo -> Xác nhận giao diện Builder phục hồi nguyên vẹn 3 hàng thông tin với đúng loại và giá trị đã thiết lập.
4. **Kiểm tra Client Page:** Truy cập trang chi tiết sản phẩm của Tour đó ở phía Client -> Xác nhận Fact Sheet hiển thị đầy đủ 3 thông tin Difficulty (icon tương ứng), Giờ đón (08:30), Quy mô nhóm (15 người).
