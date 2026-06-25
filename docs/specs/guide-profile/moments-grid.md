---
title: 'Khoảnh khắc Tour Guide (Moments Grid & Video Popup)'
created: '2026-06-11'
status: 'draft'
domain: 'guide-profile'
---

# Spec: Khoảnh khắc Tour Guide (Moments Grid & Video Popup)

## 1. Vấn đề / Mục tiêu

Hiện tại trên trang cá nhân của Tour Guide (`GuideProfilePage`), mục **"Khoảnh khắc từ tour"** hiển thị danh sách 4 video mẫu sử dụng ảnh nền gradient tĩnh và dữ liệu mock. Khi người dùng click vào một clip, hệ thống thực hiện chuyển hướng (`router.push`) sang trang chi tiết video.

**Vấn đề:**

- Dữ liệu chưa được tích hợp API thật (`GET /tour-guide/{id}/moment`).
- Việc chuyển hướng trang (navigate) làm gián đoạn trải nghiệm của người dùng khi họ chỉ muốn xem nhanh các khoảnh khắc ngắn (moments) của hướng dẫn viên rồi tiếp tục xem thông tin cá nhân của họ.
- Ảnh nền gradient tĩnh trông đơn điệu, không phản ánh đúng nội dung thực tế của clip tour.

**Mục tiêu:**

- Tích hợp API thật lấy danh sách moment của Tour Guide.
- Cải tiến giao diện hiển thị 4 clip mặc định mượt mà, chân thực.
- Thiết kế Popup (Modal) phát video tại chỗ không chuyển hướng trang, tối ưu hóa trải nghiệm xem liên tục.

---

## 2. Brainstorming theo BMAD Framework

Để tìm kiếm giải pháp thiết kế tối ưu nhất (WOW trải nghiệm người dùng), chúng ta áp dụng quy trình brainstorm của BMAD Method:

### Phase 1: Divergent Thinking (Kịch bản "Nếu như...")

- **Nếu như** chúng ta giữ nguyên việc chuyển hướng trang?
  - _Đánh giá:_ User sẽ mất ngữ cảnh trang cá nhân của Tour Guide, thời gian tải trang mới lâu hơn, gây cảm giác nặng nề.
- **Nếu như** chúng ta sử dụng một Popup phát video sử dụng `BunnyVideoPlayer` (HLS native)?
  - _Đánh giá:_ Phù hợp cho danh sách feed lướt nhanh, nhưng tăng độ phức tạp do cần quản lý vòng đời HLS, pool video của iOS và có thể gây xung đột âm thanh với các thành phần khác.
- **Nếu như** chúng ta sử dụng một Popup phát video qua `iframe` nhúng (embedUrl) giống hệt mục Đánh giá khách (`featured-reviews.tsx`)?
  - _Đánh giá:_ **Phương án tối ưu nhất**. Đồng nhất trải nghiệm và pattern code đã có trong cùng một module, hoạt động cực kỳ ổn định, tự động tương thích với mọi thiết bị mà không cần quản lý pool video phức tạp.

### Phase 2: SCAMPER (Tinh chỉnh ý tưởng)

- **S (Substitute - Thay thế)**: Thay thế ảnh nền gradient tĩnh bằng ảnh `thumbnail` của video từ CDN. Phủ một lớp màu gradient mờ tối từ dưới lên để đảm bảo text tiêu đề màu trắng hiển thị sắc nét.
- **C (Combine - Kết hợp)**: Kết hợp `Dialog` component (Radix UI) và thẻ `iframe` với `src={embedUrl}` để nhúng trực tiếp trình phát chính thức từ Bunny CDN.
- **M (Modify - Cải tiến tương tác)**: Khi click vào card, hiển thị popup chứa duy nhất iframe của video được chọn phát ở chế độ toàn màn hình hoặc dọc tương ứng, dừng ngay khi tắt popup.

### Phase 3: Solution Matrix (Ma trận giải pháp)

| Tiêu chí                     | Phương án A (Dùng BunnyVideoPlayer)           | Phương án B (Dùng iframe nhúng - ĐƯỢC CHỌN)                      |
| :--------------------------- | :-------------------------------------------- | :--------------------------------------------------------------- |
| **Độ trễ trải nghiệm**       | Thấp                                          | Thấp                                                             |
| **Độ phức tạp code**         | Cao (Cần config ref, HLS.js, loop, play gate) | **Cực kỳ thấp** (Chỉ cần truyền src vào iframe)                  |
| **Sự ổn định (iOS/Android)** | Phụ thuộc vào setup shared video pool         | **100% ổn định** (Do trình duyệt và Bunny CDN tối ưu sẵn)        |
| **Độ đồng nhất dự án**       | Thấp hơn                                      | **Tuyệt đối** (Trùng khớp với thiết kế xem video tại mục Review) |

---

## 3. Hành vi mong muốn (User Story & Interaction Spec)

### A. Trạng thái hiển thị danh sách (Grid 4 clips mặc định)

1. Mặc định hiển thị lưới 2 cột (2x2) chứa tối đa 4 video clips đầu tiên từ API.
2. Mỗi thẻ clip hiển thị ảnh thumbnail thực tế làm hình nền. Khi hover chuột/chạm tay, ảnh thumbnail phóng to nhẹ (`scale-105` với transition 300ms).
3. Một nút Play bán trong suốt nằm giữa card. Khi hover, nút play scale rộng ra.
4. Tiêu đề clip viết nghiêng, chữ trắng nằm ở góc dưới card kèm thời lượng được format dạng `phút:giây` (ví dụ: `1:08`).
5. Nếu guide có nhiều hơn 4 clips, hiển thị nút ghost button: **"Xem tất cả khoảnh khắc"**. Khi click, **nổi lên 1 popup (Dialog/Sheet) hiển thị danh sách dạng lưới cuộn chứa tất cả khoảnh khắc**.

### B. Trạng thái Popup Xem tất cả (Bottom Sheet & Infinite Scroll Grid)

1. Khi click "Xem tất cả", một Bottom Sheet (sử dụng component `Sheet` từ `@/components/ui/sheet` với `side="bottom"`) kéo từ dưới lên chiếm khoảng `80dvh` (80% chiều cao màn hình di động).
2. Bên trong Bottom Sheet chứa một khu vực cuộn dọc hiển thị lưới video 2 cột.
3. Sử dụng **kiến trúc Phân trang kết hợp Infinite Scroll**:
   - Khi người dùng cuộn (scroll) lưới xuống đáy Sheet, hệ thống tự động phát hiện bằng `IntersectionObserver` (Sentinel) và kích hoạt cuộc gọi API tải trang tiếp theo (`page = page + 1`, `pageSize = 10`).
   - Hiển thị loading spinner/skeleton nhỏ ở chân danh sách khi đang fetch dữ liệu mới.
4. Khi click vào bất kỳ thẻ video nào trong lưới của Bottom Sheet này, hệ thống sẽ mở tiếp **Popup phát video** tương ứng.

### C. Trạng thái Popup phát video (Modal View)

1. Khi click vào thẻ clip bất kỳ ở Grid mặc định hoặc ở Bottom Sheet Xem tất cả, một popup phát video nổi lên đè lên trên (`backdrop-blur-md bg-black/75`).
2. Trình phát video qua thẻ `iframe` tự động load và phát video.
3. Popup **chỉ hiển thị và phát duy nhất video đã được ấn** dưới dạng khung dọc tỉ lệ `aspect-[9/16]` hoặc tỉ lệ phù hợp của Bunny Player.
4. Click ra ngoài vùng video hoặc bấm nút đóng (X) ở góc trên bên phải sẽ đóng popup phát video và hủy thẻ `iframe` để dừng phát video lập tức (không ảnh hưởng đến trạng thái của Bottom Sheet Xem tất cả ở dưới).

---

## 4. Thay đổi kỹ thuật

### A. API Endpoint Tích hợp

- **Endpoint**: `GET /tour-guide/{id}/moment`
- **Query Params**: `page=X`, `pageSize=10`
- **Response Mapping**:
  - `description` → `title` (nếu description rỗng, dùng `name`).
  - `thumbnail` → ảnh nền hiển thị trên grid.
  - `duration` (giây) → định dạng sang `mm:ss` (ví dụ: `82` giây → `1:22`).
  - `embedUrl` → truyền vào `iframe` để phát.

### B. Chi tiết các files thay đổi

| File                                                       | Thay đổi chính                                                                                                                                                                                                                                                                                                                                                                                                                                |
| :--------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/api/tour-guide/types.ts`                              | Thêm định nghĩa raw API types (`ApiTourGuideMoment`, `ApiTourGuideMomentsResponse`) và mapped types (`ITourGuideMoment`, `ITourGuideMomentsResult`).                                                                                                                                                                                                                                                                                          |
| `src/api/tour-guide/requests.ts`                           | Viết hàm `getTourGuideMoments` thực hiện gọi API và hàm mapper `toTourGuideMoment` để format thời lượng video.                                                                                                                                                                                                                                                                                                                                |
| `src/api/tour-guide/queries.ts`                            | - Tạo react-query hook `useTourGuideMoments` cho 4 clips trang đầu. <br>- Tạo react-query infinite hook `useTourGuideMomentsInfinite` với `getNextPageParam` để quản lý phân trang và tải thêm khi cuộn.                                                                                                                                                                                                                                      |
| `src/modules/GuideProfilePage/index.tsx`                   | Cập nhật component để truyền `guideId={data.id}` thay vì truyền mảng moments tĩnh.                                                                                                                                                                                                                                                                                                                                                            |
| `src/modules/GuideProfilePage/components/moments-grid.tsx` | - Gọi `useTourGuideMoments` cho lưới 4 video chính. <br>- Tích hợp `<Sheet>` (side="bottom") cho popup "Xem tất cả", sử dụng `useTourGuideMomentsInfinite` và `IntersectionObserver` để thực hiện Infinite Scroll phân trang. <br>- Tích hợp tiếp `<Dialog>` thứ hai chứa `iframe` phát duy nhất video được chọn, tương tự [featured-reviews.tsx](file:///d:/Remote/web-travel/src/modules/GuideProfilePage/components/featured-reviews.tsx). |

---

## 5. Dependencies & Conflicts

- **Modifies**: [MomentsGrid](file:///d:/Remote/web-travel/src/modules/GuideProfilePage/components/moments-grid.tsx) và [GuideProfilePage](file:///d:/Remote/web-travel/src/modules/GuideProfilePage/index.tsx).
- **Must NOT break**: Phần phát video của Đánh giá khách (`featured-reviews.tsx`).
- **Conflicts with**: Không có.

---

## 6. Out of scope

- Tính năng tương tác trực tiếp (Like, bình luận) ngay trên popup moments.
- Chuyển slide liên tiếp (Next/Prev) hay các thao tác cử chỉ chuyển video (Swipe) trong popup trình phát.
- Upload video moment mới ngay tại trang cá nhân.

---

## 7. Open questions

> [!NOTE] > _Đã giải quyết_: Sử dụng **Bottom Sheet** (`Sheet` side="bottom") cho phần hiển thị danh sách "Xem tất cả" để tối ưu hóa trải nghiệm mobile-first của web-travel. Không cần thiết kế responsive desktop phức tạp vì ứng dụng được định dạng khung di động cố định.

1. **Giới hạn số lượng clip tải mỗi trang**: Có nên giữ kích thước trang `pageSize = 10` cho mỗi lần tải thêm trong Bottom Sheet không? (Đề xuất: Có, đây là con số hợp lý vừa đủ nhanh vừa không gây quá tải mạng).
