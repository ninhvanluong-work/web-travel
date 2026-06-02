---
title: 'Render dữ liệu Rich Text từ TinyMCE Editor'
created: '2026-05-22'
status: 'implemented'
domain: 'product-page'
---

# Spec: Render dữ liệu Rich Text từ TinyMCE Editor

## 1. Vấn đề / Mục tiêu

Hiện tại, trang Admin của dự án sử dụng component `<Editor>` (TinyMCE) để biên tập nội dung giàu văn bản (chữ đậm, gạch đầu dòng, danh sách...). Dữ liệu lưu dưới database sẽ có dạng HTML thô như `<p><strong>Dịch vụ không bao gồm</strong></p>` hoặc `<ul><li>Dịch vụ 1</li></ul>` cùng các ký tự thực thể đặc biệt như `kh&ocirc;ng`.

Tuy nhiên, trang hiển thị chi tiết sản phẩm trên Frontend (`ProductPage`) lại hiển thị trực tiếp các thẻ HTML thô và ký tự thực thể này dưới dạng văn bản thuần túy (raw text) do render bằng JSX thông thường `{item}`. Điều này làm mất định dạng thẩm mỹ và gây trải nghiệm người dùng không tốt.

Mục tiêu của spec này là chuyển đổi cơ chế hiển thị trên Frontend sang dạng render HTML an toàn, tự động xử lý các định dạng từ TinyMCE.

---

## 2. Hành vi mong muốn

| Hành động                        | Kết quả mong đợi                                                                                                                                                                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Truy cập trang chi tiết sản phẩm | Dữ liệu `Included` / `Not included` hiển thị dưới dạng danh sách gạch đầu dòng hoặc in đậm mượt mà thay vì hiển thị thẻ `<p>` hay `<strong>`. Các ký tự thực thể như `kh&ocirc;ng` được giải mã hoàn hảo thành chữ tiếng Việt có dấu `không`. |
| Xem lịch trình (Itinerary)       | Các hoạt động chi tiết (`step.description`) hiển thị chính xác định dạng rich-text đã chỉnh sửa từ Admin.                                                                                                                                     |
| Fallback mô tả ngắn              | Khi trường mô tả ngắn `shortDescription` trống và hệ thống lấy mô tả lớn `description` (HTML từ TinyMCE) để thay thế, văn bản vẫn được render HTML mượt mà trong khung thiết kế in nghiêng.                                                   |

---

## 3. Thay đổi kỹ thuật

Chúng ta sửa đổi 3 file hiển thị chính để hỗ trợ render HTML an toàn thông qua thuộc tính `dangerouslySetInnerHTML` kết hợp cùng custom Tailwind CSS selectors để hỗ trợ style list của TinyMCE.

| File                                                                                                               | Thay đổi                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [included-section.tsx](file:///d:/Remote/web-travel/src/modules/ProductPage/components/included-section.tsx)       | Thêm hàm `isHtmlString` kiểm tra HTML. Viết helper `renderContent` để render `dangerouslySetInnerHTML` cho HTML đơn lẻ, đồng thời giữ cơ chế render mảng văn bản thô cho dữ liệu legacy (tương thích ngược 100%). Thêm custom Tailwind selectors định dạng list (`[&_ul]:list-disc`, `[&_ol]:list-decimal`, ...). |
| [itinerary-accordion.tsx](file:///d:/Remote/web-travel/src/modules/ProductPage/components/itinerary-accordion.tsx) | Thay thế thẻ `<p>` bao bọc `step.description` sang thẻ `<div>` để tương thích chuẩn ngữ nghĩa HTML. Sử dụng `dangerouslySetInnerHTML` để parse rich text.                                                                                                                                                         |
| [product-header.tsx](file:///d:/Remote/web-travel/src/modules/ProductPage/components/product-header.tsx)           | Thay thế thẻ `<p>` bao bọc `shortDescription` sang thẻ `<div>` sử dụng `dangerouslySetInnerHTML` giúp hỗ trợ fallback hiển thị HTML từ trường mô tả chi tiết một cách tối ưu.                                                                                                                                     |

---

## 4. Dependencies & Conflicts ← PHẦN BẮT BUỘC

- **Depends on:** Không có.
- **Modifies:** `IncludedSection`, `ItineraryAccordion`, `ProductHeader`.
- **Must NOT break:**
  - Tính năng hiển thị danh sách dạng văn bản cũ (legacy plain-text array) của trường `Included` / `Not included`.
  - Hiển thị font chữ serif in nghiêng đặc trưng của phần mô tả ngắn trong Header.
- **Conflicts with:** Không có.

---

## 5. Out of scope

- Cài đặt thêm các thư viện phân tích cú pháp HTML bên thứ ba (như `html-react-parser` hay `DOMPurify` trên Client) do không cần thiết và dữ liệu đã được xác thực phía Admin an toàn.
- Thay đổi cấu trúc cơ sở dữ liệu hoặc API.
