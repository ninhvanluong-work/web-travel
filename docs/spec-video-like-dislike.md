# Spec: Chức năng Like/Dislike Video (video-slide.tsx)

## Mục tiêu

- Tích hợp API `POST /video/{id}/like` và `POST /video/{id}/dislike`.
- Cập nhật giao diện mượt mà (Optimistic UI Update): tăng/giảm số lượng like ngay lập tức khi user bấm, không cần chờ API phản hồi để tránh độ trễ (latency).
- Xử lý Debounce/Throttling: Tránh việc user bấm liên tục spam API gọi lên server.

---

## 1. API Endpoints

Dựa theo tài liệu Swagger/API cung cấp:

### Like Video

- **Endpoint:** `POST https://web-travel-be.fly.dev/video/{id}/like`
- **Response (200 OK):**

```json
{
  "data": null,
  "code": 200,
  "message": "ok",
  "error": null
}
```

### Dislike Video (Bỏ Like)

- **Endpoint:** `POST https://web-travel-be.fly.dev/video/{id}/dislike`
- **Response (200 OK):**

```json
{
  "data": null,
  "code": 200,
  "message": "ok",
  "error": null
}
```

---

## 2. Model & States hiện tại

Ở `src/modules/VideoDetailPage/components/video-slide.tsx`, ta đang có:

```tsx
const [liked, setLiked] = useState(false); // Cần giá trị initial từ Backend (nếu có)
const [likeCount, setLikeCount] = useState(video.likeCount);
```

**Xử lý trạng thái `isLiked` cho App không có Login (Ẩn danh)**

Vì app của bạn **không có tính năng đăng nhập**, Backend sẽ không biết ai là người đang xem video để trả về trạng thái `isLiked` chính xác. Do đó, việc phụ thuộc vào Backend cho biến này là **không cần thiết và không khả thi** (trừ khi BE track theo IP/Device ID - việc này hơi phức tạp).

**Giải pháp chốt: Sử dụng `localStorage` ở Frontend**

Frontend sẽ tự "nhớ" những video người dùng đã like bằng trình duyệt của họ.

1. **Khi xem video (Load):** FE sẽ kiểm tra ID của video hiện tại có nằm trong mảng `likedVideoIds` lưu ở `localStorage` hay không. Nếu có -> Hiển thị trái tim đỏ (`isLiked = true`).
2. **Khi bấm Like:**
   - FE đẩy ID video đó vào mảng trong `localStorage`.
   - Cập nhật UI (trái tim đỏ, `likeCount + 1`).
   - Gọi API `POST /like`.
3. **Khi bấm Dislike:**
   - FE xoá ID video đó khỏi mảng `localStorage`.
   - Cập nhật UI (trái tim trắng, `likeCount - 1`).
   - Gọi API `POST /dislike`.

👉 **Ưu điểm:** Dễ làm, không phiền Backend. Code hoàn toàn nằm ở Frontend.
👉 **Nhược điểm:** Mở tab ẩn danh (incognito), đổi trình duyệt, phân vùng lại bộ nhớ... thì danh sách "đã like" sẽ bị biến mất. Nhưng với app không có tính năng tạo tài khoản thì điều này là **hoàn toàn chấp nhận được**.

---

### Hiển thị số lượng Like (Formatting)

Hiện tại trong file `video-slide.tsx`, số lượng like đang được format qua hàm `formatCount`:

```tsx
function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}
```

Tuy nhiên, theo yêu cầu mới, **chúng ta sẽ hiển thị đầy đủ con số nguyên gốc** (ví dụ: `1500` thay vì `1.5K`) và bỏ việc dùng hậu tố "K" đi. Có thể dùng hàm `toLocaleString()` (ví dụ: `1,500`) để định dạng có dấu phẩy phân cách hàng nghìn cho đẹp nếu số quá lớn, hoặc chỉ đơn giản là in số nguyên gốc ra.

---

## 3. Flow xử lý (Optimistic UI + Debounce)

Vì nút Like thường xuyên bị click liên tục (spam), ta sẽ áp dụng pattern **Optimistic Update** kết hợp với **Debounce hook/timer**.

### Kịch bản (Scenario):

1. **User click "Like" (khi đang chưa like):**
   - UI lập tức đổi icon sang màu xanh, `likeCount + 1`.
   - Bắt đầu bộ đếm (timeout) chờ gửi API. Nếu trong 500ms user không đổi ý, gọi API `POST /like`.
2. **User spam click (Like -> Dislike -> Like -> Dislike):**
   - UI vẫn lật màu xanh/trắng liên tục. `likeCount` nhấp nháy +1 / -1.
   - Hàm gọi API bị delay (debounce/throttle), tự triệt tiêu nhau. Chỉ gửi trạng thái **cuối cùng** lên server sau khi spam xong (vd: sau 500ms kể từ cú click cuối).
3. **Lỗi API gọi thất bại:**
   - Nếu gọi API `POST /like` mà server báo lỗi 500.
   - Rollback UI: Đổi lại icon trắng, `likeCount - 1`. Hiển thị Toast bá lỗi (nếu cần).

---

## 4. Các File Cần Thay Đổi

### A. `src/api/video/requests.ts`

Thêm 2 hàm gọi API:

```typescript
export const likeVideo = async (id: string) => {
  return request.post(`/video/${id}/like`);
};

export const dislikeVideo = async (id: string) => {
  return request.post(`/video/${id}/dislike`);
};
```

### B. `src/api/video/mutations.ts` (Tạo mới nếu chưa có)

Sử dụng `useMutation` của `@tanstack/react-query` để quản lý loading/error state (nếu dùng react-query). Hoặc có thể gọi API chay bằng fetch/axios thông thường.

### C. `src/modules/VideoDetailPage/components/video-slide.tsx`

Cập nhật logic `toggleLike`:

```tsx
import { useDebouncedCallback } from 'use-debounce'; // (Hoặc useRef chứa timeout tự viết)
// ...

const VideoSlide = ({ video, ... }: Props) => {
  // Giả định backend chưa làm field isLiked, tạm lấy false mặc định
  const [liked, setLiked] = useState(video.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(video.likeCount);

  // Ref để theo dõi state thực tế trên Server (để khỏi gọi API thừa)
  const serverLikedRef = useRef(video.isLiked ?? false);

  // Hàm debounce gọi API thực tế (Delay 500ms)
  const syncLikeWithServer = useDebouncedCallback(async (targetLikedState: boolean) => {
    // Nếu state cuối cùng giống state trên server -> Không cần API.
    if (targetLikedState === serverLikedRef.current) return;

    try {
      if (targetLikedState) {
        await likeVideo(video.id);
      } else {
        await dislikeVideo(video.id);
      }
      // Gọi thành công -> match state server với local
      serverLikedRef.current = targetLikedState;
    } catch (error) {
      // Rollback nếu lỗi
      setLiked(serverLikedRef.current);
      setLikeCount(serverLikedRef.current ? video.likeCount + 1 : video.likeCount);
      console.error('Lỗi khi like/dislike', error);
      // alert or toast error...
    }
  }, 500);

  const toggleLike = () => {
    const newLikedState = !liked;

    // 1. Optimistic Update (Cập nhật UI ngay lập tức)
    setLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    setLikeAnimKey(k => k + 1);

    // 2. Gọi hàm sync (đã được debounce)
    syncLikeWithServer(newLikedState);
  };

  // ... rest of the code
}
```

---

## 5. Thảo luận cùng bạn

Bạn xem qua flow mình đề xuất nhé! Có một vài điểm mình muốn hỏi lại dự án của bạn:

1. Dự án của bạn đang dùng Axios hay Fetch chay ở thư mục `requests.ts`?
2. Ứng dụng có bắt đăng nhập tài khoản để "Like" không, hay là Like ẩn danh (thiết bị)? Nếu ẩn danh, bạn có cần lưu mảng các video ID đã Like vào `localStorage` không? (Vì nếu f5 lại trang, Backend không trả về `isLiked = true`, thì tất cả video sẽ đỏ về trạng thái "chưa like" hết).
3. Dự án đã cài thư viện lodash hoặc `use-debounce` để dùng cho chức năng chống spam click (debounce) như code minh họa chưa?
