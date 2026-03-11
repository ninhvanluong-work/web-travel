# Phân Tích & Thảo Luận: Video Slug Store (spec-video-slug-store.md)

Dựa trên đề xuất quản lý state video khi di chuyển từ trang Search sang trang Detail bằng `Zustand` (chỉ lưu memory/session, không persist cache API), phương án này giải quyết tốt requirement cốt lõi "giữ đúng thứ tự video đang lướt". Tuy nhiên, có những edge-cases (trường hợp biên) mà chúng ta cần bổ sung giải pháp thiết kế trước khi implement thực tế.

## 1. Vấn đề mất Context Tìm Kiếm (Infinite Scroll Context Loss) - Nghiêm Trọng Nhất

| Current Flow / Spec                                                                                                                                                                             | Vấn Đề Xảy Ra                                                                                                                                                                                                                                                                     |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ở Search: fetch API với `query="Hà Nội"`, được 20 videos -> Save to Store. <br/> Ở Detail: Render list này. Khi user lướt tới video thứ 18, Detail Page gọi API để fetch những video tiếp theo. | Hiện tại, hooks fetch của `VideoDetailPage` chưa biết `query="Hà Nội"`. Nên nó sẽ gọi `useInfiniteListVideo({ variables: {} })`. API trả về danh sách feed tổng hợp (random/trend) thay vì video về Hà Nội. User đang xem cảnh núi rừng tự nhiên bị văng ra clip không liên quan. |

👉 **Hướng Giải Quyết (Đề Xuất):**
Store không chỉ lưu danh sách video, mà phải đóng gói luôn cả "Context của trang trước" vào đó:

```ts
interface IVideoListStore {
  // Thay vì chỉ: videos: IVideo[]
  feedContext: {
    videos: IVideo[];
    source: 'SEARCH' | 'HOME' | 'USER_PROFILE';
    variables: Record<string, any>; // VD: { query: 'Hà Nội' }
  } | null;
  setFeedContext: (...) => void;
}
```

Khi qua `VideoDetailPage`, pass cái `variables` này ngược vào hook `useInfiniteListVideo`.

## 2. Vấn đề đồng bộ ngược (Sync-back) khi User bấm nut Back

| Current Flow / Spec                                                                                                                                                                                               | Vấn Đề Xảy Ra                                                                                                                                                                                                            |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User tìm `Hà Nội` -> load Page 1 (20 videos). User vào Detail, lướt tiếp mượt mà tới video thứ 45 (tức là đã fetch thêm Page 2, Page 3 trong màn hình Detail). <br/> User bấm **nút Back** về lại danh sách grid. | `DetailSearchPage` lấy data từ `react-query` cache (chỉ đang có 20 videos của Page 1). Vị trí scroll có thể bị mất hoặc giật. Những video Page 2, Page 3 biến mất trên grid cho đến khi user cuộn lại để kích API fetch. |

👉 **Hướng Giải Quyết (Thảo luận):**

1. Chấp nhận trải nghiệm này (giống TikTok, bấm back thì mảng Search Grid vẫn giữ nguyên trước khi click, không update mới theo trạng thái Detail của user).
2. Lưu list từ Detail về ngược lại Cache Query hoặc lấy Source of Truth (sự thật duy nhất) từ Store thay vì phụ thuộc 100% Query tại trang grid. (Cách 1 thường dễ làm và phổ biến hơn).

## 3. Khả năng phát sinh Duplicate Slug (Trùng lặp Slug)

| Current Flow / Spec                                           | Vấn Đề Xảy Ra                                                                                                                                                                              |
| :------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialIndex = store.videos.findIndex(v => v.slug === slug)` | Nếu Backend sinh slug chỉ dựa vào Title (VD có 2 video đều tên là "Du lịch Tây Bắc", ra cùng slug `du-lich-tay-bac`), hàm findIndex() sẽ luôn jump về video CŨ NHẤT trong list có slug đó. |

👉 **Hướng Giải Quyết:**
Cần confirm chốt hạ với Backend: URL `slug` phải mang tính định danh duy nhất (Unique), ví dụ: Gắn UUID mờ hoặc mã hash vào sau. (Trong docs của bạn mình thấy có sample `du-lich-mien-nam-can-tho-9b08`, đó là thiết kế đúng).

## 4. Xử lý logic chia sẻ nhiều Video bằng URL (param `ids` hiện tại)

Ở `src/modules/VideoDetailPage/index.tsx`, đang có đoạn code hỗ trợ params `ids` (e.g. `[id].tsx?ids=A,B,C`).
Nếu chuyến sang `slug`, tính năng này bỏ hay cập nhật thành `slugs=...`? Hoặc Backend có endpoint GET nhiều slug 1 lúc không? Cần check lại xem app có thực sự cần features support mảng ids/slugs trên URL params này hay có thể dỡ bỏ để logic clean hơn.

## 5. Trải nghiệm Lướt khi vào bằng Direct Link / Refresh Page

| Current Flow / Spec                                                                                        | Vấn Đề Xảy Ra                                                                                                                                                            |
| :--------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vào URL `/video/ha-noi-x123`. Store rỗng. Trigger gọi `api.getVideoBySlug()`. Hiển thị thành công 1 video. | Màn hình Detail bản chất là 1 **Feed Slider** (Infinite scroll up/down). Nếu user nhận link, xem video xong vuốt xuống... feed lấy data từ đâu để phục vụ việc vuốt này? |

👉 **Hướng Giải Quyết:**

1. Fetch 1 video (theo ID/slug direct).
2. Parallel chạy 1 API fetch danh sách Feed chung (hoặc related feed) để nhồi vào dưới list cho user "có cái lướt tiếp".
   => Cần Backend hỗ trợ API: `GET /video/{slug}/related` (để lướt cùng chủ đề) hoặc cứ load random qua `GET /video/`.

---

Bạn muốn chốt phương án nào cho mục **(1)** và **(5)** trước? Đây là hai mục tác động trực tiếp lên việc viết API client & Router.
