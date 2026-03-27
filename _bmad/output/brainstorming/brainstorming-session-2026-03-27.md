---
stepsCompleted: [1, 2]
inputDocuments: []
session_topic: 'Spec phân tích tính năng Auto-play & Audio VideoDetailPage'
session_goals: 'Tìm giải pháp phát video kèm âm thanh khi ấn từ Grid & khi vuốt trên Slide (Ràng buộc cứng: Bắt buộc sài Iframe)'
selected_approach: 'ai-recommended'
techniques_used: ['First Principles Thinking', 'Constraint Mapping', 'Reverse Brainstorming']
ideas_generated: []
context_file: ''
session_continued: true
continuation_date: 2026-03-27
---
## Session Overview

**Topic:** Spec phân tích tính năng Auto-play & Audio VideoDetailPage
**Goals:** Tìm giải pháp phát video kèm âm thanh khi ấn từ Grid & khi vuốt trên Slide

### Context Guidance

_Tập trung vào trang `src/modules/VideoDetailPage/index.tsx`, xử lý browser autoplay policy đối với iframe chặn audio unmuted._

### Session Setup

_Đã xác định được mục tiêu cơ bản: Phân tích và tìm cách lách/xử lý việc bị mute audio do chính sách autoplay khi không có tương tác trực tiếp, cũng như việc video slide cần tự động phát và có tiếng khi cuộn tới._

**Ràng buộc quan trọng:** Vấn đề lỗi không phát loa/không tự động autoplay này chỉ đang xảy ra trên iPhone (điều này cho thấy nguyên nhân cốt lõi có khả năng cao liên quan đến WebKit / iOS Safari autoplay policy chặn âm thanh nếu không có tương tác người dùng).

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Spec phân tích tính năng Auto-play & Audio VideoDetailPage with focus on Tìm giải pháp phát video kèm âm thanh khi ấn từ Grid & khi vuốt trên Slide

**Recommended Techniques:**

- **First Principles Thinking:** Đào tận gốc luật Autoplay của WebKit/iOS Safari.
- **Constraint Mapping:** Vẽ ra các giới hạn của DOM/Iframe trên Mobile và Next.js để tìm khe hở lách luật (workarounds).
- **Reverse Brainstorming:** Đặt câu hỏi tìm lỗ hổng phá hoại để cross-check xem giải pháp thiết kế đã qua mặt được iOS chưa.

**AI Rationale:** Do giới hạn autoplay là chủ đích từ cốt lõi hệ điều hành (Apple WebKit policy), bắt buộc chúng ta phải hiểu rõ cơ chế để áp dụng tiểu xảo (workaround) thay vì cố gắng phá vỡ bằng code thông thường.

## Technique Execution Results

**First Principles Thinking:**
- **Interactive Focus:** Bóc tách luật Autoplay khắt khe của WebKit và Iframe
- **Key Breakthroughs:** 
  1. **Iframe Trap (Ranh giới Iframe):** Hành động click ở Parent Window (màn Grid) bị ngắt quãng, không cấp quyền unmute cho Iframe khi chuyển sang trang Detail.
  2. **Scroll Illusion (Sự vô hình của Scroll):** Thao tác cuộn/vuốt trên Slide không được iOS WebKit tính là "User Gesture" (tương tác hợp lệ) để mở AudioContext.
  3. **The TikTok Secret (Bí mật của TikTok):** TikTok Web dùng thẻ `<video>` native thay vì `<iframe>`, giúp họ mở khóa thành công AudioContext toàn cục cho cả phiên (session) ngay từ cú click đầu tiên ở trang chủ.

**Constraint Mapping:**
- **Interactive Focus:** Xây dựng bản đồ các giới hạn bắt buộc (Không thể bị phá vỡ)
- **Key Constraints:**
  1. **Bunny Stream Barrier:** Bắt buộc phải giữ lại `iframe` vì nền tảng Bunny Delivery xử lý luồng stream HLS (Adaptive Bitrate m3u8), DRMs chống download trộm video bằng IDM, tự động tương thích thiết bị và xử lý Analytics. Việc dỡ bỏ iframe để gọi trực tiếp thẻ `<video src="mp4">` sẽ phá vỡ mọi hệ thống bảo mật băng thông của công ty. CHỐT: Phải sống chung với Iframe.
  2. **The Touchend Loophole:** Trình duyệt cấm Auto-play Audio khi kiện `scroll` diễn ra vì scroll không phải là User Gesture (tương tác người dùng). Thật thú vị, hành động vuốt màn hình trên điện thoại cấu thành từ `touchstart` -> `touchmove` -> `touchend`. Và `touchend` (nhấc ngón tay lên) LÀ MỘT USER GESTURE HỢP LỆ.
  3. **Invisible Touch Layer:** Có thể giăng một thẻ `<div z-index="50" absolute>` phủ mặt Iframe để chặn cú chạm của người dùng, lấy được User Gesture hợp lệ trên Parent page, sau đó truyền lệnh bằng `postMessage()` xuống Bunny Player Iframe.

**Reverse Brainstorming:**
- **Interactive Focus:** So sánh ngoại suy với các nền tảng mãnh thú (YouTube Shorts).
- **Key Breakthrough:** YouTube Shorts trên web Safari hoạt động y hệt TikTok Web, bởi vì đó là Sân Nhà của họ (họ dùng thẻ `<video>` trực tiếp). NHƯNG, nếu ai đó nhúng một YouTube Short vào website khác thông qua Iframe (của Youtube API), Iframe đó sẽ lập tức "bị khóa môi" y hệt BunnyStream. 

## Vòng 2: SCAMPER (Hành trình thay đổi UX thay vì cố Hack DOM)

**Sự thật chát chúa mới phát hiện:** 
SDK `player.mute()` và `player.play()` sử dụng thuật toán `postMessage` bất đồng bộ để chọc xuyên qua cấu trúc cross-origin của Iframe. Trong lúc hàm React của chúng ta nhét `mute -> play -> unmute` liên tục trong 1 chu kỳ máy (Callstack), tín hiệu `unmute` (vốn nhẹ hơn) có nguy cơ vượt mặt nhảy vào Iframe trước lúc Iframe kịp thực thi Promise `play()`. -> Safari thộp cổ ngay lập tức chặn không cho vòng lặp chạy!

**Áp dụng kỹ thuật SCAMPER (Substitute / Adapt / Modify):**

- **[Idea 1 - S (Substitute): Chấp nhận Load Muted, Giao Quyền Vuốt cho Nút]**  
  Thay vì bắt hệ thống phải tự gào lên, ta thiết lập: *Mọi video mặc định trượt xuống là Muted*. Ta gắn 1 icon Loa Nổi (Floating) to đẹp bên cạnh phải. Nếu user muốn xem có tiếng, họ nhấp vào Loa. Lướt qua video khác -> Lại mất tiếng -> Phải nhấp Loa tiếp (UX giống hệt Browser Instagram hồi đầu).
  - Ưu điểm: Safari tuyệt đối không bao giờ chặng vì luôn luôn là User Gesture thuần túy. Code rất nhàn.

- **[Idea 2 - A (Adapt): Chiêu trò "Con mồi mồi lửa" (Lazy- Unmute)]**
  Apple cấp quyền gỡ Mute nều video được phát (Play) ở trạng thái yên lặng (Muted) thành công trong ít nhất `X` mili-giây. 
  - Kế hoạch: Để Iframe Bunny TỰ ĐỘNG phát qua thuộc tính `?autoplay=true&muted=true` mặc định do BunnySDK tự handle Intersection. Frontend KHÔNG gọi hàm `play()` nữa. 
  - Khi video slide đập vào mắt người dùng -> Chờ React chạy `setTimeout 500ms`, sau đó chỉ gửi duy nhất lệnh `player.unmute()`. Khả năng cao Safari sẽ "nhắm mắt làm ngơ" cho phép mở luồng âm thanh một video đang diễn tiến.

- **[Idea 3 - M (Modify): Đánh cắp thao tác lướt ngón tay - Pan/Drag Event]**
  - NextJS bỏ cái CSS `snap-y` đi. Sử dụng Framer Motion làm khung Swipe.
  - Khi ngón tay người dùng bắt đầu vuốt (onDragStart) -> Ta ép gọi hàm `Play()` và `Unmute()` của Iframe video tiếp theo (lúc này nó đang chờ sẵn dưới mép màn hình). Mánh lới này bọc được chu trình trực tiếp vào ngón tay mà không bị delay bởi `IntersectionObserver`.
