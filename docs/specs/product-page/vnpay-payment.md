---
title: 'ProductPage — VNPAY Payment Integration'
created: '2026-08-07'
status: 'draft'
domain: 'product-page'
---

# Spec: ProductPage — Tích hợp Thanh toán VNPAY vào Luồng Đặt Tour

## 1. Vấn đề / Mục tiêu

Hiện tại, luồng đặt tour (`BookingSheet` tại `src/modules/ProductPage/components/booking-sheet`) mới chỉ tích hợp cổng thanh toán PayPal cho các đơn hàng có giá trị tính bằng USD. Để phục vụ đối tượng khách hàng nội địa Việt Nam sử dụng đồng tiền VNĐ (₫) và thanh toán qua thẻ ATM/QR Code nội địa, chúng ta cần:

1. **Bổ sung phương thức thanh toán VNPAY**: Hiển thị nút VNPAY khi đơn đặt tour sử dụng tiền tệ VNĐ (`₫`) và tổng số tiền tối thiểu là **1,000 VNĐ**.
2. **Xử lý chuyển hướng đến Cổng thanh toán VNPAY**: Gọi API Backend để sinh link thanh toán và redirect người dùng qua VNPAY Sandbox để tiến hành trả tiền.
3. **Xây dựng trang hạ cánh kết quả (Payment Return Page)**: Tạo route `/payment/vnpay/return` để nhận phản hồi từ Backend sau khi VNPAY redirect về, hiển thị màn hình thông báo thanh toán Thành công / Thất bại với giao diện Premium và các thông tin chi tiết hóa đơn.

---

## 2. Hành vi mong muốn

### 2.1 Hiển thị Nút VNPAY theo Điều kiện Tiền tệ & Giá trị tối thiểu

- Tại bước **Step 4 (Payment)** của `BookingSheet`:

  - **Nếu `currency === '₫'` (hoặc `'VND'`) và `total >= 1000`**:
    - Hiển thị nút **VNPAY** làm phương thức thanh toán chính.
    - Ẩn nút **PayPal** (do PayPal không hỗ trợ giao dịch tiền tệ VNĐ trực tiếp hoặc không phù hợp cho cổng nội địa này).
    - Giữ nguyên nút **Thanh toán bằng Thẻ** (Credit Card) nếu có.
  - **Nếu `currency === '$'` (hoặc `'USD'`)**:
    - Hiển thị nút **PayPal** và nút **Thanh toán bằng Thẻ** (Credit Card).
    - Ẩn nút **VNPAY**.

- **Giao diện Nút VNPAY**:
  - Thiết kế hiện đại, premium, sử dụng tông màu thương hiệu VNPAY (Xanh dương đậm `#0065af` kết hợp logo hoặc viền đỏ cam điểm xuyết).
  - Tiêu đề: **Thanh toán qua VNPAY** (Pay with VNPAY).
  - Phụ đề: **Quét mã QR hoặc Thẻ ATM nội địa** (QR Code or Domestic Cards).
  - Có hiệu ứng hover chuyển sắc nhẹ, micro-interaction mượt mà.

### 2.2 Gọi API sinh URL và Chuyển hướng

- Khi người dùng click chọn nút **VNPAY**:
  - Hiển thị hiệu ứng loading/spinner ngay trên nút thanh toán để tránh click trùng lặp (double-click).
  - Gọi API Backend:
    ```http
    POST /payment/vnpay/{bookingId}/create-payment-url
    ```
    _(Yêu cầu đính kèm `Authorization: Bearer <accessToken>` trong header)_
  - **Xử lý Response**:
    - Backend trả về kết quả chứa đường dẫn thanh toán trực tiếp của VNPAY (VNPAY Checkout URL) và mã txnRef.
    - Dữ liệu trả về có cấu trúc:
      ```json
      {
        "data": {
          "txnRef": "X16EJ4UNVX2I",
          "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=..."
        },
        "code": 200,
        "message": "vnpay payment url created successfully",
        "error": null
      }
      ```
    - Frontend thực hiện chuyển hướng trình duyệt toàn trang sang URL này:
      ```typescript
      window.location.href = data.data.paymentUrl;
      ```

### 2.3 Xử lý Trang hạ cánh Kết quả Thanh toán (`/payment/vnpay/return`)

Sau khi người dùng thực hiện thanh toán trên trang VNPAY (hoặc click Hủy), VNPAY sẽ redirect về Backend. Backend xử lý chữ ký IPN, lưu trạng thái đơn hàng và chuyển hướng người dùng về trang Frontend tại địa chỉ:
`https://<domain-frontend>/payment/vnpay/return?status=success&txnRef=...&bookingId=...&amount=...`

#### A. Cấu trúc URL Parameters

- `status`: `'success'` (Thanh toán thành công) hoặc `'fail'` / `'cancel'` (Thất bại/Hủy bỏ).
- `txnRef`: Mã tham chiếu giao dịch của VNPAY.
- `bookingId`: UUID của booking liên quan.
- `amount`: Số tiền thanh toán (Ví dụ: `1000000` VNĐ).

#### B. Giao diện trang `/payment/vnpay/return` (Premium UI)

Trang này cần thiết kế ấn tượng (Wow design) sử dụng typography chất lượng cao, bo góc lớn, các khối đổ bóng mờ ảo (glassmorphic / card) và màu sắc tinh tế:

- **Trường hợp `status === 'success'` (Thanh toán thành công)**:

  - Hiển thị icon dấu tích xanh lục lớn (`✅`) có hiệu ứng scale spring động (Framer Motion).
  - Tiêu đề: **Thanh toán thành công!** (Payment Successful!).
  - Lời chúc/Lời nhắn: Cảm ơn bạn đã đặt tour. Chi tiết đặt chỗ đã được gửi về email của bạn.
  - Hộp thông tin giao dịch (Transaction details card):
    - **Mã đặt chỗ (Booking ID)**: Hiển thị 8 ký tự đầu hoặc toàn bộ dạng UUID.
    - **Mã giao dịch VNPAY (Txn Ref)**: `txnRef`
    - **Số tiền thanh toán**: Định dạng tiền tệ VNĐ (ví dụ: `1.000.000 ₫`).
  - Nút hành động:
    - **Quay lại Trang chủ**: Trở về `/`.
    - **Xem danh sách tour**: Trở về trang tìm kiếm sản phẩm.

- **Trường hợp `status !== 'success'` (Thanh toán thất bại / Hủy)**:
  - Hiển thị icon cảnh báo/dấu nhân đỏ lớn (`❌` hoặc `⚠️`) có hiệu ứng rung lắc nhẹ (shake animation).
  - Tiêu đề: **Thanh toán không thành công** (Payment Failed).
  - Lời nhắn: Giao dịch của bạn đã bị hủy hoặc gặp lỗi trong quá trình xử lý. Tài khoản của bạn chưa bị trừ tiền (nếu hủy).
  - Hộp thông tin chi tiết (nếu có): Hiển thị Booking ID và số tiền để tiện đối chiếu.
  - Nút hành động:
    - **Quay lại Trang chủ**.
    - **Thử lại**: Điều hướng người dùng về trang sản phẩm trước đó để mở lại booking sheet thanh toán.

---

## 3. Thay đổi kỹ thuật

### 3.1 Khai báo API Contracts cho VNPAY

#### [NEW] [src/api/payment/types.ts](file:///d:/Remote/web-travel/src/api/payment/types.ts)

Cập nhật interface định nghĩa response cho VNPAY:

```typescript
export interface ApiVnpayCreateUrlResponse {
  data: {
    txnRef: string;
    paymentUrl: string;
  };
  code: number;
  message: string;
  error: string | null;
}
```

#### [MODIFY] [src/api/payment/requests.ts](file:///d:/Remote/web-travel/src/api/payment/requests.ts)

Bổ sung hàm gọi API tạo VNPAY Payment URL:

```typescript
export async function createVnpayPaymentUrl(bookingId: string): Promise<ApiVnpayCreateUrlResponse['data']> {
  const { data } = await request.post<ApiVnpayCreateUrlResponse>(`/payment/vnpay/${bookingId}/create-payment-url`);
  return data.data; // trả về { txnRef, paymentUrl }
}
```

#### [MODIFY] [src/api/payment/queries.ts](file:///d:/Remote/web-travel/src/api/payment/queries.ts)

Bổ sung mutation cho VNPAY URL creation:

```typescript
import { createVnpayPaymentUrl } from './requests';

export const useCreateVnpayPaymentUrl = createMutation<ApiVnpayCreateUrlResponse['data'], { bookingId: string }>({
  mutationFn: ({ bookingId }) => createVnpayPaymentUrl(bookingId),
});
```

---

### 3.2 Cập nhật Component Thanh toán StepPayment

#### [MODIFY] [src/modules/ProductPage/components/booking-sheet/step-payment.tsx](file:///d:/Remote/web-travel/src/modules/ProductPage/components/booking-sheet/step-payment.tsx)

- Nhập hook `useCreateVnpayPaymentUrl` mới.
- Kiểm tra `currency` truyền vào:

  - Nếu `currency === '₫'` hoặc `'VND'`:

    - Chỉ cho phép tạo VNPAY nếu `total >= 1000`. Hiển thị thông báo cảnh báo nếu tổng tiền nhỏ hơn 1,000 VNĐ (giới hạn tối thiểu của VNPAY).
    - Render nút bấm VNPAY Custom:

      ```tsx
      const { mutateAsync: callCreateVnpayUrl, isLoading: isCreatingVnpay } = useCreateVnpayPaymentUrl();

      const handleVnpayCheckout = async () => {
        if (!bookingId) {
          toast.error(t('booking.paymentMissingBookingId'));
          return;
        }
        try {
          const { paymentUrl } = await callCreateVnpayUrl({ bookingId });
          window.location.href = paymentUrl;
        } catch (err) {
          toast.error(t('booking.paymentCreateOrderError'));
        }
      };
      ```

    - Nút VNPAY sử dụng TailwindCSS / CSS tùy chỉnh với lớp style bắt mắt, ví dụ:
      ```tsx
      <button
        onClick={handleVnpayCheckout}
        disabled={isCreatingVnpay}
        className="w-full h-[64px] rounded-[16px] bg-[#0065af] hover:bg-[#005596] active:scale-[0.98] transition-all flex items-center justify-between px-5 shadow-md text-white font-bold"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center flex-shrink-0">
            {/* VNPAY logo hoặc text tắt VN */}
            <span className="text-[14px] font-black text-[#0065af]">VN</span>
          </div>
          <div className="text-left">
            <p className="text-[15px] font-bold text-white leading-snug">VNPAY</p>
            <p className="text-[12px] text-white/80 mt-0.5 leading-none">Quét mã QR hoặc ATM nội địa</p>
          </div>
        </div>
        <span className="text-white/80 text-[18px]">→</span>
      </button>
      ```

---

### 3.3 Tạo trang kết quả thanh toán `/payment/vnpay/return`

#### [NEW] [src/pages/payment/vnpay/return.tsx](file:///d:/Remote/web-travel/src/pages/payment/vnpay/return.tsx)

- Tạo trang kết quả sử dụng Pages router.
- Sử dụng hook `useRouter` của Next.js để đọc các tham số `status`, `txnRef`, `bookingId`, và `amount`.
- Bọc nội dung bằng layout chung (Ví dụ: `MainLayout`).
- Hỗ trợ dịch đa ngôn ngữ cho các text tiêu đề, thông điệp thành công/thất bại thông qua file dịch `productPage.json`.
- Ví dụ khung code React:

  ```tsx
  import React from 'react';
  import { useRouter } from 'next/router';
  import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
  import { useTranslation } from 'next-i18next';
  import { motion } from 'framer-motion';

  export default function VnpayReturnPage() {
    const router = useRouter();
    const { t } = useTranslation('productPage');
    const { status, txnRef, bookingId, amount } = router.query;

    const isSuccess = status === 'success';
    const amountVal = Number(amount) || 0;

    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-black/[0.03]"
        >
          {isSuccess ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto text-4xl mb-6">
                ✅
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
              <p className="text-sm text-gray-500 mb-6">Đơn đặt tour của bạn đã được xác nhận hoàn tất.</p>

              <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-3 text-sm border border-gray-100 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mã đặt chỗ:</span>
                  <span className="font-mono font-medium text-gray-800">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mã giao dịch:</span>
                  <span className="font-mono font-medium text-gray-800">{txnRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Số tiền:</span>
                  <span className="font-bold text-[#0F6E56]">{amountVal.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-4xl mb-6">
                ❌
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h1>
              <p className="text-sm text-gray-500 mb-6">Giao dịch của bạn đã bị hủy hoặc gặp lỗi.</p>
            </div>
          )}

          <button
            onClick={() => router.push('/')}
            className="w-full py-3.5 bg-[#0F6E56] text-white rounded-full font-semibold hover:bg-[#0c5945] transition-colors"
          >
            Quay lại Trang Chủ
          </button>
        </motion.div>
      </div>
    );
  }

  export async function getStaticProps({ locale }: { locale: string }) {
    return {
      props: {
        ...(await serverSideTranslations(locale, ['common', 'productPage'])),
      },
    };
  }
  ```

---

### 3.4 Khai báo thêm bản dịch localization

#### [MODIFY] [public/locales/vi/productPage.json](file:///d:/Remote/web-travel/public/locales/vi/productPage.json)

Bổ sung các nhãn VNPAY:

```json
"booking": {
  ...
  "paymentVnpay": "Thanh toán qua VNPAY",
  "paymentVnpaySubtext": "Quét mã QR hoặc ATM nội địa",
  "paymentVnpayMinLimit": "Số tiền thanh toán VNĐ tối thiểu là 1,000 VNĐ.",
  "paymentSuccessTitle": "Thanh Toán Thành Công!",
  "paymentSuccessMessage": "Đơn đặt tour {{productName}} của bạn đã được xác nhận. Email xác nhận đã được gửi tới bạn.",
  "paymentFailedTitle": "Thanh toán thất bại",
  "paymentFailedMessage": "Đơn hàng của bạn chưa được thanh toán thành công hoặc đã bị hủy bỏ.",
  "paymentTxnRef": "Mã giao dịch",
  "paymentBookingId": "Mã đặt chỗ",
  "paymentAmount": "Số tiền"
}
```

#### [MODIFY] [public/locales/en/productPage.json](file:///d:/Remote/web-travel/public/locales/en/productPage.json)

```json
"booking": {
  ...
  "paymentVnpay": "Pay with VNPAY",
  "paymentVnpaySubtext": "QR Code or Domestic Cards",
  "paymentVnpayMinLimit": "Minimum payment amount is 1,000 VND.",
  "paymentSuccessTitle": "Payment Successful!",
  "paymentSuccessMessage": "Your booking for {{productName}} is confirmed. A receipt has been sent to your email.",
  "paymentFailedTitle": "Payment Failed",
  "paymentFailedMessage": "Your payment transaction was not successful or was cancelled.",
  "paymentTxnRef": "Transaction Ref",
  "paymentBookingId": "Booking ID",
  "paymentAmount": "Amount"
}
```

---

## 4. Dependencies & Conflicts

- **Depends on**: Logic lưu và khởi tạo Booking đã có ở Step 3 (Lưu booking trong store Zustand).
- **Modifies**:
  - Giao diện `StepPayment` (`src/modules/ProductPage/components/booking-sheet/step-payment.tsx`) để hiển thị nút VNPAY.
  - File định nghĩa API `src/api/payment/*` để thêm endpoint mới.
- **Must NOT break**:
  - Giao diện và luồng thanh toán PayPal cho USD.
  - Luồng tạo booking ở các bước 1, 2, 3.

---

## 5. Out of scope

- Logic kiểm định chữ ký IPN (Hoàn toàn do Backend phụ trách khi nhận callback từ VNPAY).
- Xử lý hoàn tiền (Refund) trực tiếp trên Client.

---

## 6. Kế hoạch xác thực (Verification Plan)

### Tài khoản thẻ Sandbox VNPAY test

- **Ngân hàng**: NCB
- **Số thẻ**: `9704198526191432198`
- **Tên chủ thẻ**: `NGUYEN VAN A`
- **Ngày phát hành**: `07/15`
- **Mã OTP**: `123456`

### Các bước kiểm thử thủ công

1. Chọn tour và chọn tùy chọn thanh toán có tiền tệ **VNĐ (₫)** với tổng tiền $\ge$ 1,000 VNĐ.
2. Tại màn hình Payment, kiểm tra xem nút VNPAY có xuất hiện và nút PayPal có bị ẩn đi hay không.
3. Click vào nút VNPAY, kiểm tra trạng thái loading và quá trình redirect sang cổng test của VNPAY Sandbox.
4. Tại VNPAY Sandbox:
   - Nhập thông tin thẻ test bên trên.
   - Nhập OTP `123456`.
5. Đợi VNPAY xử lý và kiểm tra việc redirect về Backend, sau đó Backend redirect tiếp về trang Frontend: `/payment/vnpay/return?status=success&...`
6. Kiểm tra giao diện trang Return có hiển thị đúng thông tin: Mã đặt chỗ, Mã giao dịch, Số tiền đã định dạng VNĐ và nút quay lại Trang chủ.
7. Thử nghiệm trường hợp nhấn Hủy thanh toán trên cổng VNPAY để kiểm tra giao diện Thất bại/Hủy giao dịch.
