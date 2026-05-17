---
title: 'Admin – Product Lookup (Supplier & Destination Dropdowns)'
created: '2026-04-08'
status: 'done'
domain: 'admin'
related: 'form-actions.md'
---

# Spec: Admin – Lookup Nhà cung cấp & Điểm đến

## 1. Vấn đề / Mục tiêu

Sidebar của form tạo/sửa tour có 2 dropdown: **Nhà cung cấp** và **Điểm đến**.
Backend chưa có endpoint riêng cho 2 danh mục này, nên frontend dùng workaround: gọi `GET /product` với `pageSize` lớn, sau đó deduplicate để lấy danh sách unique supplier / destination.

### Bug đã gặp

Khi vào trang **Create tour**, hai query này fire ngay khi mount `RelationCard`:

```ts
// lookup.ts — cũ (gây lỗi 400)
const { items } = await getProductList({ pageSize: 200 });
```

Backend giới hạn `pageSize ≤ 50` → trả về:

```json
{ "message": ["pageSize must not be greater than 50"], "error": "Bad Request", "statusCode": 400 }
```

Lỗi này khiến dropdown không load được và người dùng tưởng nhấn **Lưu nháp** bị lỗi.

---

## 2. Hành vi mong muốn

| Sự kiện                      | Kết quả                                           |
| ---------------------------- | ------------------------------------------------- |
| Vào trang Create / Edit tour | Dropdown Nhà cung cấp & Điểm đến load bình thường |
| Nhấn Lưu nháp                | Không bị lỗi 400 liên quan đến lookup             |
| Số tour ≤ 50                 | Đủ toàn bộ options                                |
| Số tour > 50                 | Options có thể thiếu (known limitation, xem §5)   |

---

## 3. Thay đổi kỹ thuật

| File                        | Thay đổi                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `src/api/product/lookup.ts` | Giảm `pageSize: 200` → `pageSize: 50` ở cả `fetchSuppliers` và `fetchDestinations` |

### Diff logic

```ts
// Trước
const { items } = await getProductList({ pageSize: 200 }); // ❌ vượt giới hạn backend

// Sau
// NOTE: backend caps pageSize at 50 — if total products > 50 some suppliers may be missing
const { items } = await getProductList({ pageSize: 50 }); // ✅
```

---

## 4. Dependencies & Conflicts

- **Depends on:** None
- **Modifies:** `lookup.ts` — chỉ giá trị `pageSize`
- **Must NOT break:** Dropdown vẫn render đúng khi data trả về; dedup logic không thay đổi
- **Conflicts with:** None

---

## 5. Known Limitations & Future Work

> **Giới hạn hiện tại:** Nếu tổng số tour trong DB vượt 50, một số supplier / destination sẽ không xuất hiện trong dropdown vì chỉ scan trang đầu tiên.

### Giải pháp lâu dài (Out of scope hiện tại)

| Option               | Mô tả                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------- |
| **Backend endpoint** | Yêu cầu BE tạo `GET /supplier` và `GET /destination` riêng — sạch nhất                |
| **Pagination loop**  | Frontend loop qua nhiều trang (50/page) cho đến hết, ghép + dedup — nhiều request hơn |

---

## 6. Out of scope

- Thay đổi logic dedup supplier / destination
- Thêm search / filter trong dropdown
- Fetch toàn bộ products vượt giới hạn 50
