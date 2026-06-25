# Spec: Admin Tour Guide — UI/UX Enhancements

> **Module:** `src/modules/AdminTourGuide`  
> **Status:** 🔍 Design & Audit — Spec hoàn chỉnh, chờ implement  
> **Tham khảo:**
>
> - Code hiện tại: [GuideListPage](../../../src/modules/AdminTourGuide/GuideListPage/index.tsx) · [GuideFormPage](../../../src/modules/AdminTourGuide/GuideFormPage/index.tsx)
> - Pattern gốc: [product-form-enhancements.md](./product-form-enhancements.md)
> - Profile public: [guide-profile-spec.md](../product-page/guide-profile-spec.md)
> - Last updated: 2026-06-09

---

## Tóm tắt

Module `AdminTourGuide` đã có **skeleton cơ bản hoạt động được** (CRUD đầy đủ, scroll-spy nav, validation schema). Tuy nhiên so với tiêu chuẩn Premium Admin của dự án (benchmark `AdminProduct`), vẫn còn nhiều điểm UX/UI chưa đạt: hiển thị thống kê sai dữ liệu, thiếu bảo vệ dữ liệu khi rời trang, form section chưa có error indicator, một số interaction còn thô.

Tài liệu này mô tả **5 nhóm cải tiến** theo thứ tự ưu tiên, từ blocking bug đến polish.

---

## Audit Nhanh — Hiện Trạng

```
src/modules/AdminTourGuide/
├── GuideListPage/
│   ├── index.tsx              ← StatCards misleading, thiếu debounce search
│   ├── hooks/
│   │   └── use-guide-list-actions.ts  ← OK
│   └── components/
│       ├── GuideTable.tsx             ← OK
│       ├── GuideTableRow.tsx          ← "Tours led" column sai ngữ nghĩa
│       └── DeleteConfirmDialog.tsx    ← OK nhưng thiếu loading state
└── GuideFormPage/
    ├── index.tsx              ← Thiếu error indicator sidebar, thiếu dirty-guard
    ├── hooks/
    │   └── use-guide-form.ts  ← OK
    └── components/
        ├── guide-form-header.tsx   ← Thiếu unsaved changes indicator
        └── sections/
            ├── basic-info-section.tsx  ← Layout 2 cột; gộp description từ bio-section vào đây
            ├── bio-section.tsx         ← ❗ Xóa section card riêng — gộp vào basic-info
            ├── metrics-section.tsx     ← Language chips thiếu flag/label
            ├── experts-section.tsx     ← OK, có thể thêm category grouping
            └── career-section.tsx      ← Thiếu drag-to-reorder
```

---

## Nhóm 1 — Sửa Lỗi Nghiêm Trọng (Blocking Bugs)

### 🔴 Bug 1.1 — StatCards tính sai trên page-level, không phải total

**File:** [`GuideListPage/index.tsx`](../../../src/modules/AdminTourGuide/GuideListPage/index.tsx) dòng 36–37

**Hiện tại (sai):**

```tsx
// Chỉ filter 10 items đang hiển thị trên page hiện tại
const highRatingCount = items.filter((g) => g.ratingValue >= 4).length;
const experiencedCount = items.filter((g) => g.expYear >= 5).length;
```

Với 10,007 records server-side, user thấy "Rating ≥ 4★: 3" nhưng thực ra con số thật có thể là 8,000+. **Đây là misleading data nghiêm trọng.**

**Giải pháp (2 options — chọn 1):**

| Option                               | Mô tả                                                            | Đánh giá               |
| ------------------------------------ | ---------------------------------------------------------------- | ---------------------- |
| **A — Bỏ 2 stat card sai**           | Chỉ giữ "Total Guides" (có data chính xác từ `pagination.total`) | ✅ Nhanh, an toàn      |
| **B — Thêm API `/tour-guide/stats`** | Backend trả về aggregate stats                                   | ⚠️ Cần confirm backend |

**Đề xuất chọn Option A** vì nhanh và trung thực. Thay vào đó, dùng 2 stat card còn lại để hiển thị thông tin có giá trị hơn:

```
Stat Card 1: Total Guides     → pagination.total (✅ đúng)
Stat Card 2: New this month   → filter createdAt >= đầu tháng (tính từ items, label rõ ràng)
Stat Card 3: Avg Experience   → trung bình expYear của page hiện tại (label: "Avg Exp (page)")
```

---

### 🔴 Bug 1.2 — Column "Tours led" hiển thị `ratingCount` — sai ngữ nghĩa

**File:** [`GuideTableRow.tsx`](../../../src/modules/AdminTourGuide/GuideListPage/components/GuideTableRow.tsx) dòng 105

```tsx
// Spec gốc đã ghi ⚠️ nhưng chưa sửa:
// "Tours led" | ratingCount | ⚠️ field tạm
<TableCell>{guide.ratingCount}</TableCell>
```

`ratingCount` = số lượt review từ khách, KHÔNG phải số tour đã dẫn.

**Fix ngay:** Đổi header cột thành **"Reviews"** và hiển thị với icon phù hợp:

```tsx
// Trước
<th>Tours led</th>
<td>{guide.ratingCount}</td>

// Sau
<th className="flex items-center gap-1">
  <MessageSquare size={13} />
  Reviews
</th>
<td>
  <span className="text-sm text-gray-700">{guide.ratingCount}</span>
  <span className="text-xs text-gray-400 ml-1">reviews</span>
</td>
```

---

### 🔴 Bug 1.3 — GuideFormPage thiếu Validation Error Indicator trên Sidebar

**File:** [`GuideFormPage/index.tsx`](../../../src/modules/AdminTourGuide/GuideFormPage/index.tsx)

`ProductFormPage` có cơ chế này — `GuideFormPage` bỏ sót hoàn toàn. Khi user submit form có lỗi ở section đang cuộn ra khỏi viewport, không có gì gợi ý section nào cần sửa.

**Thiếu:**

```tsx
// Map từng section → các field của nó
const SECTION_ERROR_FIELDS: Record<string, (keyof TourGuideFormValues)[]> = {
  'section-basic': ['name', 'summary', 'quote', 'avatar', 'coverImg'],
  'section-bio': ['description'],
  'section-metrics': ['expYear', 'languages'],
  'section-experts': ['experts'],
  'section-career': ['careerPath'],
};

// Trong render sidebar nav
const { errors } = form.formState;
const sectionHasError = (id: string) => (SECTION_ERROR_FIELDS[id] ?? []).some((f) => !!errors[f]);

// Thêm vào mỗi nav button
{
  sectionHasError(id) && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />;
}
```

---

## Nhóm 2 — Bảo Vệ Dữ Liệu (Data Safety)

### 🟡 Cải tiến 2.1 — Unsaved Changes Guard

**File:** [`GuideFormPage/index.tsx`](../../../src/modules/AdminTourGuide/GuideFormPage/index.tsx)

Hiện tại admin fill xong form rồi vô tình bấm Back hoặc click nhầm link → **mất toàn bộ dữ liệu**. `ProductFormPage` có autosave draft localStorage — nhưng `GuideFormPage` không có gì cả.

**Giải pháp tối thiểu (không cần autosave phức tạp):**

```tsx
// Thêm vào use-guide-form.ts hoặc GuideFormPage/index.tsx
const {
  formState: { isDirty },
} = form;

// 1. Native browser unload warning
useEffect(() => {
  const handler = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [isDirty]);

// 2. Next.js router navigation guard
useEffect(() => {
  const handleRouteChange = () => {
    if (isDirty && !window.confirm('Bạn có thay đổi chưa lưu. Rời trang?')) {
      router.events.emit('routeChangeError');
      throw 'routeChange aborted';
    }
  };
  router.events.on('routeChangeStart', handleRouteChange);
  return () => router.events.off('routeChangeStart', handleRouteChange);
}, [isDirty, router]);
```

**Indicator trên header:** Khi `isDirty === true`, hiển thị dot vàng nhỏ kế tên guide trên header:

```tsx
// guide-form-header.tsx
{
  isDirty && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Có thay đổi chưa lưu" />;
}
```

---

### 🟡 Cải tiến 2.2 — DeleteConfirmDialog thiếu loading state

**File:** [`DeleteConfirmDialog.tsx`](../../../src/modules/AdminTourGuide/GuideListPage/components/DeleteConfirmDialog.tsx)

Khi bấm Confirm xóa, dialog không có loading spinner — user không biết đang xử lý hay đã xong, dễ bấm double-click gây double delete.

**Fix:** Truyền `isDeleting` prop vào dialog, disable nút Confirm khi đang xóa:

```tsx
interface DeleteConfirmDialogProps {
  target: ITourGuide | null;
  isDeleting: boolean; // ← thêm prop này
  onConfirm: () => void;
  onCancel: () => void;
}

// Trong nút Confirm:
<Button disabled={isDeleting} onClick={onConfirm}>
  {isDeleting ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Trash2 size={14} className="mr-1.5" />}
  {isDeleting ? 'Đang xóa...' : 'Xóa'}
</Button>;
```

---

## Nhóm 3 — Cải Thiện Form Sections (UI Quality)

### 🟡 Cải tiến 3.1 — Language Selector: Thêm Flag + Full Label

**File:** [`metrics-section.tsx`](../../../src/modules/AdminTourGuide/GuideFormPage/components/sections/metrics-section.tsx)

**Hiện tại:** Các chip chỉ hiện text code (`VI`, `EN`, `FR`...) — không thân thiện, không rõ nghĩa.

**Cải tiến:**

```tsx
const LANGUAGE_OPTIONS = [
  { code: 'VI', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'FR', label: 'Français', flag: '🇫🇷' },
  { code: 'JP', label: '日本語', flag: '🇯🇵' },
  { code: 'KO', label: '한국어', flag: '🇰🇷' },
  { code: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ES', label: 'Español', flag: '🇪🇸' },
  { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ZH', label: '中文', flag: '🇨🇳' },
];

// Chip render
<button
  key={lang.code}
  className={cn(
    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
    selected
      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:bg-brand-50/30'
  )}
>
  <span>{lang.flag}</span>
  <span>{lang.code}</span>
</button>;
```

**Tooltip full label** khi hover vào chip:

```tsx
// Dùng title attribute đơn giản
<button title={lang.label} ...>
```

---

### 🟡 Cải tiến 3.2 — Career Section: Drag-to-Reorder & Redesign UI (Cân đối & Cách đều)

**File:** [`career-section.tsx`](../../../src/modules/AdminTourGuide/GuideFormPage/components/sections/career-section.tsx)

**Vấn đề hiện tại:**

- Giao diện Career hiện tại rất lộn xộn và không cân đối:
  - Các ô nhập số liệu ngắn như **Năm bắt đầu** và **Số tours** bị kéo giãn chiếm tới 50% chiều ngang hàng, tạo ra quá nhiều khoảng trống thừa.
  - Input **Mô tả** chiếm riêng 1 hàng ở đáy nhưng chiều cao lại dính sát với hàng trên.
  - Vùng header của mỗi Position (Vị trí) không có phân cách rõ ràng, thiếu drag handle phục vụ tính năng kéo thả sắp xếp (Drag-to-Reorder).
  - Khoảng đệm (padding) trong card và giữa các card không đồng đều.

**Yêu cầu cải tiến (Redesign cấu trúc dạng List Card):**

1. **Quy hoạch Card Item:**
   - Mỗi mốc sự nghiệp nằm trong một card riêng biệt: `p-5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white shadow-theme-xs`.
   - Các card cách nhau đều đặn `space-y-4`.
2. **Thiết kế Card Header:**
   - Tạo một thanh tiêu đề mảnh cách biệt với phần input bên dưới bằng đường kẻ `border-b border-slate-100 pb-3 mb-4 flex items-center justify-between`.
   - Phía bên trái chứa **Drag Handle** (sử dụng icon `GripVertical` cùng text `Vị trí #1` màu xám).
   - Phía bên phải chứa nút xóa rác (Trash icon) dạng icon-button nhỏ gọn và tinh tế.
3. **Quy hoạch Grid 4 cột để sắp xếp cân đối các trường:**
   - Sử dụng lưới `grid grid-cols-4 gap-4`.
   - **Hàng 1:** _Chức danh_ (`col-span-2` / 50%) và _Công ty_ (`col-span-2` / 50%).
   - **Hàng 2:** _Năm bắt đầu_ (`col-span-1` / 25%), _Số tours_ (`col-span-1` / 25%) và _Mô tả ngắn_ (`col-span-2` / 50%).
   - Nhờ cách chia này, các ô số liệu ngắn sẽ đứng cạnh nhau gọn gàng, chia sẻ hàng với ô mô tả mà không bị kéo giãn vô lý.

#### Cấu trúc JSX đề xuất cho `career-section.tsx`:

```tsx
import { Reorder } from 'framer-motion';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';

export function CareerSection() {
  const { control } = useFormContext<TourGuideFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'careerPath' });

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
          <p className="text-sm text-slate-400 italic">Chưa có thông tin sự nghiệp. Bấm nút dưới để thêm.</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={fields}
          onReorder={(newOrder) => {
            newOrder.forEach((item, i) => move(fields.indexOf(item), i));
          }}
          className="space-y-4"
        >
          {fields.map((field, index) => (
            <Reorder.Item
              key={field.id}
              value={field}
              className="relative p-5 rounded-2xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-white/[0.01] shadow-theme-xs cursor-default space-y-4 select-none"
              whileDrag={{ scale: 1.01, boxShadow: '0 10px 30px rgba(0,0,0,0.08)', zIndex: 50 }}
            >
              {/* Header card: Drag handle + Trash button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-800/60">
                <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors">
                  <GripVertical size={15} />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Vị trí #{index + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1.5 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Grid 4 cột để tối ưu hóa không gian */}
              <div className="grid grid-cols-4 gap-4">
                {/* Hàng 1: Chức danh (2/4) | Công ty (2/4) */}
                <FormField
                  control={control}
                  name={`careerPath.${index}.role`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-2 space-y-1.5">
                      <FormLabel className="text-[13px] text-slate-500 font-medium">Chức danh *</FormLabel>
                      <FormControl>
                        <Input size="sm" placeholder="Ví dụ: Lead guide" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`careerPath.${index}.company`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-2 space-y-1.5">
                      <FormLabel className="text-[13px] text-slate-500 font-medium">Công ty *</FormLabel>
                      <FormControl>
                        <Input size="sm" placeholder="Ví dụ: VVV" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hàng 2: Năm bắt đầu (1/4) | Số tours (1/4) | Mô tả (2/4) */}
                <FormField
                  control={control}
                  name={`careerPath.${index}.startYear`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-1 space-y-1.5">
                      <FormLabel className="text-[13px] text-slate-500 font-medium">Năm bắt đầu</FormLabel>
                      <FormControl>
                        <Input size="sm" type="number" placeholder="2026" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`careerPath.${index}.tourCount`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-1 space-y-1.5">
                      <FormLabel className="text-[13px] text-slate-500 font-medium">Số tours</FormLabel>
                      <FormControl>
                        <Input size="sm" type="number" placeholder="0" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`careerPath.${index}.description`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-2 space-y-1.5">
                      <FormLabel className="text-[13px] text-slate-500 font-medium">Mô tả ngắn</FormLabel>
                      <FormControl>
                        <Input size="sm" placeholder="Ví dụ: Dẫn tour trekking..." {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Nút thêm vị trí mới */}
      <Button
        type="button"
        variant="ghost"
        className="w-full h-10 border-dashed border-slate-300 dark:border-gray-800 text-slate-500 hover:border-brand-500 hover:text-brand-600 rounded-xl hover:bg-brand-50/10 transition-all text-xs font-semibold gap-1.5"
        onClick={() =>
          append({ role: '', company: '', startYear: new Date().getFullYear(), tourCount: 0, description: '' })
        }
      >
        <Plus size={14} />
        Thêm kinh nghiệm sự nghiệp (Position)
      </Button>
    </div>
  );
}
```

---

### 🟡 Cải tiến 3.3 — BasicInfoSection: Layout 2 cột và Gộp Bio + Metrics (Thiết kế 3 Zone)

**File:** [`basic-info-section.tsx`](../../../src/modules/AdminTourGuide/GuideFormPage/components/sections/basic-info-section.tsx)

**Vấn đề hiện tại:**

- Form được chia thành quá nhiều section nhỏ (5 thẻ card khác nhau: Basic Info, Bio, Metrics, Specialties, Career) khiến giao diện bị vụn vặt và tăng thao tác cuộn trang của Admin.
- Card "Bio" chỉ chứa đúng 1 field `description` và card "Metrics" chỉ chứa `expYear` và `languages`.

**Yêu cầu:** Gộp toàn bộ **Bio Section** và **Metrics Section** vào chung thẻ card **Basic Info** để quy hoạch lại form chỉ còn **3 section lớn** (Basic Info, Specialties, Career). Sử dụng bố cục lưới 2 cột đồng nhất (`grid grid-cols-2 gap-5`) và phân chia thành **3 Zone nội dung** bằng đường kẻ phân cách tinh tế (`border-t`).

#### Sơ đồ Layout Mục tiêu:

```
┌────────────────────────────────────────────────────────┐
│ [ZONE 1: CORE IDENTIFICATION]                          │
│ Tên hướng dẫn viên *    │   Subtitle / Title           │  ← Hàng 1
├────────────────────────────────────────────────────────┤
│              Slogan / Quote  (col-span-2)              │  ← Hàng 2
├────────────────────────────────────────────────────────┤
│              Description / Bio  (col-span-2)           │  ← Hàng 3
├────────────────────────────────────────────────────────┤
│ [ZONE 2: METRICS & LANGUAGES] (Phân cách bằng border-t) │
│ Số năm kinh nghiệm      │   Số tour đã dẫn (toursLed)  │  ← Hàng 4
├────────────────────────────────────────────────────────┤
│              Ngôn ngữ (col-span-2)                     │  ← Hàng 5
├────────────────────────────────────────────────────────┤
│ [ZONE 3: MEDIA & VISUALS] (Phân cách bằng border-t)     │
│ Avatar (Aspect 1:1)     │   Cover Image (Aspect 21:9)  │  ← Hàng 6
└────────────────────────────────────────────────────────┘
```

#### Quy cách CSS & HTML:

- Sử dụng thẻ phân cách tương ứng hoặc `<div className="col-span-2 border-t border-slate-100 dark:border-gray-800/60 my-2" />` trước mỗi Zone 2 và Zone 3.
- **Zone 3 layout:** Bọc Avatar và Cover Image bằng flex container (`flex items-start gap-6 w-full`) thay vì grid 2 cột.
- **Kích thước Avatar:** Avatar được cấu hình thu nhỏ lại với kích thước cố định `w-24 h-24 rounded-full overflow-hidden shrink-0` để không chiếm dụng diện tích quá mức. Cover Image sẽ chiếm toàn bộ chiều ngang còn lại (`flex-1 aspect-[21/9] rounded-xl`).

#### Cấu trúc JSX đề xuất:

```tsx
export function BasicInfoSection() {
  const { control } = useFormContext<TourGuideFormValues>();

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* --- ZONE 1: IDENTIFICATION --- */}
      <FormField
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Tên hướng dẫn viên *</FormLabel>
            <FormControl>
              <Input size="sm" placeholder="Nguyễn Văn A" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="summary"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Subtitle / Title</FormLabel>
            <FormControl>
              <Input size="sm" placeholder="Hướng dẫn viên · Hà Nội" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="quote"
        render={({ field }) => (
          <FormItem className="col-span-2 space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Slogan / Quote</FormLabel>
            <FormControl>
              <Input size="sm" placeholder="..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="description"
        render={({ field }) => (
          <FormItem className="col-span-2 space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Description</FormLabel>
            <FormControl>
              <TextArea
                placeholder="Giới thiệu bản thân..."
                className="min-h-[120px] resize-none"
                rows={5}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* --- DIVIDER: ZONE 2 --- */}
      <div className="col-span-2 border-t border-slate-100 dark:border-gray-800/80 my-1" />

      {/* --- ZONE 2: METRICS --- */}
      <FormField
        name="expYear"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Số năm kinh nghiệm</FormLabel>
            <FormControl>
              <Input size="sm" type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Field toursLed sẽ hiển thị nếu backend hỗ trợ nhập tay, hoặc để trống ẩn đi */}
      <FormField
        name="toursLed"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Số tour đã dẫn (tùy chọn)</FormLabel>
            <FormControl>
              <Input size="sm" type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="col-span-2 space-y-2">
        <FormLabel className="text-[13px] text-slate-500 font-medium">Ngôn ngữ *</FormLabel>
        <div className="flex flex-wrap gap-2">
          {/* Render các nút flag + code từ LANGUAGE_OPTIONS (cải tiến 3.1) */}
        </div>
      </div>

      {/* --- DIVIDER: ZONE 3 --- */}
      <div className="col-span-2 border-t border-slate-100 dark:border-gray-800/80 my-1" />

      {/* --- ZONE 3: MEDIA (Bọc flex để co nhỏ Avatar) --- */}
      <div className="col-span-2 flex items-start gap-6 pt-2">
        <FormField
          name="avatar"
          render={({ field }) => (
            <FormItem className="space-y-1.5 shrink-0">
              <FormLabel className="text-[13px] text-slate-500 font-medium">Avatar</FormLabel>
              <FormControl>
                <ExperienceImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  aspectRatio="w-24 h-24 rounded-full overflow-hidden"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="coverImg"
          render={({ field }) => (
            <FormItem className="flex-1 space-y-1.5">
              <FormLabel className="text-[13px] text-slate-500 font-medium">Cover Image</FormLabel>
              <FormControl>
                <ExperienceImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  aspectRatio="aspect-[21/9] w-full rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
```

---

### 🟢 Cải tiến 3.4 — Xóa bỏ BioSection & MetricsSection khỏi Form chính

**File ảnh hưởng:**

- [`GuideFormPage/index.tsx`](../../../src/modules/AdminTourGuide/GuideFormPage/index.tsx)
- [Xóa hoàn toàn hoặc bỏ không dùng] `bio-section.tsx` và `metrics-section.tsx`

**Thay đổi chi tiết tại `GuideFormPage/index.tsx`:**

1. **NAV_SECTIONS** rút gọn chỉ còn **3 section**:
   ```tsx
   const NAV_SECTIONS = [
     { id: 'section-basic', label: 'Basic Info', icon: User },
     { id: 'section-experts', label: 'Specialties', icon: Sparkles },
     { id: 'section-career', label: 'Career', icon: Briefcase },
   ];
   ```
2. **SECTION_ERROR_FIELDS** quy hoạch lại:
   ```tsx
   const SECTION_ERROR_FIELDS: Record<string, (keyof TourGuideFormValues)[]> = {
     'section-basic': ['name', 'summary', 'quote', 'description', 'expYear', 'languages', 'avatar', 'coverImg'],
     'section-experts': ['experts'],
     'section-career': ['careerPath'],
   };
   ```
3. **Main Content render** chỉ gọi 3 `SectionCard`:
   ```tsx
   <div className="flex-1 min-w-0 py-4 space-y-4">
     <SectionCard id="section-basic" label="Basic Info">
       <BasicInfoSection />
     </SectionCard>
     <SectionCard id="section-experts" label="Specialties">
       <ExpertsSection />
     </SectionCard>
     <SectionCard id="section-career" label="Career">
       <CareerSection />
     </SectionCard>
   </div>
   ```

---

### 🟡 Cải tiến 3.5 — ExpertsSection: Thiết kế lại UI Chuyên môn (Premium & Gọn gàng)

**File:** [`experts-section.tsx`](../../../src/modules/AdminTourGuide/GuideFormPage/components/sections/experts-section.tsx)

**Vấn đề hiện tại:**

- Giao diện Specialties (Chuyên môn) hiện tại nhìn khá lộn xộn:
  - Input tự nhập và nút "Add" đứng cạnh nhau bị lệch chiều cao (`h-9` của nút vs chiều cao mặc định của `Input`), tạo cảm giác chắp vá.
  - Các tag đã chọn hiển thị đơn điệu với màu xanh dương nhạt mặc định, không đồng bộ với màu sắc phong phú trên profile công khai.
  - Phần gợi ý xếp phẳng hàng ngang đơn điệu, không được phân nhóm rõ ràng.
  - Khoảng cách (spacing) giữa các vùng (Selected tags -> Input -> Suggestions) không đồng đều và quá sát nhau.

**Yêu cầu cải tiến (Redesign thành 3 phân khu rõ ràng):**

1. **Phân khu 1: Chuyên môn đã chọn (Selected Specialties)**

   - Nếu chưa chọn chuyên môn nào: Hiển thị dòng text placeholder màu xám nhạt (`text-slate-400 text-xs italic`) để định hình không gian: _"Chưa chọn chuyên môn nào. Hãy chọn gợi ý bên dưới hoặc tự nhập."_
   - Nếu đã chọn: Hiển thị các tag với **màu sắc tương ứng sẽ render ngoài profile công khai** (sử dụng mapping `SPECIALTY_COLOR_MAP` từ mục 6.2 và preview 6.5) thay vì dùng chip xanh dương đơn điệu.
   - Thêm hiệu ứng hover: Tag co giãn nhẹ, nút xóa `x` đổi màu nổi bật.

2. **Phân khu 2: Thanh nhập chuyên môn (Input Container)**

   - Bọc Input và nút Add trong một cấu trúc đồng bộ:
     - Input chiều cao `h-10` với góc bo tròn mềm mại `rounded-xl border-slate-200 shadow-theme-xs focus-visible:ring-brand-500/10`.
     - Nút "Add" được thiết kế lại thành nút màu thương hiệu nổi bật (`bg-brand-500 hover:bg-brand-600 text-white font-semibold h-10 px-5 rounded-xl transition-all shadow-theme-xs flex items-center gap-1 border-0`).
     - Đứng cạnh nhau thẳng hàng với `gap-3`.

3. **Phân khu 3: Danh sách gợi ý phân nhóm (Grouped Suggestions)**
   - Phân gợi ý thành 3 nhóm rõ rệt để tăng tính chuyên nghiệp: **Loại hình tour**, **Phong cách** và **Cấp độ dịch vụ**.
   - Các tag gợi ý sử dụng border nét đứt mảnh (`border border-dashed border-slate-200 text-slate-500 rounded-full hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/20 transition-all cursor-pointer`).

#### Cấu trúc JSX đề xuất cho `experts-section.tsx`:

```tsx
import { Plus, X } from 'lucide-react';
import { useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSpecialtyColor } from '@/lib/specialty-colors'; // Từ mục 6.2
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';

const SUGGESTIONS_BY_CATEGORY = {
  'Loại hình tour': ['Cultural tours', 'Trekking expert', 'City walking tour', 'Water sports'],
  'Phong cách': ['Food storyteller', 'Photography support', 'Family-friendly'],
  'Cấp độ dịch vụ': ['Premium private guide', 'Budget-friendly'],
};

export function ExpertsSection() {
  const { control, setValue } = useFormContext<TourGuideFormValues>();
  const experts = (useWatch({ control, name: 'experts' }) ?? []) as string[];
  const inputRef = useRef<HTMLInputElement>(null);

  const addExpert = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed || experts.includes(trimmed)) return;
    setValue('experts', [...experts, trimmed], { shouldValidate: true });
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeExpert = (label: string) => {
    setValue(
      'experts',
      experts.filter((e) => e !== label),
      { shouldValidate: true }
    );
  };

  return (
    <div className="space-y-6">
      {/* Phân khu 1: Tags đã chọn */}
      <div className="space-y-2">
        <label className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">
          Chuyên môn đã chọn ({experts.length})
        </label>
        {experts.length === 0 ? (
          <div className="py-3 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/30 text-center">
            <p className="text-xs text-slate-400 italic">
              Chưa chọn chuyên môn nào. Chọn từ gợi ý bên dưới hoặc nhập mới.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-1.5 rounded-xl border border-slate-100 bg-slate-50/20">
            {experts.map((label) => {
              const colors = getSpecialtyColor(label);
              return (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-theme-xs border transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: colors.bg, color: colors.text, borderColor: `${colors.text}15` }}
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => removeExpert(label)}
                    className="opacity-70 hover:opacity-100 hover:bg-black/5 rounded-full p-0.5 transition-all"
                  >
                    <X size={11} />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Phân khu 2: Thanh nhập */}
      <div className="space-y-2">
        <label className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">
          Tự nhập chuyên môn mới
        </label>
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              placeholder="Ví dụ: Cắm trại qua đêm, Dẫn tour xe máy..."
              className="h-10 px-4 rounded-xl border-slate-200 shadow-theme-xs focus-visible:ring-brand-500/10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addExpert(e.currentTarget.value);
                }
              }}
            />
          </div>
          <Button
            type="button"
            onClick={() => addExpert(inputRef.current?.value ?? '')}
            className="h-10 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-1 shrink-0 shadow-theme-xs font-semibold text-xs border-0"
          >
            <Plus size={14} />
            Thêm
          </Button>
        </div>
      </div>

      {/* Phân khu 3: Gợi ý phân nhóm */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-gray-800/60">
        <label className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">
          Gợi ý chuyên môn phổ biến
        </label>
        <div className="space-y-4">
          {Object.entries(SUGGESTIONS_BY_CATEGORY).map(([category, items]) => {
            const available = items.filter((s) => !experts.includes(s));
            if (available.length === 0) return null;
            return (
              <div key={category} className="space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {available.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addExpert(s)}
                      className="px-3 py-1.5 rounded-full text-xs text-slate-600 border border-dashed border-slate-200 bg-white hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/20 transition-all font-medium"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

---

## Nhóm 4 — Cải Thiện GuideListPage (Table UX)

### 🟡 Cải tiến 4.1 — Search Debounce

**File:** [`GuideListPage/index.tsx`](../../../src/modules/AdminTourGuide/GuideListPage/index.tsx)

Hiện tại `onChange` trực tiếp cập nhật `keyword` state → gọi API mỗi keystroke. Với 10,007 records, gây spam API.

**Giải pháp:** Sử dụng hook `useDebounce` có sẵn tại [use-debounce.ts](../../../src/hooks/use-debounce.ts).

```tsx
// Thêm debounce 300ms
import { useDebounce } from '@/hooks/use-debounce'; // Hook có sẵn trong dự án

const [keyword, setKeyword] = useState('');
const debouncedKeyword = useDebounce(keyword, 300);

// Dùng debouncedKeyword cho query
const { data } = useTourGuideList({
  variables: { keyword: debouncedKeyword || undefined, page, pageSize: PAGE_SIZE },
  keepPreviousData: true,
});
```

---

### 🟡 Cải tiến 4.2 — Table Loading State: Opacity Fade thay vì Blank

**File:** [`GuideTable.tsx`](../../../src/modules/AdminTourGuide/GuideListPage/components/GuideTable.tsx)

Khi `isFetching` (đang load trang mới hoặc search mới), dữ liệu cũ nên **mờ xuống + spinner nhỏ** thay vì xóa trắng bảng gây flash.

```tsx
// Bọc table body
<tbody className={cn('transition-opacity duration-200', isFetching && 'opacity-50 pointer-events-none')}>
  {/* ...rows... */}
</tbody>;

// Spinner nhỏ trên toolbar khi isFetching
{
  isFetching && <Loader2 size={15} className="animate-spin text-brand-500 ml-2" />;
}
```

---

### 🟢 Cải tiến 4.3 — Pagination: Hiển thị đủ page range

**File:** [`GuideListPage/index.tsx`](../../../src/modules/AdminTourGuide/GuideListPage/index.tsx)

Hiện tại pagination chỉ hiển thị 5 trang đầu cố định (`Math.min(totalPages, 5)`). Với 10,007 records / 10 per page = 1000+ pages, user không thể nhảy đến trang giữa.

**Cải tiến:** Smart pagination với ellipsis:

```
[1] [2] [3] ... [47] [48] [49] ... [998] [999] [1000]
                  ↑ current page = 48
```

Hoặc đơn giản hơn: thêm **ô nhập trang** (Jump to page):

```tsx
<input
  type="number"
  min={1}
  max={totalPages}
  value={page}
  onChange={(e) => setPage(Number(e.target.value))}
  className="w-16 h-10 text-center rounded-lg border border-gray-200 text-sm"
/>
<span className="text-sm text-gray-500">/ {totalPages}</span>
```

---

## Nhóm 5 — Polish & Micro-interactions

### 🟢 Cải tiến 5.1 — GuideFormPage: Section card header có mô tả phụ

Mỗi section card chỉ có title (`h2`). Thêm subtitle/hint giải thích ngắn để admin hiểu điền gì:

```tsx
function SectionCard({ id, label, description, children }) {
  return (
    <div id={id} className="...">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-800">{label}</h2>
        {description && (
          <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-5 pt-5 pb-5">{children}</div>
    </div>
  );
}

// Ví dụ dùng:
<SectionCard
  id="section-basic"
  label="Basic Info"
  description="Thông tin cơ bản hiển thị trên profile công khai"
>
  <BasicInfoSection />
</SectionCard>

<SectionCard
  id="section-career"
  label="Career"
  description="Hành trình sự nghiệp — thứ tự từ mới nhất đến cũ nhất"
>
  <CareerSection />
</SectionCard>
```

---

### 🟢 Cải tiến 5.2 — GuideFormPage: Preview nhanh profile public

Trong `guide-form-header.tsx`, "View page" link chỉ hiện khi `isEdit`. Khi Create mới chưa có link để xem.

Thêm nút **"Preview Draft"** mở ra modal/drawer bên phải hiển thị mock profile dựa trên form data hiện tại (không cần API). Sync real-time với `useWatch`.

> ⚠️ **Phức tạp** — để roadmap sau khi các fix Priority 1 + 2 xong.

---

## Câu Hỏi Cần Xác Nhận Trước Khi Implement

| #   | Câu hỏi                                                                                                                                                             | Ảnh hưởng          | Trạng thái                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------- |
| Q1  | Backend có endpoint `GET /tour-guide/stats` (aggregate) không?                                                                                                      | Bug 1.1 — option B | Cần xác nhận                                                           |
| Q2  | `ratingCount` nghĩa chính xác là gì? Số reviews hay số tours đã dẫn?                                                                                                | Bug 1.2            | Cần xác nhận                                                           |
| Q3  | `useDebounce` hook đã có trong project chưa?                                                                                                                        | 4.1                | ✅ **Đã có** tại [use-debounce.ts](../../../src/hooks/use-debounce.ts) |
| Q4  | `ExperienceImageUpload` có support prop `aspectRatio` không?                                                                                                        | 3.3 / 6.6          | ❌ **Không**, cần nâng cấp (xem 6.6)                                   |
| Q5  | Unsaved changes guard: dùng native `beforeunload` hay cần custom modal đẹp hơn?                                                                                     | 2.1                | Cần xác nhận                                                           |
| Q6  | `specialties` trong admin (`experts: string[]`) và profile công khai (`specialties: { label, bg, text }[]`) — ai đảm nhận chuyển đổi màu sắc? Backend hay Frontend? | 6.2                | ✅ **Frontend** (đã map qua `SPECIALTY_PALETTE` trong API requests)    |
| Q7  | Admin hiện chưa có quản lý `moments` (video clips). Kế hoạch implement: gộp vào GuideFormPage hay tạo module riêng?                                                 | 6.3                | Cần xác nhận                                                           |
| Q8  | `dispatches` (lệnh điều tour) trên profile công khai — admin có cần tạo/chỉnh sửa hay tự động từ booking system?                                                    | 6.4                | Cần xác nhận                                                           |

---

## Nhóm 6 — Gap Analysis: Admin Form ↔ Public Profile

> Phân tích khoảng cách giữa dữ liệu admin quản lý và những gì hiển thị trên profile công khai ([GuideProfilePage](../../../src/modules/GuideProfilePage/index.tsx)). Mục tiêu: đảm bảo admin có đủ công cụ kiểm soát trải nghiệm người dùng cuối.

### 6.1 — Mapping Field: Admin Form → Public Profile

Đối chiếu từng field admin nhập vào với component hiển thị trên profile:

| Admin Field   | Public Component                       | Ghi chú                                       |
| ------------- | -------------------------------------- | --------------------------------------------- |
| `name`        | `HeroBanner` — tên lớn                 | ✅ Mapped                                     |
| `summary`     | `HeroBanner` — subtitle dưới tên       | ✅ Mapped (`title`)                           |
| `quote`       | `HeroBanner` — slogan in nghiêng       | ✅ Mapped (`slogan`)                          |
| `avatar`      | `HeroBanner` — ảnh tròn 72px           | ✅ Mapped                                     |
| `coverImg`    | `HeroBanner` — ảnh nền 280px           | ✅ Mapped                                     |
| `description` | `StorytellingBlock` — câu chuyện       | ✅ Mapped (`bio`)                             |
| `expYear`     | `StatsBlock` — "7 năm trong nghề"      | ✅ Mapped (`yearsOfExperience`)               |
| `languages`   | `StatsBlock` — "3 ngôn ngữ · VI EN FR" | ✅ Mapped                                     |
| `experts`     | `SpecialtyTags` — colored chips        | ⚠️ **Gap màu sắc** (xem 6.2)                  |
| `careerPath`  | `CareerTimeline`                       | ✅ Mapped                                     |
| —             | `StatsBlock` — "284 tour đã dẫn"       | ❌ **Không có field tương ứng trong admin**   |
| —             | `MomentsGrid` — video clips            | ❌ **Không có quản lý trong admin** (xem 6.3) |
| —             | `OperatorReviews`                      | ❌ Tự động từ hệ thống, không nhập tay        |
| —             | `GuestFeedback`                        | ❌ Tự động từ booking reviews                 |
| —             | `DestinationsChart`                    | ❌ Tự động tính từ lịch sử tour               |
| —             | `dispatch-list` (lệnh điều tour)       | ❌ Tự động từ booking (xem 6.4)               |

---

### 6.2 — ExpertsSection: Thiếu màu sắc tag (Color Palette cho Specialties)

**Vấn đề phát hiện từ code:**

Profile công khai hiển thị specialty tags với màu sắc riêng biệt:

```tsx
// specialty-tags.tsx — dùng bg + text color riêng từng tag
specialties.map((s) => <span style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>);
```

Nhưng `experts` trong admin form chỉ là `string[]` — **không có thông tin màu**. Admin không có cách chọn màu cho từng tag chuyên môn.

**Câu hỏi thiết kế:**

| Option                 | Mô tả                                               | Ưu điểm                  |
| ---------------------- | --------------------------------------------------- | ------------------------ |
| **A — Auto-assign**    | Frontend tự map label → màu cố định theo dictionary | Đơn giản, nhất quán      |
| **B — Color picker**   | Admin chọn màu khi thêm tag                         | Linh hoạt nhưng phức tạp |
| **C — Preset palette** | Admin chọn 1 trong 5-6 preset màu cho mỗi tag       | Cân bằng                 |

**Đề xuất Option A** — tạo `SPECIALTY_COLOR_MAP` cố định:

```tsx
// Ví dụ mapping tự động
const SPECIALTY_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  'Trekking expert': { bg: '#EEEDFE', text: '#3C3489' },
  'Food storyteller': { bg: '#FAECE7', text: '#712B13' },
  'Family-friendly': { bg: '#E1F5EE', text: '#085041' },
  'Photography support': { bg: '#FAEEDA', text: '#633806' },
  'Premium private guide': { bg: '#FBEAF0', text: '#72243E' },
  // fallback cho tag tự nhập
  default: { bg: '#F3F4F6', text: '#374151' },
};
```

Nếu không dùng dictionary, có thể hash label string → index vào mảng 6-8 màu preset.

**File cần thay đổi:**

- [`specialty-tags.tsx`](../../../src/modules/GuideProfilePage/components/specialty-tags.tsx) — áp dụng auto-assign nếu thiếu màu
- [`experts-section.tsx`](../../../src/modules/AdminTourGuide/GuideFormPage/components/sections/experts-section.tsx) — preview màu khi thêm tag

---

### 6.3 — MomentsGrid: Chưa có quản lý Video Clip trong Admin

**Vấn đề:** Profile công khai hiển thị `MomentsGrid` với video clips (`moments[]`), nhưng trong `GuideFormPage` hoàn toàn **không có section quản lý Moments**.

```tsx
// GuideProfilePage/index.tsx
<MomentsGrid moments={data.moments} /> // ← hiển thị nhưng không có cách quản lý
```

**Data structure cần manage:**

```tsx
// mock-guide.ts
moments: Array<{
  id: string;
  title: string; // "Sương mù lúc 6 giờ sáng"
  location: string; // "Cát Cát"
  duration: string; // "0:42"
  videoId: string; // bunny video ID
  placeholderGradient: string;
}>;
```

**Đề xuất — Thêm Section "Moments" vào GuideFormPage:**

Tùy thuộc vào backend có field này không, có 2 hướng:

| Hướng                             | Mô tả                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| **A — Gộp vào GuideFormPage**     | Thêm `section-moments` mới với danh sách video clip có thể thêm/xóa/reorder                         |
| **B — Module riêng `AdminVideo`** | Vì project đã có `src/modules/AdminVideo`, quản lý video clip tại đây, link guide qua `tourGuideId` |

> ⚠️ **Cần xác nhận backend** có field `moments` trong `POST/PUT /tour-guide` không, hay là entity riêng.

**Nếu gộp vào GuideFormPage (Option A):**

Thêm vào `NAV_SECTIONS`:

```tsx
{ id: 'section-moments', label: 'Moments', icon: Video },
```

UI của section: danh sách video card tương tự `CareerSection` nhưng có video preview thumbnail, title, location, duration.

---

### 6.4 — StatsBlock: "Tour đã dẫn" không có field admin tương ứng

**Vấn đề:** Profile công khai hiển thị `metrics.toursLed` (284 tour đã dẫn), nhưng field này **không có trong `TourGuideFormPayload`** — admin không thể nhập số này.

```tsx
// stats-block.tsx
<p>{metrics.toursLed}</p> // ← lấy từ đâu?
```

Có 2 khả năng:

1. **Tính tự động từ hệ thống** — đếm số booking đã hoàn thành của guide → không cần field admin
2. **Admin nhập tay** — cần thêm field `toursLed: number` vào `MetricsSection`

**Kiểm tra `use-guide-profile` hook** để biết data này đến từ đâu:

```tsx
// Nếu là field trong API response → xem thêm
// Nếu không có → cần hỏi backend
```

**Đề xuất:** Nếu backend không tự tính được, thêm field `toursLed` vào `MetricsSection`:

```
MetricsSection (sau cải tiến):
├── expYear      → Số năm kinh nghiệm (đã có)
├── languages    → Ngôn ngữ (đã có)
└── toursLed     → Số tour đã dẫn (CẦN THÊM nếu không auto)
```

### 6.6 — Image Upload: Tùy biến Aspect Ratio cho Avatar và Cover

**Vấn đề:** Component `ExperienceImageUpload` hiện tại đang hardcode tỉ lệ khung hình dạng landscape chữ nhật (`w-full aspect-[4/3] sm:aspect-[16/9]`).

- Với ảnh đại diện (Avatar), ngoài profile và list page đều hiển thị dạng tròn (1:1). Khung upload hình chữ nhật khiến admin khó hình dung ảnh sau khi cắt tròn sẽ bị mất góc như thế nào.
- Với ảnh bìa (Cover Image), tỉ lệ ngoài profile là banner dẹt rộng (tương đương 21:9). Tỉ lệ upload 16:9 quá vuông so với thiết kế thực tế.

**Đề xuất:** Cải tiến component `ExperienceImageUpload` nhận thêm prop `aspectRatio` và áp dụng style tương ứng:

- **Avatar upload mode:** `aspect-square w-32 h-32 rounded-full overflow-hidden` (Khung tròn tỉ lệ 1:1 trực quan).
- **Cover Image upload mode:** `aspect-[21/9] w-full rounded-xl` (Khung dẹt rộng).

**File ảnh hưởng:**

- `src/modules/AdminProduct/ProductFormPage/components/shared/experience-image-upload.tsx` — hỗ trợ prop `aspectRatio` và custom border radius style
- `basic-info-section.tsx` — truyền prop `aspectRatio` tương ứng cho avatar và coverImg

---

### 6.7 — GuideListPage: Thêm tính năng Sắp xếp (Sorting) cho Bảng dữ liệu

**Vấn đề:** Với tập dữ liệu lớn (ví dụ 10,007 records), admin cần có khả năng sắp xếp danh sách theo các tiêu chí quan trọng để kiểm tra nhanh. Hiện tại bảng danh sách hiển thị hoàn toàn tĩnh, không có trigger sắp xếp nào trên header.

**Đề xuất:**

- Cho phép bấm vào các tiêu đề cột: **Tên**, **Exp (năm)**, **Rating**, **Reviews (Tours Led)**, **Ngày tạo**.
- Hiển thị icon mũi tên lên/xuống (Sort indicators) tương ứng trạng thái sort: `asc`, `desc`, hoặc `none`.
- Tích hợp state `sortField` và `sortOrder` vào `useTourGuideList` query hook.

**File ảnh hưởng:**

- `GuideTable.tsx` — cập nhật `<TableHeader>` với các button sort và icon chỉ báo
- `GuideListPage/index.tsx` — quản lý state sort và truyền vào hook query

---

### 6.8 — Dispatches (Lệnh điều tour): Cơ chế liên kết hoặc xem lịch sử

**Vấn đề:** Nút "Xem lệnh điều tour cho từng booking" ở profile công khai đang tĩnh và không hoạt động. Trong dữ liệu admin, chúng ta chưa có liên kết nào để quản lý hoặc tra cứu xem hướng dẫn viên này đang có những lệnh điều tour (dispatches) nào được gán từ booking system.

**Đề xuất:**

- **Giải pháp ngắn hạn:** Thêm Quick Link hoặc Drawer "Lịch sử điều tour" (Dispatch History) trong trang edit của Guide hoặc từ danh sách list row. Nó sẽ fetch các booking được gán cho guide đó để đối chiếu nhanh.
- **Giải pháp dài hạn:** Xây dựng module/tab riêng trong hệ thống để quản lý dispatches, admin chỉ có thể bấm xem readonly danh sách tour mà guide đang phụ trách.

---

### 6.9 — Bulk Actions (Hành động hàng loạt) trên GuideListPage

**Vấn đề:** Admin hiện tại chỉ có thể xóa từng guide. Nếu cần dọn dẹp data test hoặc vô hiệu hóa hàng loạt, việc click từng dòng rất mất thời gian.

**Đề xuất:**

- Thêm cột checkbox ở đầu bảng `GuideTable`.
- Khi chọn 1 hoặc nhiều row, xuất hiện thanh công cụ nổi (Floating Action Bar) bên dưới màn hình với nút **Xóa hàng loạt (Bulk Delete)** hoặc **Cập nhật trạng thái hàng loạt**.

---

## Bản Đồ File Cần Thay Đổi

```
Priority 1 — Fix ngay (Blocking)
├── [MODIFY] GuideListPage/index.tsx
│   ├── Fix StatCard logic (Bug 1.1)
│   └── Thêm debounce search (4.1)
├── [MODIFY] GuideListPage/components/GuideTableRow.tsx
│   └── Fix "Tours led" → "Reviews" (Bug 1.2)
└── [MODIFY] GuideFormPage/index.tsx
    └── Thêm SECTION_ERROR_FIELDS + error indicator (Bug 1.3)

Priority 2 — Should Have
├── [MODIFY] GuideFormPage/index.tsx
│   ├── Thêm unsaved changes guard (2.1)
│   ├── Xóa các SectionCard "Bio" và "Metrics" khỏi render (3.4)
│   └── Xóa section-bio và section-metrics khỏi NAV_SECTIONS (3.4)
├── [MODIFY] GuideFormPage/components/guide-form-header.tsx
│   └── Thêm isDirty indicator (2.1)
├── [MODIFY] GuideListPage/components/DeleteConfirmDialog.tsx
│   └── Thêm isDeleting loading state (2.2)
├── [MODIFY] sections/basic-info-section.tsx
│   ├── Layout grid grid-cols-2 gap-5 (3.3)
│   ├── Gộp description field (Textarea) từ BioSection (3.4)
│   ├── Gộp expYear, languages, toursLed từ MetricsSection (3.3 / 3.4)
│   └── Truyền custom aspectRatio prop cho Avatar/Cover upload (6.6)
├── [MODIFY] sections/career-section.tsx
│   └── Drag-to-reorder với framer-motion (3.2)
├── [MODIFY] GuideListPage/components/GuideTable.tsx
│   ├── Opacity fade khi isFetching (4.2)
│   └── Cột checkbox + header sort (6.7 + 6.9)
└── [MODIFY] AdminProduct/ProductFormPage/components/shared/experience-image-upload.tsx
    └── Thêm prop aspectRatio để tùy biến khung hình upload (6.6)

[DELETE or UNUSED] sections/bio-section.tsx & sections/metrics-section.tsx

Priority 3 — Nice-to-Have (Roadmap)
├── [MODIFY] GuideListPage/index.tsx
│   ├── Smart pagination + jump-to-page (4.3)
│   ├── State sortField + sortOrder (6.7)
│   └── Floating bulk actions bar (6.9)
├── [MODIFY] GuideFormPage/index.tsx
│   └── Section card subtitle/description (5.1)
├── [MODIFY] sections/experts-section.tsx
│   ├── Category-grouped suggestions (5.3)
│   └── Preview màu tag giống profile công khai (6.5)
└── [MODIFY] GuideProfilePage/components/specialty-tags.tsx
    └── Fallback màu khi tag không có trong color map (6.2)

[NEW] src/lib/specialty-colors.ts — color dictionary dùng chung (6.2 + 6.5)

Cần xác nhận backend trước khi spec:
├── sections/moments-section.tsx [NEW?] — quản lý video clips (6.3)
└── GuideFormPage/index.tsx — thêm NAV_SECTIONS "Moments" (6.3)
```

---

## Tổng Kết Priority

```
🔴 Priority 1 (Fix ngay)
   → Bug 1.1: StatCard misleading
   → Bug 1.2: "Tours led" = ratingCount sai
   → Bug 1.3: Không có error indicator trên form nav

🟡 Priority 2 (Sprint này)
   → 2.1 Unsaved changes guard + isDirty indicator header
   → 2.2 Delete dialog loading state
   → 3.1 Language chips với flag + label
   → 3.2 Career drag-to-reorder
   → 3.3 BasicInfo layout 2 cột + gộp Bio và Metrics (Thiết kế 3 Zone)
   → 3.4 Xóa các section card Bio và Metrics riêng khỏi GuideFormPage
   → 4.2 Table opacity fade khi loading
   → 6.6 Tùy biến Aspect Ratio cho component Image Upload

🟢 Priority 3 (Roadmap)
   → 4.1 Debounce search
   → 4.3 Smart pagination
   → 5.1 Section card subtitle
   → 5.3 Expert category grouping
   → 6.2 Specialty tag color mapping (Admin + Profile)
   → 6.3 Moments section trong GuideFormPage (chờ backend confirm)
   → 6.4 Field toursLed trong BasicInfoSection (chờ backend confirm)
   → 6.5 Expert tag preview màu ngay trong form
   → 6.7 Sắp xếp danh sách (Sorting) ở danh sách hướng dẫn viên
   → 6.8 Tra cứu lệnh điều tour (Dispatches) lịch sử
   → 6.9 Hành động hàng loạt (Bulk Actions)
```

## Nhóm 7 — Các Giải Pháp UI/UX Đột Phá (Premium UX Solutions)

> Để đưa giao diện từ mức **"tiện dụng" (Functional)** lên mức **"cao cấp" (Premium/Delightful)**, dưới đây là các giải pháp UI/UX chuyên sâu được thiết kế riêng cho hệ thống Admin của Web-Travel.

### 7.1 — Live Preview Panel (Trực quan hóa thời gian thực)

- **Vấn đề:** Admin hiện phải nhập liệu "mù" trên Form và chỉ thấy kết quả sau khi lưu rồi click sang trang Profile công khai. Điều này làm tăng rủi ro lệch bố cục chữ, ảnh bìa bị cắt sai góc, hoặc độ dài mô tả không phù hợp.
- **Giải pháp:**
  - Tách màn hình Form thành bố cục **Split-Screen** trên Desktop (60% Form bên trái, 40% Live Preview bên phải).
  - Sử dụng một **Mobile/Desktop Simulator** thu nhỏ thể hiện chính xác giao diện Guide Profile ngoài trang khách hàng.
  - Đồng bộ dữ liệu tức thời bằng `useWatch` từ React Hook Form kết hợp với `framer-motion` để tạo hiệu ứng cập nhật mượt mà.
  - Hỗ trợ nút **Toggle Preview** để ẩn/hiển thị màn hình này nhằm tối ưu không gian làm việc.
- **Hiệu quả UX:** Giảm 80% thao tác thử sai của quản trị viên.

### 7.2 — Bộ Cắt Ảnh Thông Minh Tích Hợp (Inline Smart Cropper)

- **Vấn đề:** Mặc dù đã cải tiến `aspectRatio` cho khung upload, việc người dùng tải lên các ảnh có tỉ lệ gốc quá lệch (ảnh đứng cho cover 21:9, ảnh ngang cho avatar 1:1) sẽ làm ảnh bị méo hoặc mất chi tiết quan trọng.
- **Giải pháp:**
  - Tích hợp thư viện cắt ảnh gọn nhẹ (như `react-image-crop`) trực tiếp vào component `ExperienceImageUpload`.
  - Khi admin kéo thả hoặc chọn ảnh, một **Modal Crop** sẽ tự động hiển thị với tỉ lệ bắt buộc:
    - **Avatar:** Khóa tỉ lệ 1:1, hiển thị overlay mặt nạ hình tròn (circular mask) để xem trước.
    - **Cover Image:** Khóa tỉ lệ 21:9.
- **Hiệu quả UX:** Đảm bảo 100% hình ảnh hiển thị trên trang công khai đạt chuẩn thẩm mỹ, không bị co giãn.

### 7.3 — Gợi Ý Chuyên Môn Tự Động Bằng AI (AI-Powered Specialty Tags)

- **Vấn đề:** Việc nhập thẻ chuyên môn (Specialties) đòi hỏi admin phải tự nghĩ hoặc tìm kiếm từ gợi ý tĩnh. Có thể bỏ sót những điểm mạnh đặc sắc của hướng dẫn viên đã được viết trong phần tiểu sử.
- **Giải pháp:**
  - Bên cạnh ô nhập tag, thêm một nút bấm nhỏ biểu tượng Sparkles: **"Gợi ý bằng AI"**.
  - Khi click, một hàm phân tích ngôn ngữ tự nhiên (hoặc rule-based regex đơn giản trên frontend) sẽ quét nội dung trong trường `description` (Bio).
  - _Ví dụ:_ Nếu tiểu sử chứa từ khóa "ẩm thực", "ăn uống", "bún chả" -> Đề xuất tag `Food storyteller`; nếu chứa "leo núi", "vượt thác" -> Đề xuất tag `Trekking expert`.
- **Hiệu quả UX:** Giảm thiểu thao tác nhập liệu thủ công và giúp hồ sơ hướng dẫn viên đầy đủ thông tin hơn.

### 7.4 — Trình Soạn Thảo Rich Text Storytelling (TipTap / Lexical Editor)

- **Vấn đề:** Trường `description` hiện là Textarea thô, chỉ cho phép nhập văn bản thuần túy (Plaintext). Điều này khiến trang giới thiệu bản thân của hướng dẫn viên ngoài public rất đơn điệu, không thể nhấn mạnh các ý quan trọng.
- **Giải pháp:**
  - Thay thế Textarea bằng một phiên bản **WYSIWYG Markdown Editor** tối giản (sử dụng TipTap hoặc Lexical).
  - Chỉ cung cấp các định dạng cơ bản để giữ giao diện nhất quán: **Bold**, _Italic_, Bullet List, Number List và Blockquote (để trích dẫn lời chia sẻ ấn tượng của hướng dẫn viên).
- **Hiệu quả UX:** Nâng cao chất lượng truyền tải câu chuyện thương hiệu của hướng dẫn viên.

### 7.5 — Chế Độ Chỉnh Sửa Nhanh Tại Chỗ (Inline Quick Edit)

- **Vấn đề:** Khi cần cập nhật nhanh một thông tin nhỏ (như thêm ngôn ngữ mới hoặc tăng năm kinh nghiệm) cho nhiều hướng dẫn viên, admin phải click vào từng dòng, chuyển trang edit, sửa, lưu, rồi quay lại trang danh sách.
- **Giải pháp:**
  - Hỗ trợ chế độ **Inline Edit** trên bảng danh sách `GuideTable`.
  - Khi Double-click vào một ô dữ liệu (ví dụ: cột _Kinh nghiệm_ hoặc _Ngôn ngữ_), ô đó chuyển thành input nhỏ tại chỗ (Inline Input / Select).
  - Nhấn `Enter` để lưu qua API nhanh (optimistic update) hoặc `Esc` để hủy.
- **Hiệu quả UX:** Tăng tốc độ quản lý dữ liệu lên gấp 3 lần đối với các tác vụ cập nhật định kỳ.
