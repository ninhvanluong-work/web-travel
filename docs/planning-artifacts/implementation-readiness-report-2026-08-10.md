---
stepsCompleted:
  [
    step-01-document-discovery,
    step-02-prd-analysis,
    step-03-epic-coverage-validation,
    step-04-ux-alignment,
    step-05-epic-quality-review,
    step-06-final-assessment,
  ]
documentsUsed:
  spec: docs/spec-admin-session-crud-bmad.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-08-10
**Project:** web-travel

## PRD Analysis

### Functional Requirements

| ID   | Requirement                                                                                     |
| ---- | ----------------------------------------------------------------------------------------------- |
| FR1  | Tạo 1 Session cho 1 ngày (travelDate + productId + sessionUnits + status + capacity)            |
| FR2  | Ràng buộc duy nhất (productId, travelDate) — hiển thị lỗi + gợi ý Edit nếu trùng                |
| FR3  | Tạo hàng loạt Session theo khoảng ngày (Range) — bỏ qua ngày đã tồn tại                         |
| FR4  | Session Section ẩn khi tạo mới sản phẩm (isEdit=false), chỉ hiện khi isEdit=true + có productId |
| FR5  | Nút "Manage Sessions" trên ProductTable → mở Side Sheet Drawer (ProductSessionModal)            |
| FR6  | Xem danh sách Session dạng Bảng, bộ lọc fromDate/toDate/status, phân trang chuẩn                |
| FR7  | Chỉnh sửa Session: price/unitId, capacity, status toggle                                        |
| FR8  | Xóa Session (Soft Delete — set deletedAt)                                                       |
| FR9  | /admin/sessions mặc định "Tất cả sản phẩm" — StatCards tổng hệ thống, bảng có cột Product       |
| FR10 | Chọn 1 sản phẩm trong /admin/sessions → filter + kích hoạt tạo nhanh Session                    |
| FR11 | API Layer: 6 endpoints + TypeScript types (types.ts, requests.ts, queries.ts)                   |
| FR12 | sessionUnits = mảng (unitId, price), Units lấy từ Product                                       |

**Tổng FR: 12**

### Non-Functional Requirements

| ID   | Requirement                                                                          |
| ---- | ------------------------------------------------------------------------------------ |
| NFR1 | Data Integrity: ràng buộc duy nhất (productId, travelDate) cả BE + FE                |
| NFR2 | Bulk Operation: giảm 95% thời gian tạo thủ công                                      |
| NFR3 | Optimistic Updates: toggle active/inactive và đổi giá cập nhật 0ms, rollback nếu lỗi |
| NFR4 | Soft Delete: không xóa vật lý, giữ lịch sử booking                                   |
| NFR5 | DRY: SessionManagementCore tái sử dụng ở 3 context                                   |
| NFR6 | Layout: Sheet w-[680px], giữ scroll position Product List khi đóng popup             |
| NFR7 | i18n: mọi text dùng useTranslation(), không hardcode                                 |
| NFR8 | Error UX: dùng AlertBanner, lỗi trùng ngày có CTA "Xem & Chỉnh sửa"                  |
| NFR9 | Date format: gửi YYYY-MM-DD, parse ISO UTC từ API response                           |

**Tổng NFR: 9**

### Constraints & Assumptions

- C1: productId phải tồn tại trước khi tạo Session
- C2: Units của Product phải được fetch trước khi hiển thị form nhập giá
- C3: Xóa Session khi "chưa có booking" — spec không định nghĩa cơ chế check phía FE
- C4: POST /session/range — mâu thuẫn giữa example payload (không có sessionUnits) vs TypeScript DTO (có sessionUnits optional)

## Epic Coverage Validation

### Coverage Matrix

| FR   | Status           | Note                        |
| ---- | ---------------- | --------------------------- |
| FR1  | ✅ Covered       | US1                         |
| FR2  | ✅ Covered       | US1 + Flow 3                |
| FR3  | ✅ Covered       | US2                         |
| FR4  | ⚠️ No User Story | Chỉ trong Phasing Plan      |
| FR5  | ✅ Covered       | US6                         |
| FR6  | ✅ Covered       | US3                         |
| FR7  | ✅ Covered       | US4                         |
| FR8  | ✅ Covered       | US4                         |
| FR9  | ✅ Covered       | US5                         |
| FR10 | ⚠️ No User Story | Chỉ trong Section 4.3 mô tả |
| FR11 | ⚠️ No User Story | Phase 1 task, không phải US |
| FR12 | ✅ Covered       | US1 + US2                   |

### Missing Requirements

- FR4, FR10: Thiếu Acceptance Criteria rõ ràng
- NFR7 (i18n): Không đề cập trong spec
- NFR3 (Optimistic Updates): Scope mơ hồ Phase 1 vs Phase 2
- NFR5 (DRY): Không có Acceptance Criteria binding

### Coverage Statistics

- Total PRD FRs: 12
- FRs covered by User Stories: 9
- FRs without explicit User Story: 3 (FR4, FR10, FR11)
- Coverage: 75% (US-backed), 100% (mentioned somewhere in spec)

## UX Alignment Assessment

### UX Document Status

Không có file UX riêng. UX specs lồng trong Section 4 & 5 của BMAD Spec.

### Critical Alignment Issues

1. **Calendar View mâu thuẫn**: Section 4 Note bỏ Calendar, nhưng Section 4.3.B vẫn nhắc "kích hoạt Calendar View". US3 ngầm hiểu cần visual calendar.
2. **Range Modal + sessionUnits**: US2 yêu cầu nhập giá cho Unit trong Range modal, nhưng Flow 2 + API example không có. DTO có field optional nhưng không rõ BE có xử lý không.
3. **Delete condition (canDelete)**: Không có cơ chế FE check "chưa có booking" trước khi cho phép Delete.
4. **StatCards aggregate**: Không có `/session/stats` endpoint — StatCards tổng hệ thống tính từ đâu?

### Warnings

- ProductSessionModal thiếu trong Component Hierarchy (Section 4.1)
- Optimistic Updates không thuộc Phase 1 hay Phase 2 rõ ràng
- i18n hoàn toàn vắng mặt trong spec

## Epic Quality Review

### Critical Violations (🔴)

1. **CV1 – US3 AC lỗi thời**: AC ngầm yêu cầu Calendar View nhưng Design đã xóa Calendar. AC chưa được cập nhật.
2. **CV2 – API Layer là Technical Epic**: Phase 1 Item 1 không có user value — cần tách thành Technical Setup task.

### Major Issues (🟠)

3. **MJ1 – Tất cả 6 US thiếu BDD format**: Không có Given/When/Then — không testable rõ ràng.
4. **MJ2 – US6 badge count không có API support**: N+1 query problem nếu fetch session count per product.
5. **MJ3 – US4 Delete thiếu error scenarios**: Không định nghĩa hành vi khi đã có booking hoặc network lỗi.
6. **MJ4 – US2 Range thiếu validation + edge cases**: fromDate>toDate, range quá lớn, kết quả 0 sessions.

### Minor Concerns (🟡)

7. **MC1 – StatCards khoảng thời gian mặc định không rõ**
8. **MC2 – Không có story về empty states**
9. **MC3 – Dependency Units chưa được khai báo**

## Summary and Recommendations

### Overall Readiness Status

🟠 NEEDS WORK — CẦN GIẢI QUYẾT TRƯỚC KHI IMPLEMENT

### Critical Issues Requiring Immediate Action

1. Calendar View mâu thuẫn: Section 4 Note xóa Calendar nhưng Section 4.3.B vẫn đề cập, US3 AC chưa cập nhật
2. POST /session/range + sessionUnits: US2 yêu cầu nhập giá Unit nhưng API example không có field này
3. i18n hoàn toàn thiếu trong spec (project rule bắt buộc useTranslation cho mọi text)

### Recommended Next Steps

1. Test thực tế POST /session/range trên Swagger — xác nhận sessionUnits có được support không
2. Ra quyết định dứt khoát: Table Only hay Calendar khi chọn Product?
3. Xác nhận StatCards aggregate nguồn dữ liệu (cần BE endpoint stats hay client-side?)
4. Thêm i18n namespace và key list vào spec trước khi code component
5. Clarify Delete guard: BE trả lỗi gì khi Session đã có booking?
6. Bắt đầu implement ngay: API Layer (FR11) + US1 + US4 — không bị blocking

### Final Note

Tổng vấn đề: 15 issues (3 Critical, 4 Major, 3 Minor, 5 Structural warnings).
Phạm vi an toàn implement ngay: FR1, FR2, FR4, FR7, FR8, FR11, FR12.
Phạm vi cần làm rõ trước: FR3 (sessionUnits), FR5 (badge count), FR6 (Calendar), FR9-FR10 (StatCards).
