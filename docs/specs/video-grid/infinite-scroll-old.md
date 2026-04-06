---
title: 'Infinite Scroll cho VideoGrid (cũ)'
created: '2026-02-28'
status: 'superseded'
domain: 'video-grid'
superseded_by: 'infinite-scroll.md'
---

> ⚠️ **SUPERSEDED** — Xem [`infinite-scroll.md`](./infinite-scroll.md) (cursor-based approach hiện tại).

# Specification: Infinite Scroll cho VideoGrid (DetailSearchPage)

## 1. Vấn đề hiện tại

- **Mô tả**: Trang đang tự động gọi liên tiếp API tải thêm video ngay từ lúc mới load, thay vì chờ người dùng cuộn xuống.
- **Nguyên nhân kỹ thuật**:
  - API hiện tại trả về khoảng `pageSize = 6` (tối đa 6 items).
  - Component `VideoGrid` sử dụng `grid-cols-2`, tức là 6 video tương đương 3 hàng.
  - Cấu hình bắt điểm cuộn (sentinel) là: `PREFETCH_OFFSET = 3`. Tức là phần tử chịu trách nhiệm kích hoạt API tịnh tiến về vị trí `length - 3`. Với mảng 6 phần tử, điểm kích hoạt nằm ở index `3` (tức là Video thứ 4).
  - Index 3 nằm ở dòng thứ 2. Trên màn hình di động cỡ lớn hoặc máy tính, hàng video thứ 2 thường đã lộ một phần ra màn hình ngay khi vừa load.
  - Hook `useInView(..., { threshold: 0.1 })` làm cho API gọi load thêm `fetchNextPage` ngay từ khi dòng 2 chạm nhẹ vào viewport, tạo chuỗi rớt frame gọi liên tiếp cho đến khi lấp đầy.

## 2. Mục tiêu mong muốn

- **Initial Load**: Khi mới vào trang chỉ fetch 1 cụm số liệu gốc.
- **Lazy Load**: Chỉ khi người dùng thực sự kéo xuống đáy trang (hoặc gần đáy video thứ 3, 4) thì mới gọi tiếp một trang (page) mới.
- Hàng đợi (Prefetch) phù hợp, không làm khựng UX nhưng tránh gọi thừa.

## 3. Các phương án giải quyết (Brainstorming Options)

### 🚀 Phương án 1: Điều chỉnh vị trí Sentinel (Khuyến nghị)

Thay đổi `PREFETCH_OFFSET` xuống giá trị nhỏ hơn `2` hoặc `1` để chỉ kích hoạt khi thanh cuộn chạm đến 2 video cuối cùng.

- **Ưu điểm**: Sửa lỗi nhanh, thay đổi đúng 1 hằng số ở Front-end.
- **Rủi ro**: Nếu API BE quá chậm, người dùng chạm đáy có thể trải nghiệm cảm giác "đang tải" rõ rệt hơn so với việc gọi sớm.

### 🚀 Phương án 2: Tăng PageSize ở BE / Query

Thay vì lấy `6` video mỗi lần, ta yêu cầu API (hoặc sửa fix cứng mặc định ở BE) trả về `10` đến `12` video.

- **Ưu điểm**: 12 video tương đương 6 hàng. Khi gán sentinel ở `offset = 3`, nó sẽ rơi vào dòng số 5, lúc ban đầu chắc chắn không nằm trong viewport màn hình, loại bỏ hiện tượng tự fire sự kiện tải.
- **Rủi ro**: Băng thông load ban đầu nặng hơn một chút xíu.

### 🚀 Phương án 3: Thêm điều kiện (Heuristic Guard) kết hợp `rootMargin`

- Đổi cách theo dõi InView bằng cách sử dụng `rootMargin: '100px'` thay vì `threshold: 0.1`. Điều này có nghĩa là khi điểm sentinel cách cạnh dưới của màn hình `100px` thì mới kích hoạt (hoặc tuỳ chỉnh pixel bù trừ màn hình).
- Có thể gắn thêm điều kiện để tránh việc tự động kích hoạt call API trước khi người dùng phát sinh hành động cuộn thư viện.

---

**Nhận xét**: Trong phần lớn trường hợp thực tế, người ta kết hợp **Phương án 1 và Phương án 2** để tạo UX tốt nhất. Tức là kéo dài danh sách trả về từ BE ra (gỡ phễu pageSize lên khoảng 10-12), đồng thời chỉnh `PREFETCH_OFFSET = 2`.
