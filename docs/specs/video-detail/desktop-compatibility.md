---
title: 'Khắc phục lỗi trang trắng và tối ưu tương thích Desktop trên Video Detail'
created: '2026-09-05'
status: 'draft'
domain: 'video-detail'
---

# Spec: Khắc phục lỗi trang trắng & Tối ưu tương thích Desktop trên Video Detail

## 1. Vấn đề / Mục tiêu

> **Hiện trạng**: Khi người dùng truy cập trang web trên **máy tính (Desktop PC)** và click vào bất kỳ video nào (trong `VideoGrid`), màn hình bên trong khung mô phỏng di động bị biến thành **trang trắng (white screen)**. Trên trình duyệt điện thoại (iOS Safari/Android Chrome) thì xem bình thường.
>
> **Mục tiêu**:
>
> 1. Xử lý triệt để hiện tượng trang trắng (white screen / React crash) trên trình duyệt Desktop.
> 2. Ngăn chặn cú click chuột trên PC bị `useSwipeBack` hiểu nhầm là thao tác vuốt lùi (`router.back()`).
> 3. Đảm bảo thư viện `hls.js` chạy ổn định trên Desktop Chrome/Edge/Firefox mà không bị nghẽn CORS hoặc vỡ layout viewport.

---

## 2. Hành vi mong muốn

| Hành động trên PC                            | Kết quả mong đợi                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Click vào bất kỳ video nào trong `VideoGrid` | Chuyển sang `VideoDetailPage` hiển thị đúng giao diện video player trong khung di động, không bị văng sang trang trắng.   |
| Drag chuột nhẹ hoặc nhấp chuột lên video     | Không bị nhầm lẫn thành cử chỉ Swipe Back (`router.back()`). Giao diện giữ nguyên vị trí.                                 |
| Tải video M3U8 trên Desktop Chrome/Edge      | `hls.js` khởi tạo an toàn, nếu xảy ra lỗi mạng/CORS thì hiển thị UI thông báo/poster thay vì sập toàn bộ component React. |
| Hiển thị khung màn hình trên PC              | Khung hình di động căn giữa `max-w-[430px]`, video lấp đầy container `h-full` mà không bị vỡ bố cục `100dvh`.             |

---

## 3. Thay đổi kỹ thuật

| File                                    | Thay đổi                                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/hooks/use-swipe-back.ts`           | Chỉ kích hoạt Swipe Back khi `e.pointerType === 'touch'`. Ngăn chặn thao tác click/drag chuột trên PC kích hoạt `router.back()`.                 |
| `src/modules/VideoDetailPage/index.tsx` | Đổi container `h-dvh` thành `h-full` để tương thích tốt với khung `MainLayout` trên PC. Bổ sung Error Boundary cục bộ để phòng ngừa trắng trang. |
| `src/components/BunnyVideoPlayer.tsx`   | Đảm bảo xử lý lỗi `Hls.Events.ERROR` an toàn (fallback poster/loading UI), không throw exception unhandled gây unmount React component.          |
| `src/hooks/useInview.ts`                | Tối ưu hóa cleanup `IntersectionObserver` và memoize `options` để tránh vòng lặp re-render không cần thiết khi load slide trên PC.               |

---

## 4. Dependencies & Conflicts

- **Depends on:** `video-detail/feed-tiktok.md`
- **Modifies:** `use-swipe-back.ts`, `src/modules/VideoDetailPage/index.tsx`, `src/components/BunnyVideoPlayer.tsx`, `src/hooks/useInview.ts`
- **Must NOT break:** Cử chỉ vuốt lùi trên thiết bị di động (iOS Safari & Android Chrome), khả năng tự động phát video mượt mà trên di động.
- **Conflicts with:** None.

---

## 5. Out of scope

- Thay đổi thiết kế giao diện PC thành dạng responsive đa cột (vẫn giữ khung mô phỏng di động `430px` trên PC).
- Thay đổi hạ tầng server lưu trữ Bunny Video CDN.

---

## 6. Open questions

- **CORS Configuration**: Cần kiểm tra cấu hình CORS Response Header (`Access-Control-Allow-Origin: *`) trên Bunny CDN cho các luồng file `.m3u8` để phát mượt mà trên trình duyệt PC không bị chặn bởi trình duyệt.
