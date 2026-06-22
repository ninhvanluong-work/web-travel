# BMAD Spec: Guide Profile Page - Moment Addition Bug

## Background

Trong trang hồ sơ Hướng dẫn viên (Guide Profile Page), người dùng (HDV) có thể quản lý các video ngắn (Moments). Giao diện gồm `MomentsGrid` để hiển thị, và `ManageMomentsSheet` cùng `AddMomentSheet` để thêm/sửa/xóa video.

## Motivation (Vấn đề)

Theo báo cáo lỗi: "Thêm thành công moment -> chọn X để đóng -> về lại trang cũ không hiện video đã thêm. Số lượng moment không đổi."
Tức là sau khi upload và lưu video thành công, UI không tự động cập nhật danh sách video và tổng số moment ở ngoài trang chính (`MomentsGrid`).

## Analysis (Phân tích nguyên nhân)

1. Trong `AddMomentSheet` (file `manage-moments-add-sheet.tsx`), sau khi gọi API `createTourGuideMoment` thành công, code gọi `queryClient.invalidateQueries()` ngay lập tức để làm mới data.
2. Có thể Backend có độ trễ trong việc đồng bộ hoặc index dữ liệu mới (ví dụ dùng Elasticsearch hoặc Read Replica). Do đó, lượt gọi API `getTourGuideMoments` do `invalidateQueries` kích hoạt lập tức trả về **dữ liệu cũ** (chưa có video vừa thêm).
3. React Query lưu cache dữ liệu cũ này và đánh dấu `staleTime` = 2 phút.
4. Khi người dùng đóng `ManageMomentsSheet` (bấm X), sự kiện `onClose` kích hoạt lại việc `invalidateQueries` thêm một lần nữa. Tuy nhiên, nếu thao tác đóng diễn ra quá nhanh, Backend vẫn chưa kịp đồng bộ, lại trả về dữ liệu cũ.
5. Hậu quả: cache của React Query luôn bị ghi đè bằng dữ liệu cũ, khiến `MomentsGrid` bên ngoài không render video mới và `totalMoments` không tăng.

## Design / Implementation Plan (Kế hoạch sửa chữa)

Để giải quyết vấn đề trễ dữ liệu từ server, ta cần **Cập nhật cache thủ công (Optimistic / Pessimistic Cache Update)** ngay sau khi API thêm/sửa/xóa thành công.

### 1. Cập nhật Cache khi Add (Thêm mới)

Sửa hàm `doSave` trong `manage-moments-add-sheet.tsx`:

- Sau khi gọi `createTourGuideMoment` thành công, backend trả về đối tượng `ApiTourGuideMoment` vừa tạo.
- Dùng `queryClient.setQueriesData` để tự động chèn moment mới này vào đầu mảng `items` của cache `useTourGuideMoments` và `useTourGuideMomentsInfinite`.
- Tăng giá trị `pagination.total` lên 1.
- Xóa các lệnh `await queryClient.invalidateQueries` nếu cần, hoặc cứ giữ lại nhưng sự hiện diện của cache cập nhật thủ công sẽ hiển thị ngay cho người dùng.

### 2. Cập nhật Cache khi Delete (Xóa)

Trong `manage-moments-sheet.tsx` (hàm `handleDelete` và quá trình commit delete):

- Khi xóa, cập nhật cache loại bỏ `momentId` khỏi mảng `items` và giảm `pagination.total` đi 1 để UI đồng nhất.

### 3. File sẽ thay đổi

- `src/modules/GuideProfilePage/components/manage-moments-add-sheet.tsx`: Cập nhật logic `doSave` với `setQueriesData`.
- `src/modules/GuideProfilePage/components/manage-moments-sheet.tsx`: Tối ưu invalidate.
