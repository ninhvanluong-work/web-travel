---
title: 'Hệ thống thông báo Alert toàn cục (Global Alert System)'
created: '2026-05-31'
status: 'draft'
domain: 'infra'
---

# Spec: Hệ thống thông báo Alert toàn cục (Global Alert System)

## 1. Vấn đề / Mục tiêu

Hiện tại trong dự án `web-travel`, khi thực hiện các tác vụ lưu sản phẩm (Tour), chỉnh sửa form, hoặc khi API trả về lỗi, hệ thống chưa có một cơ chế thông báo (Alert/Toast) đồng bộ và nhất quán. Lập trình viên đang phải xử lý ad-hoc bằng các cảnh báo cục bộ hoặc thông báo thô sơ của trình duyệt. Điều này dẫn đến:

- **Trải nghiệm người dùng (UX) kém:** Các thông báo không đồng bộ về mặt thẩm mỹ, thiếu các trạng thái trực quan (Success, Warning, Error, Info).
- **Khó bảo trì:** Code xử lý thông báo bị phân tán ở nhiều component, gây trùng lặp logic hiển thị.
- **Tối ưu hóa Mobile kém:** Các thông báo Toast dễ bị tràn màn hình, che khuất giao diện tương tác chính trên khung hiển thị di động (`max-width: 430px`).

### Mục tiêu thiết kế

Xây dựng một hệ thống **Global Alert System** đạt tiêu chuẩn thẩm mỹ cao cấp (Premium UI/UX), đáp ứng tuyệt đối các yêu cầu sau:

1. **Thiết kế Sang trọng (Rich Aesthetics):** Alert có dạng hộp bo góc mềm mại (`rounded-2xl`), viền mỏng tinh tế, phối màu nền và viền dịu mắt dựa trên 4 trạng thái (Success - Xanh lá, Warning - Vàng cam, Error - Đỏ, Info - Xanh dương), đi kèm icon và nút đóng trực quan.
2. **Thích ứng Di động (Mobile-first Stacking):** Định vị cố định ở phía trên cùng chính giữa màn hình di động (`top-center`), thiết lập hàng đợi thông minh xếp chồng tối đa **3 Toast** cùng lúc để không làm ngợp không gian hiển thị của điện thoại.
3. **Hành vi Thông minh (Smart Behaviors):**
   - **Success & Info:** Tự động đóng sau **4 giây** kèm một thanh tiến trình (progress bar) siêu mỏng ở cạnh dưới co dần về 0 báo hiệu thời gian đếm ngược.
   - **Warning & Error:** Không tự động đóng, bắt buộc người dùng bấm nút đóng `(X)` thủ công để đảm bảo họ đã ghi nhận thông tin cảnh báo/lỗi hệ thống.
4. **Tích hợp Toàn cục siêu tiện lợi (Zustand Global State):** Lập trình viên ở bất kỳ trang hay module nào chỉ cần gọi hàm hook `addAlert` từ global store của **Zustand** để kích hoạt thông báo ngay lập tức mà không cần phải import component hiển thị thủ công.

---

## 2. Hành vi mong muốn (UX/UI Behaviors)

### 2.1. Phối màu & Icon cho 4 Trạng thái Alert

Mỗi trạng thái Alert sử dụng hệ màu nhẹ nhàng, phối hợp giữa màu nền (background), màu viền (border) và màu chữ (text) để tạo cảm giác vô cùng cao cấp:

| Trạng thái               | Mã màu đề xuất (Tailwind/CSS)                                                                                | Icon sử dụng                            | Hành vi đóng mặc định         |
| :----------------------- | :----------------------------------------------------------------------------------------------------------- | :-------------------------------------- | :---------------------------- |
| **Success** (Thành công) | Nền: `bg-emerald-50/95`<br>Viền: `border-emerald-200`<br>Chữ: `text-emerald-950`<br>Icon: `text-emerald-500` | Radix CheckIcon / Lucide CheckCircle2   | Tự động đóng sau 4 giây       |
| **Warning** (Cảnh báo)   | Nền: `bg-amber-50/95`<br>Viền: `border-amber-200`<br>Chữ: `text-amber-950`<br>Icon: `text-amber-500`         | Radix AlertIcon / Lucide AlertTriangle  | Bắt buộc click nút đóng `(X)` |
| **Error** (Lỗi)          | Nền: `bg-rose-50/95`<br>Viền: `border-rose-200`<br>Chữ: `text-rose-950`<br>Icon: `text-rose-500`             | Radix CrossCircledIcon / Lucide XCircle | Bắt buộc click nút đóng `(X)` |
| **Info** (Thông tin)     | Nền: `bg-sky-50/95`<br>Viền: `border-sky-200`<br>Chữ: `text-sky-950`<br>Icon: `text-sky-500`                 | Radix InfoIcon / Lucide Info            | Tự động đóng sau 4 giây       |

### 2.2. Quy tắc Giao diện & Trượt Hiển thị (Aesthetics & Animations)

- **Khung chứa (Container):** Cố định tuyệt đối tại vị trí `fixed top-4 left-1/2 -translate-x-1/2 z-[9999]`. Độ rộng của hộp Toast là `w-[calc(100%-32px)] max-w-[398px]` để vừa khít và đẹp mắt bên trong khung di động `430px`.
- **Hiệu ứng Animation:**
  - Khi xuất hiện: Toast trượt nhẹ từ trên xuống (`translate-y-[-20px] opacity-0 → translate-y-0 opacity-100`) với hiệu ứng `spring` mượt mà (dùng Framer Motion).
  - Khi biến mất: Toast trượt sang ngang hoặc trượt lên trên đồng thời mờ dần.
- **Quy tắc Xếp chồng (Queueing):**
  - Hỗ trợ tối đa **3 Alert Toast** hiển thị đồng thời.
  - Khi Alert mới xuất hiện: Nó sẽ được thêm vào trên cùng, đẩy các Alert cũ trượt xuống phía dưới.
  - Nếu danh sách vượt quá 3: Alert cũ nhất (dưới cùng) sẽ tự động kích hoạt hiệu ứng slide-out biến mất để nhường chỗ cho cái mới.
- **Thanh đếm ngược trực quan (Countdown Progress Bar):**
  - Đối với _Success_ và _Info_, một đường line mỏng `h-[3px]` nằm sát cạnh dưới hộp Alert sẽ chạy co ngắn dần từ `width: 100%` về `0%` trong vòng 4 giây, giúp người dùng chủ động biết khi nào thông báo tự ẩn đi.

### 2.3. Bảng trạng thái tương tác

| Hành động người dùng                | Kết quả mong đợi                                                                                                                                                         |
| :---------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gọi hàm `addAlert` từ code          | Một Toast Alert mới trượt từ trên xuống ở vị trí `top-center`. Thanh tiến trình đếm ngược 4s bắt đầu chạy (nếu là Success/Info).                                         |
| Hover chuột hoặc chạm tay vào Toast | Tạm dừng (Pause) bộ đếm thời gian tự ẩn và đóng băng thanh tiến trình (người dùng muốn đọc kỹ hơn). Khi chuột rời ra (Mouse leave), bộ đếm thời gian tiếp tục chạy tiếp. |
| Click nút `(X)` trên Toast          | Alert lập tức kích hoạt hiệu ứng trượt biến mất và giải phóng vị trí để các Toast phía dưới dịch chuyển lên trên một cách mượt mà.                                       |
| Kích hoạt Alert thứ 4 liên tục      | Toast thứ 4 xuất hiện trên cùng, Toast thứ 1 (cũ nhất ở dưới cùng) trượt đi biến mất ngay lập tức.                                                                       |

---

## 3. Thay đổi kỹ thuật (Technical Changes)

Chúng ta sẽ xây dựng hệ thống này hoàn toàn sạch sẽ bằng cách kết hợp **Zustand** (State Management), **Framer Motion** (Animation mượt mà) và **Radix Icons** (hoặc Lucide Icons có sẵn trong dự án).

### 3.1. Sơ đồ Cấu trúc File

| File                                                      | Thay đổi / Tạo mới | Vai trò                                                                                                            |
| :-------------------------------------------------------- | :----------------- | :----------------------------------------------------------------------------------------------------------------- |
| `[NEW] src/store/use-alert-store.ts`                      | Tạo mới            | Định nghĩa Zustand store quản lý danh sách Alert hoạt động dạng hàng đợi (Queue).                                  |
| `[NEW] src/components/ui/Alert/alert-toast.tsx`           | Tạo mới            | Component hiển thị từng Toast đơn lẻ (nhận diện `type`, render style, progress bar đếm ngược, pause on hover).     |
| `[NEW] src/components/ui/Alert/global-alert-provider.tsx` | Tạo mới            | Container bọc ngoài quản lý danh sách hiển thị tối đa 3 Toast, bọc bằng `AnimatePresence` để xử lý exit animation. |
| `[MODIFY] src/pages/_app.tsx`                             | Sửa đổi            | Tích hợp `GlobalAlertProvider` vào root của ứng dụng để kích hoạt Alert ở tất cả các trang.                        |

---

### 3.2. Chi tiết Triển khai Code (Phác thảo Kỹ thuật)

#### A. Cấu trúc Zustand Store (`src/store/use-alert-store.ts`)

```typescript
import { create } from 'zustand';

export interface AlertAction {
  label: string;
  onClick: () => void;
}

export interface AlertItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number; // ms
  action?: AlertAction;
}

interface AlertState {
  alerts: AlertItem[];
  addAlert: (alert: Omit<AlertItem, 'id'>) => void;
  removeAlert: (id: string) => void;
  clearAll: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  addAlert: (alert) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => {
      // Giới hạn tối đa 3 alerts hiển thị, nếu vượt quá sẽ cắt bớt phần tử cũ nhất ở cuối
      const newAlerts = [{ ...alert, id }, ...state.alerts];
      if (newAlerts.length > 3) {
        newAlerts.pop();
      }
      return { alerts: newAlerts };
    });
  },
  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((item) => item.id !== id),
    })),
  clearAll: () => set({ alerts: [] }),
}));
```

#### B. Component hiển thị từng Toast (`src/components/ui/Alert/alert-toast.tsx`)

```tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Cross2Icon, CheckCircledIcon, InfoCircledIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { AlertItem, useAlertStore } from '@/store/use-alert-store';
import { cn } from '@/lib/utils';

export function AlertToast({ alert }: { alert: AlertItem }) {
  const removeAlert = useAlertStore((state) => state.removeAlert);
  const defaultDuration = alert.type === 'success' || alert.type === 'info' ? 4000 : 0;
  const duration = alert.duration ?? defaultDuration;

  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);

  // Xử lý đếm ngược và Progress Bar
  useEffect(() => {
    if (duration === 0) return;

    if (!isPaused) {
      startTimeRef.current = Date.now();
      const interval = 20; // Cập nhật mượt mà mỗi 20ms

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, remainingTimeRef.current - elapsed);
        const percentage = (remaining / duration) * 100;

        setProgress(percentage);

        if (remaining <= 0) {
          clearInterval(timerRef.current!);
          removeAlert(alert.id);
        }
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, duration, alert.id, removeAlert]);

  // Phối màu sắc và Icon theo trạng thái
  const config = {
    success: {
      bg: 'bg-emerald-50/95 border-emerald-200 text-emerald-950',
      icon: <CheckCircledIcon className="w-5 h-5 text-emerald-500 shrink-0" />,
      barBg: 'bg-emerald-500',
    },
    warning: {
      bg: 'bg-amber-50/95 border-amber-200 text-amber-950',
      icon: <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0" />,
      barBg: 'bg-amber-500',
    },
    error: {
      bg: 'bg-rose-50/95 border-rose-200 text-rose-950',
      icon: <Cross2Icon className="w-5 h-5 bg-rose-500 text-white rounded-full p-0.5 shrink-0" />,
      barBg: 'bg-rose-500',
    },
    info: {
      bg: 'bg-sky-50/95 border-sky-200 text-sky-950',
      icon: <InfoCircledIcon className="w-5 h-5 text-sky-500 shrink-0" />,
      barBg: 'bg-sky-500',
    },
  }[alert.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        'relative flex flex-col w-full rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all duration-200 overflow-hidden',
        config.bg
      )}
    >
      <div className="flex gap-3 items-start">
        {config.icon}
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-sm leading-tight">{alert.title}</h4>
          {alert.description && <p className="text-xs opacity-90 leading-normal">{alert.description}</p>}

          {/* Action CTA Button */}
          {alert.action && (
            <button
              onClick={() => {
                alert.action?.onClick();
                removeAlert(alert.id);
              }}
              className="mt-2 text-xs font-semibold underline hover:no-underline"
            >
              {alert.action.label}
            </button>
          )}
        </div>

        {/* Nút đóng X */}
        <button
          onClick={() => removeAlert(alert.id)}
          className="rounded-full p-1 hover:bg-black/5 active:bg-black/10 transition-colors shrink-0"
        >
          <Cross2Icon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Thanh tiến trình đếm ngược (chỉ hiển thị cho Success và Info có auto-dismiss) */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/5">
          <div className={cn('h-full transition-all duration-20', config.barBg)} style={{ width: `${progress}%` }} />
        </div>
      )}
    </motion.div>
  );
}
```

---

## 4. Dependencies & Conflicts ← PHẦN BẮT BUỘC

- **Depends on:** Không phụ thuộc vào spec nào trước đó.
- **Modifies:**
  - `src/pages/_app.tsx` (Thêm Global Provider vào root layout của ứng dụng Next.js).
- **Must NOT break:**
  - **Layout Mobile-First (Protected Behavior):** Phải đảm bảo `GlobalAlertProvider` cố định (`fixed`) và có chỉ số `z-index` cực cao (`z-[9999]`) để luôn nổi lên trên toàn bộ nội dung, nhưng KHÔNG được làm gián đoạn việc cuộn trang (scroll) hoặc tương tác của các nút bấm bên dưới khi Toast đã ẩn.
  - **visualViewport API / Keyboard Mobile:** Tránh xung đột vị trí hiển thị khi bàn phím ảo di động bật lên ở trang nhập liệu Form Admin.
- **Conflicts with:** Không có xung đột với bất kỳ đặc tả hay tính năng đang phát triển nào khác.

---

## 5. Out of scope

- **Database/Local History:** Tính năng này chỉ xử lý thông báo động tức thời (Real-time Toasts). Hệ thống lịch sử thông báo (Notification Center/Inbox) lưu trữ vào cơ sở dữ liệu sẽ được thiết kế trong một spec riêng nếu có yêu cầu.
- **Tự động bắt lỗi Unhandled Promise:** Spec này không tự động cấu hình window error listener để bắn lỗi unhandled; lập trình viên cần chủ động bắt lỗi (ví dụ trong khối `catch` hoặc axios interceptor) và gọi `addAlert({ type: 'error', ... })`.

---

## 6. Open questions

_Không còn câu hỏi bỏ ngỏ._ Các thảo luận trong Question Storming đã thống nhất về:

1. Hỗ trợ cả hai cơ chế hiển thị (Toast nổi cho phản hồi tác vụ, Banner tĩnh cho validation form).
2. Xếp chồng tối đa 3 Toast cùng lúc trên khung hình mobile dọc để tối ưu không gian.
3. Cơ chế tự đóng phân loại (4 giây cho Success/Info kèm progress bar, Warning/Error bắt buộc click tắt).
