# Spec: Swipe-Back Gesture (VideoDetailPage)

**Ngày tạo:** 2026-04-02
**Trạng thái:** Implemented
**Ưu tiên:** Medium

---

## 1. Vấn đề

Hiện tại user chỉ có thể quay lại bằng:

- Nút back (chevronLeft) ở góc trên trái
- iOS native swipe-back — chỉ hoạt động từ **viền trái màn hình** (browser-level gesture)

Cần hỗ trợ vuốt phải từ **bất kỳ điểm nào trên màn hình**, đặc biệt từ giữa màn hình.

---

## 2. Phân tích kỹ thuật

### Tại sao iOS native swipe-back không đủ

iOS Safari xử lý swipe-back ở browser level, chỉ nhận diện touch bắt đầu từ khoảng ~30px tính từ viền trái. Touch từ giữa màn hình không trigger native gesture.

### Tại sao phải dùng `document.addEventListener` thay vì React synthetic events

```
Container: overflow-y-scroll + snap-mandatory
  ↓
iOS scroll behavior: khi scroll container claim vertical gesture,
có thể suppress touchmove bubble lên parent element
  ↓
React onTouchMove trên div parent → KHÔNG đáng tin trên iOS
```

**Nhưng:** `touchstart` và `touchend` **luôn luôn fire** trên iOS kể cả khi scroll container đang xử lý gesture. Document-level listener với `passive: true` đảm bảo nhận đủ events.

### Tại sao horizontal swipe không conflict với vertical scroll

`overflow-y-scroll` chỉ consume touch events theo trục Y. Khi user vuốt predominantly ngang (deltaX > deltaY \* 2), iOS không claim gesture cho scroll → `touchmove` cũng fire bình thường (dùng được cho visual indicator).

---

## 3. Implementation

**File:** `src/modules/VideoDetailPage/index.tsx`

### Touch handlers (document-level)

```tsx
const touchStartRef = useRef<{ x: number; y: number } | null>(null);
const [swipeProgress, setSwipeProgress] = useState(0);

useEffect(() => {
  const onTouchStart = (e: TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    if (dx > 0 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      setSwipeProgress(dx);
    }
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    setSwipeProgress(0);
    if (dx > 60 && Math.abs(dx) > Math.abs(dy) * 2) {
      router.back();
    }
  };
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
  return () => {
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  };
}, [router]);
```

### Threshold

```
dx > 60px  &&  |dx| > |dy| × 2
```

- `60px` ≈ 14% màn hình 430px — intentional, không nhạy quá
- `× 2` — strict, tránh trigger khi scroll chéo
- `dx > 0` — chỉ vuốt phải (không trigger khi vuốt trái)

### Visual indicator

```tsx
{
  swipeProgress > 20 && (
    <div
      className="absolute left-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
      style={{ opacity: Math.min(swipeProgress / 80, 1) }}
    >
      <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
        <Icons.chevronLeft className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}
```

- Hiện sau 20px đầu tiên (tránh flicker)
- Fade in tuyến tính từ 0 → 1 trong khoảng 0-80px
- Không dùng `translateX` trên container → tránh conflict với `overflow-y-scroll` snap

---

## 4. Quyết định thiết kế

| Điểm                                        | Quyết định            | Lý do                                                                      |
| ------------------------------------------- | --------------------- | -------------------------------------------------------------------------- |
| `document.addEventListener` vs React events | document              | iOS suppress touchmove bubble khi scroll claim                             |
| `passive: true`                             | Bắt buộc              | iOS yêu cầu passive cho scroll-related listeners, không cần preventDefault |
| Trigger ở `touchend`                        | Đúng                  | touchend luôn fire trên iOS; không cần touchmove để detect back            |
| Visual feedback bằng opacity indicator      | Không dùng translateX | translateX trên container conflict với snap scroll                         |
| Threshold `dx > 60 && dx > dy*2`            | Đã test               | Đủ intentional, không trigger khi scroll chéo                              |
| Hoạt động khi `gated=true`                  | Có                    | Gate chỉ block video play, không liên quan navigate                        |
| Không disable iOS native edge swipe         | Giữ nguyên            | Native edge gesture vẫn hoạt động song song, không conflict                |

---

## 5. Verification

| #   | Test                       | Pass condition                                   |
| --- | -------------------------- | ------------------------------------------------ |
| 1   | Vuốt phải từ giữa màn hình | `router.back()` được gọi                         |
| 2   | Vuốt phải từ viền trái     | `router.back()` được gọi                         |
| 3   | Scroll dọc bình thường     | Không trigger back                               |
| 4   | Vuốt chéo (đa số dọc)      | Không trigger back                               |
| 5   | Vuốt trái                  | Không trigger back                               |
| 6   | Tap để pause video         | `router.back()` không bị trigger (deltaX < 10px) |
| 7   | Khi `gated=true`           | Swipe-back vẫn hoạt động                         |
| 8   | iOS Safari — swipe từ giữa | Indicator xuất hiện, back khi nhả tay            |

---

## 6. Không thuộc scope

- Animation "fly out to right" trước khi navigate
- Swipe threshold thay đổi theo velocity (fast flick = threshold thấp hơn)
- Haptic feedback khi đạt threshold
