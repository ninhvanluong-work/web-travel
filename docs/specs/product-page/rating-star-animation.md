---
title: 'Hiệu ứng Micro-animation cho phần Đánh giá Sao (Rating Stars Animation)'
created: '2026-07-12'
status: 'draft'
domain: 'product-page'
related: 'guide-rating-form.md'
---

# Spec: Hiệu ứng Micro-animation cho phần Đánh giá Sao (Rating Stars Animation)

## 1. Vấn đề / Mục tiêu

Hiện tại, component [rating-star-input.tsx](file:///d:/Remote/web-travel/src/modules/GuideProfilePage/components/rating-star-input.tsx) đã có hiệu ứng nảy cơ bản sử dụng `useAnimate` khi click chọn sao. Tuy nhiên, hiệu ứng này còn đơn điệu, chưa đạt chuẩn chuyên nghiệp và cao cấp (Premium UX):

- **Thiếu phản hồi xúc giác vật lý (Tactile Physics):** Click vào sao chưa có cảm giác đàn hồi (spring physics) tự nhiên, chuyển động co giãn còn mang tính tuyến tính (linear).
- **Trạng thái Hover chưa sinh động:** Di chuột qua các sao chưa tạo ra hiệu ứng dẫn dắt thị giác mượt mà (chỉ thay đổi màu fill lập tức).
- **Chưa có hiệu ứng Phát sáng & Chuyển màu mượt mà (Glow & Transition):** Khi sao chuyển từ chưa chọn sang chọn, màu thay đổi đột ngột thay vì chuyển tiếp màu (color interpolation) kèm hiệu ứng phát sáng nhẹ.
- **Thiếu hỗ trợ khả năng tiếp cận (Accessibility):** Chưa tôn trọng cài đặt hệ thống về việc giảm chuyển động (`prefers-reduced-motion`).

Mục tiêu của spec này là áp dụng phương pháp **\_bmad** (SCAMPER + Sensory Exploration + Analogical Thinking) để nâng cấp hiệu ứng của phần chấm điểm sao đạt mức hoàn thiện cao nhất.

---

## 2. Hành vi mong muốn (UI/UX Animation Behavior)

### 2.1. Các trạng thái tương tác (Interaction States)

| Trạng thái            | Hành động                  | Hiệu ứng chuyển động (Animation)                      | Chi tiết kỹ thuật                                                                                                             |
| :-------------------- | :------------------------- | :---------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **Idle**              | Trạng thái tĩnh            | Mặc định                                              | Sao chưa chọn: viền xám mờ. Sao đã chọn: màu vàng ấm.                                                                         |
| **Hover**             | Di chuột qua sao thứ $N$   | **Phóng to & Sáng nhẹ**                               | Các sao từ 1 đến $N$ sẽ phóng to (`scale: 1.15`), xoay nhẹ (`rotate: 2deg` hoặc `-2deg` xen kẽ), màu sắc chuyển tiếp mượt mà. |
| **Tap / Press**       | Nhấn chuột/giữ trên sao    | **Lún vật lý (Tactile Depress)**                      | Sao đang bị nhấn sẽ co lại (`scale: 0.85`), tạo cảm giác đàn hồi chân thực.                                                   |
| **Click (Select)**    | Nhả chuột (Kích hoạt chọn) | **Hiệu ứng sóng nảy lan tỏa (Staggered Spring Wave)** | Các sao được chọn sẽ thực hiện chuỗi chuyển động nảy bật lên lần lượt từ trái sang phải với delay tăng dần.                   |
| **Deselect / Change** | Chọn số sao thấp hơn       | **Thu nhỏ & Mờ dần nhanh**                            | Các sao bị bỏ chọn sẽ co nhẹ về `scale: 0.9` rồi trả về kích thước mặc định, màu fill xám mờ chuyển tiếp 150ms.               |

### 2.2. Chi tiết Kỹ thuật Animation (Framer Motion & CSS)

#### 1. Hiệu ứng Hover & Tap (Tương tác trực tiếp)

- Sử dụng thuộc tính `whileHover` và `whileTap` của `motion.button` để tự động hóa trạng thái tương tác cục bộ mà không cần tính toán thủ công:
  - `whileHover={{ scale: 1.15, rotate: [0, -3, 3, 0] }}` (xoay nhẹ lắc lư thu hút sự chú ý).
  - `whileTap={{ scale: 0.85 }}`.
- Transition cho trạng thái hover dùng easing `easeOut` với duration cực ngắn `0.15s` để đảm bảo độ nhạy (responsiveness).

#### 2. Hiệu ứng nảy lan tỏa khi Click (Staggered Elastic Spring)

- Khi click chọn sao thứ $N$, chuỗi nảy của các sao từ 1 đến $N$ sẽ được điều khiển bằng `useAnimate` hoặc Framer Motion variants.
- Công thức chuyển động: `scale: [1, 1.35, 0.9, 1.1, 0.98, 1]` (chuyển động nảy tắt dần).
- Easing: Sử dụng **Spring Physics** (Đàn hồi vật lý) thay cho keyframes dạng mảng:
  - `type: "spring"`
  - `stiffness: 400` (độ cứng cao để nảy nhanh)
  - `damping: 15` (giảm xóc vừa phải để nảy 2-3 nhịp)
  - `mass: 0.8`
- **Stagger Effect (Độ trễ lan tỏa):** Sao thứ $i$ sẽ bắt đầu chuyển động sau sao thứ $i-1$ một khoảng `delay = i * 0.05s`.

#### 3. Chuyển đổi màu sắc và Glow (Color & Glow interpolation)

- Khi được kích hoạt, sao sẽ chuyển từ màu xám sang màu vàng ấm `#FBBF24` kèm theo hiệu ứng bóng mờ màu vàng mờ tỏa ra xung quanh trong thời gian ngắn rồi biến mất (tạo cảm giác năng lượng phát ra khi nhấn nút):
  - Hiệu ứng phát sáng bằng cách bọc biểu tượng ngôi sao bên trong một vòng tròn background mờ ảo (`drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))`), hoạt ảnh biến mất nhanh sau `0.4s`.

#### 4. Nhãn cảm xúc động dưới sao (Dynamic Label Fade)

- Nhãn cảm xúc tương ứng (ví dụ: _"Rất tuyệt vời!"_) sẽ trượt từ dưới lên (`y: [6, 0]`) và tăng dần độ mờ (`opacity: [0, 1]`) với hiệu ứng spring êm ái khi điểm số thay đổi.

#### 5. Khả năng tiếp cận (Accessibility)

- Sử dụng hook `useReducedMotion` của Framer Motion. Nếu người dùng cài đặt giảm chuyển động trên hệ điều hành, tất cả các hiệu ứng scale/rotate phức tạp sẽ tự động tắt, chỉ giữ lại hiệu ứng chuyển màu sắc nhanh (fade transition 100ms).

---

## 3. Thay đổi kỹ thuật (Technical Changes)

### 3.1. Cấu trúc File & Component thay đổi

| File                                                                                                                | Mô tả thay đổi                                                                                                                                                                                                                                                                            |
| :------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [rating-star-input.tsx](file:///d:/Remote/web-travel/src/modules/GuideProfilePage/components/rating-star-input.tsx) | - Nâng cấp sử dụng `motion.button` với các trạng thái `whileHover`, `whileTap`.<br>- Tinh chỉnh cấu hình spring của `useAnimate` khi click chọn sao.<br>- Tích hợp hook `useReducedMotion` để xử lý accessibility.<br>- Thêm hiệu ứng phát sáng tỏa lan (Glow Effect) khi click chọn sao. |

### 3.2. Đoạn mã minh họa triển khai (Reference Implementation)

```typescript
import { motion, useAnimate, useReducedMotion } from 'framer-motion';

// Trong RatingStarInput Component
const shouldReduceMotion = useReducedMotion();
const [scope, animate] = useAnimate();

const handleSelectStar = async (starIndex: number) => {
  onChange(starIndex);

  if (shouldReduceMotion) {
    // Chỉ chuyển đổi màu sắc lập tức nếu người dùng bật chế độ giảm chuyển động
    return;
  }

  // Tạo hiệu ứng sóng nảy lần lượt từ trái sang phải
  const animations = Array.from({ length: 5 }).map((_, i) => {
    if (i < starIndex) {
      return animate(
        `[data-star-id="${i + 1}"]`,
        {
          scale: [1, 1.3, 0.92, 1.08, 0.98, 1],
          filter: [
            'drop-shadow(0 0 0px rgba(251, 191, 36, 0))',
            'drop-shadow(0 0 10px rgba(251, 191, 36, 0.6))',
            'drop-shadow(0 0 0px rgba(251, 191, 36, 0))',
          ],
        },
        {
          duration: 0.45,
          delay: i * 0.04,
          ease: 'easeOut',
        }
      );
    }
    return Promise.resolve();
  });

  await Promise.all(animations);
};
```

---

## 4. Dependencies & Conflicts

- **Depends on:** `framer-motion` (đã được cài đặt sẵn và sử dụng rộng rãi trong dự án).
- **Modifies:** Component [rating-star-input.tsx](file:///d:/Remote/web-travel/src/modules/GuideProfilePage/components/rating-star-input.tsx).
- **Must NOT break:** Logic thay đổi điểm số, lưu trữ điểm số vào state của form đánh giá cha (`rating-sheet.tsx`).
- **Conflicts with:** Không có xung đột nào với các component hay module khác.

---

## 5. Out of scope

- Thiết kế lại biểu tượng ngôi sao (giữ nguyên icon `Star` từ thư viện `lucide-react`).
- Âm thanh phản hồi (Audio feedback) khi click chọn sao.

---

## 6. Câu hỏi mở (Open questions)

- Có nên thêm hiệu ứng confetti hạt màu vàng bung ra từ sao thứ $N$ khi người dùng chọn điểm tối đa 5 sao không? (Có thể xem xét thêm ở Phase sau nếu muốn nâng tầm trải nghiệm vui vẻ).
