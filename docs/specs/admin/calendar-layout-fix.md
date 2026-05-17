---
title: 'Fix Calendar Layout in DatePicker'
created: '2026-04-12'
status: 'draft'
domain: 'admin'
---

# Spec: Fix Calendar Layout in DatePicker

## 1. Vấn đề / Mục tiêu

> Mô tả ngắn gọn: tại sao cần làm, hiện trạng đang tệ ở đâu.

Hiện tại, component `Calendar` (được sử dụng bởi `DatePicker` và `DateRangeDropdown` trong trang Admin) gặp lỗi hiển thị nghiêm trọng khi nằm trong các container bị giới hạn chiều rộng (Popovers lồng nhau).

**Hiện trạng:**

- Các tiêu đề thứ trong tuần (S M T W T F S) bị đè lên nhau.
- Các ô chứa ngày bị co lại không đồng đều.
- Giao diện lịch trông bị "bóp nghẹt" và không thể sử dụng được.

**Mục tiêu:**

- Đảm bảo lịch luôn hiển thị đủ chiều rộng cố định (7 cột).
- Căn chỉnh chính xác tiêu đề thứ và các ô ngày.
- Đảm bảo tính ổn định của layout Flexbox trên các thành phần Table (`tr`, `td`, `th`).

---

## 2. Hành vi mong muốn

> Mô tả behavior cuối cùng theo dạng user-story hoặc bảng trạng thái.

| Hành động                             | Kết quả mong đợi                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Mở `DateRangeDropdown`                | Dropdown hiện ra với các preset và 2 input chọn ngày.                                          |
| Click vào biểu tượng lịch trong input | Calendar hiện ra bên dưới input, không bị móp méo, các cột thẳng hàng.                         |
| Co giãn trình duyệt                   | Calendar giữ nguyên kích thước nội tại (intrinsic width), không bị thu nhỏ theo container cha. |

---

## 3. Thay đổi kỹ thuật

> Liệt kê file nào thay đổi, thêm gì, bỏ gì.

| File                                | Thay đổi                                                                                                                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/ui/calendar.tsx`    | - Cập nhật class cho `table` từ `w-full` thành `w-fit` hoặc gán width cố định.<br>- Thêm `w-8 h-8` vào class `cell` để đồng bộ với `head_cell`.<br>- Kiểm tra lại tính chất `shrink-0` trên các hàng. |
| `src/components/ui/date-picker.tsx` | - Đảm bảo thẻ div chứa calendar có thuộc tính `min-w-max`.                                                                                                                                            |

---

## 4. Dependencies & Conflicts ← PHẦN BẮT BUỘC

> Điền đầy đủ trước khi approve. Nếu không có thì ghi "None".

- **Depends on:** None
- **Modifies:** `Calendar` component (UI-only).
- **Must NOT break:** Chức năng chọn ngày, logic disable ngày trong quá khứ, và responsive chung của trang danh sách sản phẩm.
- **Conflicts with:** None.

---

## 5. Out of scope

> Những gì cố tình KHÔNG làm trong spec này.

- Thay đổi thư viện `react-day-picker`.
- Refactor lại toàn bộ hệ thống popover của Admin.

---

## 6. Open questions

> Những điểm chưa quyết định. Xóa section này khi đã resolve hết trước approve.

- Có nên chuyển hẳn cấu trúc `flex` trên `tr` về `display: grid` chuẩn của Shadcn v8 để tăng độ ổn định không? (Khuyến nghị: Có).
