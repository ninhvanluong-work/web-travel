# Plan: Booking Payment Tab

**Date:** 2026-08-17  
**Feature:** Add Payment & Timeline tab to `BookingDetailDrawer`  
**Spec:** `docs/specs/admin/booking-payment-api.md`

---

## Ambiguities Resolved

| Vấn đề                                              | Quyết định                                                        |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| `succeed` vs `succeeded` — API trả về cả 2          | Normalize: treat `succeed` === `succeeded` khi render badge       |
| Nhiều payments / booking — hiển thị cái nào?        | Hiển thị toàn bộ list, `succeeded` lên đầu, sort `createdAt` desc |
| Raw Viewer ở đâu?                                   | Chỉ trong audit log timeline, KHÔNG trên payment summary card     |
| i18n cho empty state                                | Dùng i18n key, không hardcode string bất kỳ ngôn ngữ nào          |
| `IBookingPaymentLog` thiếu `updatedAt`, `deletedAt` | Thêm optional fields vào interface                                |

---

## Implementation Order (dependency-first)

| Step | Action                             | File                                                          | Depends on |
| ---- | ---------------------------------- | ------------------------------------------------------------- | ---------- |
| 1    | Append payment types               | `src/api/booking/types.ts`                                    | —          |
| 2    | Append request functions           | `src/api/booking/requests.ts`                                 | step 1     |
| 3    | Append query hooks                 | `src/api/booking/queries.ts`                                  | step 2     |
| 4    | Add i18n keys (EN)                 | `public/locales/en/adminPage.json`                            | —          |
| 5    | Add i18n keys (VI)                 | `public/locales/vi/adminPage.json`                            | —          |
| 6    | Create `BookingPaymentTab.tsx`     | `src/modules/AdminBooking/components/BookingPaymentTab.tsx`   | steps 1–5  |
| 7    | Refactor `BookingDetailDrawer.tsx` | `src/modules/AdminBooking/components/BookingDetailDrawer.tsx` | step 6     |

Steps 1–5 có thể làm song song. Step 6 cần 1–5. Step 7 cần 6.

---

## Phase 1 — API Layer

### 1a. `src/api/booking/types.ts` — Append

```typescript
export type PaymentProvider = 'paypal' | 'vnpay' | 'stripe' | 'momo' | 'bank_transfer' | 'cash' | string;

export type PaymentStatus = 'pending' | 'succeed' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';

export interface IBookingPayment {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  provider: PaymentProvider;
  providerTxId?: string | null;
  providerIntentId?: string | null;
  price: string | number;
  currency: string;
  status: PaymentStatus;
  failureReason?: string | null;
  rawResponse?: Record<string, unknown> | null;
  bookingId: string;
}

export interface IBookingPaymentLog {
  id: string;
  updatedAt?: string;
  deletedAt?: string | null;
  bookingPaymentId: string;
  bookingId: string;
  fromStatus: PaymentStatus;
  toStatus: PaymentStatus;
  provider: PaymentProvider;
  providerTxId?: string | null;
  reason?: string | null;
  rawResponse?: Record<string, unknown> | null;
  source: string;
  createdAt: string;
}

export interface ApiBookingPaymentListResponse {
  data: IBookingPayment[];
  code: number;
  error: string | null;
  message: string;
}

export interface ApiBookingPaymentLogsResponse {
  data: IBookingPaymentLog[];
  code: number;
  error: string | null;
  message: string;
}
```

### 1b. `src/api/booking/requests.ts` — Append

```typescript
export async function getBookingPayments(bookingId: string): Promise<IBookingPayment[]> {
  const { data } = await request.get<ApiBookingPaymentListResponse>(`/booking/${bookingId}/payment`);
  return data.data;
}

export async function getBookingPaymentLogs(paymentId: string): Promise<IBookingPaymentLog[]> {
  const { data } = await request.get<ApiBookingPaymentLogsResponse>(`/booking-payment/${paymentId}/logs`);
  return data.data;
}
```

### 1c. `src/api/booking/queries.ts` — Append

```typescript
export const useBookingPayments = createQuery<IBookingPayment[], { bookingId: string }>({
  primaryKey: '/booking/payments',
  queryFn: ({ queryKey: [, { bookingId }] }) => getBookingPayments(bookingId),
  staleTime: 0,
});

export const useBookingPaymentLogs = createQuery<IBookingPaymentLog[], { paymentId: string }>({
  primaryKey: '/booking-payment/logs',
  queryFn: ({ queryKey: [, { paymentId }] }) => getBookingPaymentLogs(paymentId),
  staleTime: 0,
});
```

---

## Phase 2 — BookingDetailDrawer Refactor

**File:** `src/modules/AdminBooking/components/BookingDetailDrawer.tsx`

Wrap existing 3 sections vào `TabsContent value="info"`. Thêm Tab 2 render `<BookingPaymentTab>`. **Không thay đổi logic hiện có.**

```tsx
// New imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingPaymentTab } from './BookingPaymentTab';

// Structure change (inside {booking && ...}):
<div className="space-y-4 pt-2">
  <SheetHeader>...</SheetHeader>
  <Tabs defaultValue="info">
    <TabsList className="w-full">
      <TabsTrigger value="info" className="flex-1">
        {t('admin.booking.info.tab.title')}
      </TabsTrigger>
      <TabsTrigger value="payment" className="flex-1">
        {t('admin.booking.payment.tab.title')}
      </TabsTrigger>
    </TabsList>
    <TabsContent value="info" className="space-y-5 mt-4">
      {/* existing 3 sections — untouched */}
    </TabsContent>
    <TabsContent value="payment" className="mt-4">
      <BookingPaymentTab bookingId={booking.id} />
    </TabsContent>
  </Tabs>
</div>;
```

Payment count badge: hiển thị trong nội dung Tab 2 (không prop-drill lên trigger để tránh lift state).

---

## Phase 3 — BookingPaymentTab Component

**File:** `src/modules/AdminBooking/components/BookingPaymentTab.tsx`

### Component tree

```
BookingPaymentTab(bookingId)
├── PaymentSkeleton (khi isLoading)
├── AlertBanner error (khi isError)
├── Empty state div (khi payments.length === 0)
└── [PaymentCard] × n (sorted: succeeded first, then createdAt desc)
    ├── Provider badge (color-coded via className)
    ├── Status badge (normalized)
    ├── TxID + IntentID với Copy button (useCopy)
    ├── Amount (bold large)
    ├── FailureReason AlertBanner (nếu có)
    └── PaymentAuditTimeline(paymentId)
        └── [TimelineEntry] × n (từ useBookingPaymentLogs)
            ├── Timestamp (dayjs format 'DD/MM/YYYY HH:mm:ss')
            ├── fromStatus → toStatus
            ├── Source badge
            └── RawResponseViewer (collapsible, max-h-[300px])
```

### Key logic snippets

```typescript
// Normalize status
function normalizeStatus(s: PaymentStatus): string {
  return s === 'succeed' ? 'succeeded' : s;
}

// Provider badge class
const PROVIDER_CLASS: Record<string, string> = {
  paypal: 'bg-blue-100 text-blue-700 border-blue-200',
  vnpay: 'bg-red-100 text-red-700 border-red-200',
  stripe: 'bg-purple-100 text-purple-700 border-purple-200',
  cash: 'bg-gray-100 text-gray-600 border-gray-200',
  bank_transfer: 'bg-gray-100 text-gray-600 border-gray-200',
};

// Sort order: succeeded first, then by createdAt desc
const sorted = [...payments]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .sort((a) => (normalizeStatus(a.status) === 'succeeded' ? -1 : 1));

// RawResponseViewer — KHÔNG console.log rawResponse
// Container: max-h-[300px] overflow-y-auto bg-slate-950 text-slate-100 rounded p-3 font-mono text-xs
```

### Notes

- `dayjs(isoString).format('DD/MM/YYYY HH:mm:ss')` → converts UTC ISO to browser local time automatically (no extra plugin needed)
- `useCopy` từ `src/hooks/useCopy.ts`: `const [, copy] = useCopy(true)` → `copy(text)`
- `AlertBanner` từ `src/components/ui/AlertBanner` (default import)
- `Skeleton` từ `src/components/ui/skeleton`
- **Không** `console.log(rawResponse)` bất kỳ đâu trong component

---

## Phase 4 — i18n Keys

### `public/locales/en/adminPage.json` — Append

```json
"admin.booking.info.tab.title": "Booking Info",
"admin.booking.payment.tab.title": "Payment & Timeline",
"admin.booking.payment.empty": "No payments found for this booking.",
"admin.booking.payment.status.pending": "Pending",
"admin.booking.payment.status.succeeded": "Succeeded",
"admin.booking.payment.status.failed": "Failed",
"admin.booking.payment.status.cancelled": "Cancelled",
"admin.booking.payment.status.refunded": "Refunded",
"admin.booking.payment.txId": "Transaction ID",
"admin.booking.payment.intentId": "Intent ID",
"admin.booking.payment.amount": "Amount",
"admin.booking.payment.failureReason": "Failure Reason",
"admin.booking.payment.rawResponse": "View raw response",
"admin.booking.payment.rawResponse.hide": "Hide raw response",
"admin.booking.payment.copy": "Copy",
"admin.booking.payment.source": "Source",
"admin.booking.payment.error.title": "Failed to load payments",
"admin.booking.payment.error.message": "An error occurred while fetching payment data. Please try again."
```

### `public/locales/vi/adminPage.json` — Append

```json
"admin.booking.info.tab.title": "Thông tin Booking",
"admin.booking.payment.tab.title": "Thanh toán & Lịch sử",
"admin.booking.payment.empty": "Chưa có thanh toán nào cho booking này.",
"admin.booking.payment.status.pending": "Đang chờ",
"admin.booking.payment.status.succeeded": "Thành công",
"admin.booking.payment.status.failed": "Thất bại",
"admin.booking.payment.status.cancelled": "Đã hủy",
"admin.booking.payment.status.refunded": "Đã hoàn tiền",
"admin.booking.payment.txId": "Mã giao dịch",
"admin.booking.payment.intentId": "Mã Intent",
"admin.booking.payment.amount": "Số tiền",
"admin.booking.payment.failureReason": "Lý do thất bại",
"admin.booking.payment.rawResponse": "Xem dữ liệu thô",
"admin.booking.payment.rawResponse.hide": "Ẩn dữ liệu thô",
"admin.booking.payment.copy": "Sao chép",
"admin.booking.payment.source": "Nguồn",
"admin.booking.payment.error.title": "Không tải được thanh toán",
"admin.booking.payment.error.message": "Đã xảy ra lỗi khi tải dữ liệu thanh toán. Vui lòng thử lại."
```

---

## Potential Challenges

1. **`react-query-kit` `enabled` option syntax** — dùng `useBookingPaymentLogs({ variables: { paymentId }, enabled: !!paymentId })`. Nếu type không accept `enabled`, thay bằng guard `if (!paymentId) return null` trong component.

2. **`SheetContent` overflow double-scroll** — Sau khi thêm tabs, timeline có thể dài. Đảm bảo `TabsContent[value="payment"]` không tạo double scroll-container. Raw viewer đã có `max-h-[300px]` riêng.

3. **Tailwind purge với dynamic class** — Provider badge colors phải viết đầy đủ string trong source (không construct dynamically như `bg-${color}-100`). Dùng lookup object với full class strings như trong snippet trên.

4. **`useCopy` toast locale** — `useCopy(true)` dùng hardcoded `'Copied'` toast. Nếu cần localize, pass `false` và dùng `copied` boolean để show custom indicator.
