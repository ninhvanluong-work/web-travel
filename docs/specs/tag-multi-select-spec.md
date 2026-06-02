---
title: 'Product Tags Multi-Select & Search Builder'
created: '2026-05-24'
status: 'draft'
domain: 'admin'
related: 'spec-admin-product-fields-sync.md'
---

# Spec: Product Tags Multi-Select & Premium Selection UX

## 1. Vấn đề & Mục tiêu

Trang quản trị sản phẩm (`ProductFormPage`) cung cấp tính năng gán nhãn (Tags) cho Tour du lịch. Cơ chế quản lý nhãn hiện tại gặp các bất cập sau:

1. **Tải lượng dữ liệu quá lớn ở Popular Tags:** `pageSize: 49` gây lãng phí tài nguyên và làm loãng khu vực hiển thị.
2. **Trải nghiệm chọn nhãn bị ngắt quãng:** Nhấp chọn tag phổ biến → `addTag` luôn gọi `inputRef.current?.focus()` → dropdown tự mở che khuất giao diện.
3. **Dropdown tìm kiếm chật hẹp:** `max-h-48` (192px) hiển thị quá ít gợi ý, dùng `absolute div` dễ bị cắt bởi `overflow-hidden` của container cha.
4. **False "Create new tag":** Khi pageSize nhỏ, `exactMatch` chỉ check trong tags đã load → tag tồn tại ở trang chưa load vẫn bị coi là mới.

**Mục tiêu:**

- Popular Tags: `pageSize=10` + infinite scroll.
- Ô search: infinite scroll `pageSize=10`; bổ sung API `searchTag` riêng để check existence trước khi cho phép create.
- Fix focus: `addTag` nhận flag `shouldFocus`, Popular Tags click không focus input.
- Nâng cấp dropdown: Radix `Popover` + `max-h-72` + `w-[var(--radix-popover-trigger-width)]`.
- Không thay đổi `toApiPayload` — `tagIds` đang đúng, backend nhận đúng field này.

---

## 2. Hành vi mong muốn (User Experience)

| Hành động                            | Kết quả mong đợi                                                                                               |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **Tải trang**                        | Popular Tags hiển thị 10 nhãn đầu. Nếu còn thêm, nút _View More_ dạng dashed-border xuất hiện ở cuối.          |
| **Nhấp "View More"**                 | Load thêm 10 nhãn tiếp theo, bổ sung vào danh sách.                                                            |
| **Nhấp chọn/hủy tag ở Popular Tags** | Tag thay đổi trạng thái highlight. **Không focus input, không mở dropdown.**                                   |
| **Click vào ô tìm kiếm**             | Radix Popover mở, dropdown rộng 100% trigger, `max-h-72`, bo tròn mềm, shadow premium.                         |
| **Gõ keyword**                       | Gọi API search với keyword; khi scroll gần cuối dropdown load trang tiếp (infinite scroll).                    |
| **Gõ tên tag và bấm "+ Create"**     | Gọi `searchTag` trước để xác nhận tag chưa tồn tại → nếu chưa có thì tạo mới → auto-add vào danh sách đã chọn. |

---

## 3. Thay đổi kỹ thuật

### 3.1. `src/api/tag/requests.ts`

```typescript
// Đổi pageSize mặc định từ 49 → 10
export async function getTagPage(page: number, pageSize = 10): Promise<TagPage> {
  const { data } = await request.get<ApiTagListResponse>('/tag', {
    params: { page, pageSize },
  });
  // ...
}

// Thêm search function (dùng cho ô tìm kiếm)
export async function searchTagPage(keyword: string, page: number, pageSize = 10): Promise<TagPage> {
  const { data } = await request.get<ApiTagListResponse>('/tag', {
    params: { keyword, page, pageSize },
  });
  // ...
}
```

### 3.2. `src/api/tag/queries.ts`

```typescript
// Truyền pageSize tường minh cho Popular Tags query
export const useTagListInfinite = createInfiniteQuery<TagPage, void>({
  primaryKey: '/tag',
  queryFn: ({ pageParam = 1 }) => getTagPage(pageParam as number, 10),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});

// Query mới cho ô search (infinite + keyword)
export const useTagSearchInfinite = createInfiniteQuery<TagPage, { keyword: string }>({
  primaryKey: '/tag/search',
  queryFn: ({ queryKey: [, vars], pageParam = 1 }) => searchTagPage(vars.keyword, pageParam as number, 10),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

### 3.3. `src/modules/AdminProduct/ProductFormPage/components/sections/tags-section.tsx`

**Thay đổi chính:**

1. `addTag(tag, shouldFocus = true)` — Popular Tags gọi với `shouldFocus = false`.
2. Thay `absolute div` bằng Radix `Popover` — xoá `onBlur + setTimeout`.
3. Ô search dùng `useTagSearchInfinite` thay vì filter client-side từ `useTagListInfinite`.
4. Khi user gõ, debounce 300ms rồi set keyword vào query.
5. `exactMatch` check qua `searchTag` API trước khi hiện nút Create — nếu API trả về kết quả exact thì ẩn nút.
6. Dropdown: `max-h-72`, `w-[var(--radix-popover-trigger-width)]`, shadow premium, góc bo `rounded-xl`.
7. Infinite scroll trong dropdown: sentinel element ở cuối list, dùng `IntersectionObserver` để trigger `fetchNextPage`.

### 3.4. Không thay đổi

- `src/api/product/requests.ts` — `toApiPayload` giữ nguyên `tagIds`.
- Mọi logic display tag đã chọn (badge list + remove) giữ nguyên.

---

## 4. Dependencies & Conflicts

- **Depends on:** `@radix-ui/react-popover` (đã có qua `src/components/ui/popover.tsx`).
- **Modifies:**
  - `src/api/tag/requests.ts`
  - `src/api/tag/queries.ts`
  - `src/modules/AdminProduct/ProductFormPage/components/sections/tags-section.tsx`
- **Must NOT break:**
  - Tạo mới tag trong dropdown search.
  - Hiển thị tags ở frontend sản phẩm.
  - Lưu sản phẩm với tagIds.
- **Conflicts with:** Không có.

---

## 5. Kế hoạch kiểm thử

1. **Popular Tags pageSize:** F12 Network → `GET /tag` truyền `pageSize=10`.
2. **Infinite scroll Popular Tags:** Click View More → load thêm 10 tags, không reload trang.
3. **Click Popular Tags không focus:** Click 3 tags liên tiếp → không có dropdown mở, input không được focus.
4. **Dropdown search:** Click input → Popover mở đúng width, `max-h-72`, scroll mượt.
5. **Search infinite scroll:** Gõ keyword, scroll xuống cuối dropdown → load trang tiếp.
6. **Không tạo duplicate:** Gõ tên tag đã có → nút "+ Create" không xuất hiện.
7. **Tạo tag mới & lưu:** Tạo tag `"Adventure Nature"` → Save → F12 confirm `tagIds` có ID tag mới → F5 reload vẫn hiển thị đúng.
