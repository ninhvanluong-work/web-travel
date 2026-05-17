# Specification: Màn hình Create/Update Product (Admin)

## 1. Tổng quan (Overview)

Màn hình phục vụ cho việc nhập liệu, tạo mới và chỉnh sửa thông tin của một **Product** (Tour/Sản phẩm du lịch) trong hệ thống quản trị (Admin Dashboard).

**Công nghệ sử dụng:**

- **Quản lý Form:** `react-hook-form`
- **Validation:** `zod` kết hợp `@hookform/resolvers/zod`
- **Thành phần UI:** Bộ UI Components dưa trên Radix UI (`FormWrapper`, `FormField`, `TextField`, `Select`...)
- **Đa ngôn ngữ (i18n):** KHÔNG SỬ DỤNG (theo yêu cầu).

---

## 2. Tổ chức Layout

Do bảng `product` có rất nhiều trường (khoảng 20 field cần nhập/quản lý), giao diện nên được chia thành các **khu vực ngữ nghĩa (Sections/Cards)** để người nhập liệu dễ nhìn. Cột Layout có thể là lưới 2 cột:

- **Cột chính (Main Content - Trái - 2/3 màn hình):** Thông tin chung, Mô tả chi tiết, Nội dung hành trình.
- **Cột phụ (Sidebar - Phải - 1/3 màn hình):** Trạng thái, Cấu hình thời gian, Phân loại/Liên kết (Destination, Supplier), Hình ảnh Media, Định giá.

### Gợi ý Sections Trực Quan:

1. **Thông tin chung (General Information)**
   - Tên sản phẩm (`name`)
   - Đường dẫn (`slug` - thường tự động sinh từ name nhưng cho phép sửa)
   - Mã sản phẩm (`code`)
   - Mô tả / Review tổng quan (`description`)
2. **Chi tiết nội dung & Mở rộng (Details & Inclusions)**
   - Điểm nổi bật (`highlight` - Editor hoặc Textarea)
   - Bao gồm (`include` - Editor hoặc Textarea)
   - Không bao gồm (`exclude` - Editor hoặc Textarea)
3. **Cấu hình thời gian (Duration Settings)**
   - Thời gian (`duration` & `duration_type`)
4. **Liên kết Dữ Liệu (Relations)**
   - Điểm đến (Destination - `destination_id` select options)
   - Nhà cung cấp (Supplier - `supplier_id` select options)
5. **Hình ảnh & Media (Media Upload)**
   - Ảnh đại diện (`thumbnail`)
   - Ảnh lịch trình (`itinerary_image`)
   - Bộ sưu tập ảnh (`images` - array/json)
6. **Giá trị & Thống kê (Pricing & Stats)**
   - Giá hiển thị/Giá tối thiểu (`min_price`)
   - Điểm đánh giá (Hiển thị readonly/hoặc manual: `review_point`)
7. **Trạng thái (Status)**
   - Status (`status`: draft, published, etc.)

---

## 3. Cấu trúc Data Model & Zod Schema

Dưới đây thiết kế Zod schema tương ứng trực tiếp với Schema của bản PostgreSQL từ backend:

```typescript
import { z } from 'zod';

// Định nghĩa Enum cho Status
export const ProductStatusEnum = z.enum(['draft', 'published', 'archived']);

export const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống').max(500, 'Tên sản phẩm quá dài'),
  slug: z.string().min(1, 'Đường dẫn (Slug) không được để trống'),
  code: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),

  destination_id: z.string().uuid('Vui lòng chọn Điểm đến hợp lệ').optional().nullable(),
  supplier_id: z.string().uuid('Vui lòng chọn Nhà cung cấp hợp lệ').optional().nullable(),

  duration: z.coerce.number().int().min(1, 'Thời gian phải lớn hơn 0').default(1),
  duration_type: z.string().default('day'), // Gợi ý: 'day', 'night', 'hour' hoặc enum

  highlight: z.string().optional().nullable(),
  include: z.string().optional().nullable(),
  exclude: z.string().optional().nullable(),

  min_price: z.coerce.number().min(0, 'Giá không được âm').default(0),
  review_point: z.coerce.number().min(0).max(5).default(0),
  status: ProductStatusEnum.default('draft'),

  // Media fields
  thumbnail: z.string().optional().nullable(),
  itinerary_image: z.string().optional().nullable(),
  images: z.array(z.string()).optional().nullable(), // Giả định JSON lưu array URL string
});

export type ProductFormValues = z.infer<typeof productSchema>;
```

---

## 4. Ánh xạ UI Components

Dựa vào kiến trúc Form Components bạn đã cung cấp (wrapper của Radix UI):

### 4.1. Text Inputs (TextField)

Sử dụng `<TextField>` (thường có sẵn trong UI lib của bạn) để nhập:

- `name`
- `slug`
- `code`
- `duration` (type="number")
- `min_price` (type="number")
- `review_point` (type="number", step="0.1")

### 4.2. Select / Autocomplete (Các trường Relationship / Select)

Sử dụng Controller của `react-hook-form` qua `<FormField>` bọc lại `<Select>` Radix UI:

- `destination_id`: Select dropdown load danh sách Destinations từ API / Store.
- `supplier_id`: Select dropdown load danh sách Suppliers từ API / Store.
- `duration_type`: Một List Select tĩnh (VD: Ngày, Đêm, Giờ).
- `status`: List Select tĩnh (Bản nháp, Công khai).

### 4.3. Rich Text / Textarea

Dùng `<Textarea>` HTML cơ bản bọc bằng FormControl, hoặc tốt nhất là Editor/Markdown cho:

- `description`
- `highlight`
- `include`
- `exclude`

### 4.4. Image Uploaders

Quy trình: Component con call Upload API > Lấy về text URL (ví dụ: S3 URL) > Gọi callback đưa string đó vào các field `thumbnail` / `images`.

---

## 5. Ví dụ mã giả Component (Draft Skeleton Code)

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormValues } from '@/validations/product';
import { FormWrapper } from '@/components/ui/form';
import { TextField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/button';
// Import SelectField, TextareaField từ components UI của bạn nếu có

export const ProductForm = () => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      code: '',
      duration: 1,
      duration_type: 'day',
      status: 'draft',
      min_price: 0,
      images: [],
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    console.log('Submitted Data:', data);
    // TODO: Call API tạo mới hoặc cập nhật product tại đây
  };

  return (
    <FormWrapper form={form} onSubmit={onSubmit} className="space-y-8 max-w-[1280px] mx-auto p-4 sm:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* === CỘT TRÁI (THÔNG TIN CHÍNH) === */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Thông tin cơ bản</h2>

            <div className="space-y-4">
              <TextField
                control={form.control}
                name="name"
                size="lg"
                placeholder="Tên sản phẩm (VD: Tour Đà Nẵng 3N2Đ)"
                error={form.formState.errors.name}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  control={form.control}
                  name="code"
                  placeholder="Mã sản phẩm (VD: T-DN-01)"
                  error={form.formState.errors.code}
                />
                <TextField
                  control={form.control}
                  name="slug"
                  placeholder="Alias URL (tour-da-nang-3n2d)"
                  error={form.formState.errors.slug}
                />
              </div>

              {/* TextArea Placeholder */}
              <div className="pt-2">
                <label className="text-sm font-medium">Mô tả tổng quan</label>
                {/* `<TextareaField ... />` thay cho textarea thuần */}
                <textarea
                  className="w-full mt-2 border rounded-md p-2 h-24"
                  placeholder="Nhập mô tả sản phẩm tại đây..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Mô tả hành trình biểu mẫu</h2>
            {/* TextAreas placeholders */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Điểm nổi bật</label>
                <textarea className="w-full mt-2 border rounded-md p-2 h-24" />
              </div>
              <div>
                <label className="text-sm font-medium">Giá bao gồm</label>
                <textarea className="w-full mt-2 border rounded-md p-2 h-24" />
              </div>
              <div>
                <label className="text-sm font-medium">Giá không bao gồm</label>
                <textarea className="w-full mt-2 border rounded-md p-2 h-24" />
              </div>
            </div>
          </div>
        </div>

        {/* === CỘT PHẢI (CẤU HÌNH & LIÊN KẾT) === */}
        <div className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Cấu hình</h2>
            {/* Component Select chưa thiết lập, Placeholder cho Status: */}
            <div className="mb-4 bg-gray-50 border rounded-md p-3 h-12 flex items-center text-sm text-gray-500">
              [Status Select: Select Draft/Published]
            </div>

            <div className="flex gap-2 w-full mt-4">
              <div className="flex-1">
                <TextField type="number" control={form.control} name="duration" placeholder="Thời lượng" />
              </div>
              <div className="flex-[0.5] bg-gray-50 border rounded-md p-2 flex items-center justify-center text-sm text-gray-500">
                [Day]
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Thuộc tính kết nối</h2>
            <div className="space-y-4 text-sm text-gray-500">
              <div className="bg-gray-50 border rounded-md p-3 h-12 flex items-center">[Destination Select]</div>
              <div className="bg-gray-50 border rounded-md p-3 h-12 flex items-center">[Supplier Select]</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Định giá & Thống kê</h2>
            <TextField type="number" control={form.control} name="min_price" placeholder="Giá niêm yết thấp nhất" />
            <div className="mt-4">
              <TextField
                type="number"
                control={form.control}
                name="review_point"
                placeholder="Điểm đánh giá thủ công (0-5)"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6 border-t pt-6">
        <Button variant={'shadow'} size="lg" type="button" onClick={() => {}}>
          Hủy bỏ
        </Button>
        <Button variant={'darkblue'} size="lg" type="submit" className="font-bold">
          Lưu & Cập nhật sản phẩm
        </Button>
      </div>
    </FormWrapper>
  );
};
```
