# Spec: Single Active Audio Source — DetailSearchPage

## Vấn đề

Hiện tại mỗi `VideoCard` tự quản lý state `muted` riêng lẻ. Người dùng có thể bật âm thanh trên nhiều video cùng lúc, gây ra trải nghiệm tệ (nhiều âm thanh chồng lên nhau).

## Quy tắc nghiệp vụ

| #   | Hành động                                    | Kết quả                                                       |
| --- | -------------------------------------------- | ------------------------------------------------------------- |
| 1   | Trang load                                   | Tất cả video **muted**                                        |
| 2   | User ấn 🔊 trên video X                      | Video X **unmute**, tất cả video còn lại **mute**             |
| 3   | User ấn 🔊 trên video X (đang phát)          | Video X **mute** lại, không video nào có âm thanh             |
| 4   | Video X scroll ra ngoài màn hình             | Video X **pause** + **mute**, `activeAudioId` reset về `null` |
| 5   | Video X scroll ra ngoài khi đang có âm thanh | Video khác **không tự unmute** — user phải chủ động ấn        |

> **Invariant**: Tại mọi thời điểm, tối đa 1 video có âm thanh.

## Luồng tương tác

```
User ấn loa video X
  ├── X đang muted   → activeAudioId = X   → X unmute, các video khác mute
  └── X đang unmuted → activeAudioId = null → X mute
```

```
Video X scroll out of view (isInView = false)
  └── Nếu activeAudioId === X → activeAudioId = null → X mute
```

## Thiết kế kỹ thuật

### Phương án: Lift state lên `VideoGrid`

`VideoGrid` giữ 1 state duy nhất `activeAudioId: string | null`, truyền xuống mỗi `VideoCard`.

```
VideoGrid  [activeAudioId: string | null]
  ├── VideoCard  isAudioActive={activeAudioId === video.id}  onRequestAudio={handler}
  ├── VideoCard  isAudioActive={activeAudioId === video.id}  onRequestAudio={handler}
  └── VideoCard  isAudioActive={activeAudioId === video.id}  onRequestAudio={handler}
```

**Cơ chế mute tự động:** Khi `activeAudioId` thay đổi, các VideoCard _khác_ bị mute thông qua controlled prop `muted={!isAudioActive}` — React cập nhật DOM attribute trực tiếp, **không cần effect** để mute từng card.

### Thay đổi file

#### `VideoGrid.tsx` — thêm state + stable callbacks

```tsx
const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

// useCallback bắt buộc để VideoCard không re-render thừa
const handleRequestAudio = useCallback((id: string) => {
  setActiveAudioId((prev) => (prev === id ? null : id)); // toggle
}, []);

const handleAudioDeactivate = useCallback((id: string) => {
  setActiveAudioId((prev) => (prev === id ? null : prev));
}, []);

<VideoCard
  key={video.id}
  video={video}
  isAudioActive={activeAudioId === video.id}
  onRequestAudio={handleRequestAudio}
  onAudioDeactivate={handleAudioDeactivate}
/>;
```

> **Lưu ý:** Bỏ `allIds` prop — prop này chỉ dùng cho routing (hiện đang bị comment), không liên quan tới audio.

#### `VideoCard.tsx` — nhận props thay vì tự quản lý `muted`

```tsx
interface Props {
  video: IVideo;
  isAudioActive: boolean; // NEW — thay thế local muted state
  onRequestAudio: (id: string) => void; // NEW — toggle audio qua parent
  onAudioDeactivate: (id: string) => void; // NEW — notify parent khi scroll out
}
```

- **Bỏ** `const [muted, setMuted] = useState(true)` — thay bằng `const muted = !isAudioActive`
- Nút loa gọi `onRequestAudio(video.id)` thay vì `setMuted`
- Export với `React.memo` để chỉ re-render card bị ảnh hưởng

```tsx
// Stable ref để tránh stale closure trong effect
const onAudioDeactivateRef = useRef(onAudioDeactivate);
onAudioDeactivateRef.current = onAudioDeactivate;
```

**Effect 1 — play/pause theo visibility** (tách riêng, không trộn logic audio):

```tsx
useEffect(() => {
  if (!isInView) {
    videoEl?.pause();
    // setReady(false) → thumbnail hiện lại khi scroll vào — intentional UX:
    // tránh hiện frame cuối của video khi re-enter, dùng thumbnail làm placeholder
    setReady(false);
  } else {
    videoEl?.play().catch(() => {});
  }
}, [isInView, videoEl]);
```

**Effect 2 — notify parent khi scroll out khi đang active** (deps tối giản, dùng ref cho callback):

```tsx
useEffect(() => {
  if (!isInView && isAudioActive) {
    onAudioDeactivateRef.current(video.id);
  }
}, [isInView, isAudioActive, video.id]);
```

> **Tại sao tách 2 effect?** Effect 1 chỉ phụ thuộc vào visibility + videoEl. Effect 2 phụ thuộc vào visibility + audio state. Gộp chung làm deps array phức tạp và gây re-run không cần thiết khi `isAudioActive` thay đổi trong lúc video đang out of view (sẽ call `pause()` lại dù video đã paused).

**Export:**

```tsx
export default React.memo(VideoCard);
```

> **Tại sao `React.memo` bắt buộc?** Không có memo, mỗi lần `activeAudioId` thay đổi → toàn bộ N card trong grid re-render. Với memo + `useCallback` ở parent, chỉ 2 card re-render (card vừa active và card vừa deactive).

## Edge Cases

| Case                                                | Xử lý                                                                                                |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Scroll nhanh, nhiều video vào/ra view               | Effect 2 chỉ gọi `onAudioDeactivate` khi `isAudioActive === true` — các card muted không tác động gì |
| User ấn loa khi video chưa `canPlay`                | Vẫn set `activeAudioId`, video sẽ unmute khi sẵn sàng (controlled prop)                              |
| Video bị lỗi load                                   | `muted` vẫn theo `isAudioActive`, không block UI                                                     |
| `isAudioActive` thay đổi khi video đang out of view | Effect 2 re-run nhưng `onAudioDeactivate` chỉ gọi nếu `isAudioActive = true` → không gây vòng lặp    |

## Verification Plan

- [ ] Load trang → tất cả video muted
- [ ] Ấn loa video 1 → chỉ video 1 có âm thanh
- [ ] Ấn loa video 2 → video 2 có âm thanh, video 1 mute
- [ ] Ấn loa video 2 (đang active) → tất cả muted
- [ ] Scroll video đang active ra ngoài → tất cả muted
- [ ] Scroll video đang active ra ngoài → video khác không tự unmute
- [ ] Scroll nhanh qua nhiều video → không có audio rác
