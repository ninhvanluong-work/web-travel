# Spec: Tích Hợp Goong Map API Cho Điểm Đón Khách (Booking Pickup Location)

**Trạng thái:** Draft for Review  
**Ngày:** 2026-07-30  
**Scope:** Client Product Page Booking Sheet — `ProductPage/components/booking-sheet`  
**Liên quan:** `step-options.tsx`, `step-review.tsx`, `BookingStore.ts`, `types.ts` (API options), `requests.ts` (API), `GoongAutocomplete.tsx` (New component)

---

## 1. Bối cảnh & Mục tiêu

Trang chi tiết sản phẩm phía Client (`ProductPage`) cung cấp quy trình đặt tour (Booking Flow) qua 4 bước: Info -> Options -> Review -> Payment. Trong bước **2. Options**, người dùng phải chọn điểm đón (**PICKUP LOCATION**).

Hiện tại, hệ thống điểm đón đang gặp một số hạn chế lớn:

- **Danh sách tĩnh, giới hạn:** Chỉ hiển thị danh sách các điểm đón cố định (ví dụ: _Hoan Kiem Lake, Tay Ho Lake, Hanoi Old Quarter_) được lấy từ API backend.
- **Không hỗ trợ Hotel Pickup tự chọn:** Mặc dù gói tour Premium có tính năng "Đón tại khách sạn" (Hotel Pickup), hệ thống chưa có giao diện cho phép khách hàng tự nhập địa chỉ khách sạn của mình ở Việt Nam.
- **Không đo lường vị trí:** Không lưu trữ được tọa độ (`lat`, `lng`) của điểm đón tùy chọn để chuyển giao cho tài xế hoặc hệ thống định vị của bên điều hành tour.
- **Phụ phí thủ công:** Không tự động phát hiện và tính phụ phí đón xe nếu địa điểm của khách nằm quá xa khu vực đón miễn phí của tour.

**Mục tiêu:**
Tích hợp **Goong Map REST APIs** để xây dựng một giải pháp chọn điểm đón thông minh, cao cấp (WOW UI/UX), cho phép tìm kiếm bất kỳ địa điểm nào ở Việt Nam bằng Autocomplete, tính toán phụ phí đón xa tự động bằng Distance Matrix, và tích hợp các cơ chế dự phòng bền vững (Graceful Fallback) để quy trình đặt tour của khách hàng luôn thông suốt ngay cả khi có sự cố API.

---

## 2. Giải Pháp Thiết Kế UI/UX Cao Cấp (WOW UX)

Dựa trên kết quả phiên động não BMad Method, chúng ta sẽ cải tiến giao diện chọn điểm đón với 4 điểm nhấn chính:

### A. Gộp Tìm Kiếm Và Đề Xuất Nhanh (Clickable Chips)

- Thay vì bắt người dùng chọn giữa hai giao diện độc lập, ta hiển thị một khung tìm kiếm Autocomplete duy nhất.
- Ngay dưới ô nhập liệu, hiển thị các điểm đón phổ biến (được cấu hình sẵn từ API hệ thống như Hồ Hoàn Kiếm, Hồ Tây) dưới dạng các **Chips/Badges** nhỏ xinh, bo tròn góc.
- Người dùng chỉ cần nhấp vào Chip để điền nhanh địa điểm mà không cần gõ bàn phím.

### B. Fullscreen Search Overlay trên Mobile (Mobile-Safe Viewports)

- Trên các thiết bị di động, khi người dùng focus vào ô nhập điểm đón, hệ thống sẽ mở ra một **Overlay tìm kiếm toàn màn hình** (giống trải nghiệm của Grab/Be).
- Điều này giúp ngăn chặn tình trạng bàn phím ảo (Virtual Keyboard) của iOS/Android che khuất danh sách gợi ý địa chỉ rớt xuống (dropdown), tạo cảm giác thao tác tự nhiên và cao cấp.

### C. Minh Bạch Phụ Phí (Live Surcharge Breakdown)

- Khi một địa điểm tùy chọn được chọn, hệ thống gọi API để đo khoảng cách.
- Nếu vị trí nằm ngoài bán kính đón miễn phí (ví dụ > 5km từ Tour Hub), hệ thống sẽ hiển thị một thông báo màu cam nhạt ấm áp kèm chi tiết khoảng cách và số tiền phụ thu trực quan:
  `⚠️ Vị trí của bạn cách điểm xuất phát 7.5 km. Phụ thu đón ngoại tỉnh/ngoài vùng: +₫100,000`
- Khoản phụ thu này tự động cộng vào giá trị thanh toán ở Bottom Bar theo thời gian thực để người dùng nắm rõ.

### D. Cơ Chế Lùi Bước An Toàn (Graceful Fallback)

- Nếu người dùng tìm kiếm nhưng Goong không trả về kết quả (địa chỉ quá mới hoặc viết tắt quá nhiều), hoặc Goong API bị mất kết nối/hết quota, hệ thống hiển thị một tùy chọn:
  `"Không tìm thấy địa chỉ? Nhấp vào đây để nhập thủ công"`
- Khi nhấp vào, ô nhập liệu sẽ chuyển thành ô Textarea nhập tự do thông thường, cho phép lưu trực tiếp chuỗi thô của người dùng vào store để bảo đảm đặt tour không bị chặn.

### E. Quy Tắc Ràng Buộc Phụ Phí Đón Khách Theo Gói Tour (Basic vs Premium)

Khách hàng có thể chọn đón tại **địa điểm bất kỳ (ví dụ: khách sạn họ ở)**. Tuy nhiên, mức phí sẽ được tính toán tự động dựa trên loại gói tour (Package Type) mà họ đã chọn ở mục trên:

1.  **Nếu chọn gói Premium (Cao cấp - Đã bao gồm dịch vụ Hotel Pickup):**
    - Hệ thống cho phép chọn điểm đón bất kỳ (khách sạn bất kỳ).
    - **Miễn phí** nếu khoảng cách từ vị trí đón đến điểm xuất phát cố định (Tour Hub) $\le 5$km.
    - Chỉ tính phụ phí đón xa nếu khoảng cách $> 5$km (ví dụ: `+₫20,000 VND / km` vượt quá).
2.  **Nếu chọn gói Basic (Tiêu chuẩn - Mặc định đón tại điểm cố định):**
    - Vẫn cho phép khách hàng tự chọn đón tại khách sạn bất kỳ bằng Goong Autocomplete.
    - **Áp dụng Phí dịch vụ đón riêng tại khách sạn** mặc định (Standard Pickup Surcharge) là `+₫100,000` (hoặc `$5` tùy ngoại tệ).
    - Nếu điểm đón nằm ngoài bán kính 5km, cộng thêm phụ phí đón xa (`+₫20,000 VND / km` vượt quá).

---

## 3. Kiến Trúc Dữ Liệu & API Contracts

### 3.1. Goong REST APIs tích hợp

Chúng ta sử dụng 3 API của Goong (Endpoint: `https://rsapi.goong.io`):

1.  **Place Autocomplete API** (`GET /place/autocomplete`): Trả về danh sách gợi ý vị trí dạng chữ.
2.  **Place Detail API** (`GET /v2/place/detail`): Trả về tọa độ `lat`/`lng` và địa chỉ định dạng chuẩn từ `place_id`.
3.  **Distance Matrix API** (`GET /DistanceMatrix`): Tính khoảng cách đường bộ thực tế giữa Tour Hub và điểm đón tùy chọn.

> [!NOTE]
> Để tiết kiệm chi phí gọi API của Goong, chúng ta bắt buộc sử dụng **Session Token** (UUID v4 sinh ngẫu nhiên khi người dùng mở ô tìm kiếm và làm mới khi chọn xong địa điểm). Session Token sẽ gộp các lượt gõ chữ autocomplete và 1 lượt click lấy chi tiết thành 1 giao dịch tính tiền duy nhất.

### 3.2. Cấu trúc Trạng thái Store (`BookingStore.ts`)

Mở rộng interface `BookingState` hiện tại để quản lý vị trí đón khách chi tiết:

```typescript
export interface CustomPickupLocation {
  placeId: string | 'manual'; // 'manual' dùng cho trường hợp nhập thủ công fallback
  name: string; // Tên địa điểm hoặc tên khách sạn
  formattedAddress: string; // Địa chỉ đầy đủ
  lat: number | null;
  lng: number | null;
  distanceMeter: number; // Khoảng cách đo được từ Tour Hub (mét)
  surcharge: number; // Phụ thu đón xa (VND hoặc USD)
}

interface BookingState {
  // State cũ
  step: 1 | 2 | 3 | 4;
  date: Date | null;
  guests: { adults: number; children: number };
  departureTime: string | null;
  pickupLocation: string | null; // ID điểm cố định (nếu chọn predefined)
  packageType: 'basic' | 'premium' | null;

  // State mới bổ sung cho Goong Map
  pickupType: 'predefined' | 'custom' | null;
  customPickup: CustomPickupLocation | null;
}
```

---

## 4. Đặc Tả Thay Đổi Mã Nguồn

### 4.1. [NEW] Utility File: `src/lib/goong.ts`

Tạo file chuyên dụng đóng gói các cuộc gọi API Goong trên client:

```typescript
import axios from 'axios';

const GOONG_API_URL = 'https://rsapi.goong.io';
const API_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY;

export interface GoongSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const goongService = {
  getSuggestions: async (input: string, sessionToken: string): Promise<GoongSuggestion[]> => {
    if (!input || input.trim().length < 3) return [];
    try {
      const response = await axios.get(`${GOONG_API_URL}/place/autocomplete`, {
        params: {
          api_key: API_KEY,
          input,
          sessiontoken: sessionToken,
        },
      });
      return response.data.predictions || [];
    } catch (e) {
      console.error('[Goong Autocomplete Error]:', e);
      return [];
    }
  },

  getPlaceDetails: async (placeId: string, sessionToken: string) => {
    try {
      const response = await axios.get(`${GOONG_API_URL}/v2/place/detail`, {
        params: {
          api_key: API_KEY,
          place_id: placeId,
          sessiontoken: sessionToken,
        },
      });
      return response.data.result || null;
    } catch (e) {
      console.error('[Goong Place Detail Error]:', e);
      return null;
    }
  },

  getRoadDistance: async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    try {
      const response = await axios.get(`${GOONG_API_URL}/DistanceMatrix`, {
        params: {
          api_key: API_KEY,
          origins: `${origin.lat},${origin.lng}`,
          destinations: `${destination.lat},${destination.lng}`,
          vehicle: 'car',
        },
      });
      return response.data.rows?.[0]?.elements?.[0] || null;
    } catch (e) {
      console.error('[Goong Distance Matrix Error]:', e);
      return null;
    }
  },
};
```

### 4.2. [NEW] Component: `GoongAutocomplete.tsx`

Tạo component xử lý ô tìm kiếm, dropdown kết quả gợi ý và trạng thái fallback thủ công:

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce'; // Hoặc viết nhanh custom debounce
import { goongService, GoongSuggestion } from '@/lib/goong';
import { v4 as uuidv4 } from 'uuid';
import { MapPin, Search, Loader, AlertTriangle, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GoongAutocompleteProps {
  onSelect: (data: { placeId: string; name: string; address: string; lat: number | null; lng: number | null }) => void;
  onClear: () => void;
  defaultValue?: string;
}

export default function GoongAutocomplete({ onSelect, onClear, defaultValue = '' }: GoongAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<GoongSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const sessionTokenRef = useRef('');

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    sessionTokenRef.current = uuidv4();
  }, []);

  useEffect(() => {
    if (isManual || !debouncedQuery || debouncedQuery === defaultValue) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      setLoading(true);
      const res = await goongService.getSuggestions(debouncedQuery, sessionTokenRef.current);
      setSuggestions(res);
      setLoading(false);
    };
    fetchSuggestions();
  }, [debouncedQuery, isManual]);

  const handleSelectSuggestion = async (item: GoongSuggestion) => {
    setLoading(true);
    const detail = await goongService.getPlaceDetails(item.place_id, sessionTokenRef.current);
    if (detail) {
      onSelect({
        placeId: item.place_id,
        name: detail.name,
        address: detail.formatted_address,
        lat: detail.geometry.location.lat,
        lng: detail.geometry.location.lng,
      });
      setQuery(detail.name);
      setSuggestions([]);
      sessionTokenRef.current = uuidv4(); // Reset session cho lần tiếp theo
    }
    setLoading(false);
  };

  const handleManualSave = () => {
    if (query.trim()) {
      onSelect({
        placeId: 'manual',
        name: 'Địa chỉ tự nhập',
        address: query.trim(),
        lat: null,
        lng: null,
      });
    }
  };

  return (
    <div className="w-full relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (isManual)
              onSelect({ placeId: 'manual', name: 'Địa chỉ tự nhập', address: e.target.value, lat: null, lng: null });
          }}
          placeholder={isManual ? 'Nhập chi tiết địa chỉ của bạn...' : 'Tìm tên khách sạn hoặc địa chỉ...'}
          className="w-full pl-10 pr-10 py-3.5 border border-[#E5E5E5] rounded-[14px] text-[14px] focus:outline-none focus:border-[#0F6E56] transition-colors"
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={16} />
        </span>
        {loading && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <Loader size={16} className="animate-spin text-[#0F6E56]" />
          </span>
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {!isManual && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-20 w-full bg-white border border-[#E5E5E5] rounded-[14px] mt-1.5 shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100"
          >
            {suggestions.map((item) => (
              <li
                key={item.place_id}
                onClick={() => handleSelectSuggestion(item)}
                className="flex items-start gap-3 px-4 py-3 hover:bg-[#F9F9F9] cursor-pointer transition-colors text-left"
              >
                <MapPin size={16} className="text-[#0F6E56] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[14px] font-semibold text-[#111]">{item.structured_formatting.main_text}</p>
                  <p className="text-[12px] text-[#666]">{item.structured_formatting.secondary_text}</p>
                </div>
              </li>
            ))}

            {/* Fallback option button */}
            <li
              onClick={() => setIsManual(true)}
              className="flex items-center gap-2.5 px-4 py-3 text-[#0F6E56] hover:bg-[#F0F7F5] cursor-pointer font-medium text-[13px] border-t border-dashed border-[#0F6E56]/20"
            >
              <PenTool size={14} />
              <span>Không tìm thấy khách sạn? Tự nhập tay địa chỉ</span>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 4.3. [MODIFY] Cải tiến `step-options.tsx`

Thay đổi hàm `renderPickupLocations()` để render ô tìm kiếm Goong, các Chips điểm đón cố định và thông báo phụ phí:

```tsx
const pickupType = useBookingStore.use.pickupType();
const setPickupType = useBookingStore.use.setPickupType();
const customPickup = useBookingStore.use.customPickup();
const setCustomPickup = useBookingStore.use.setCustomPickup();
const packageType = useBookingStore.use.packageType(); // Lấy loại gói tour hiện tại (basic / premium)

// Tọa độ trung tâm cố định của Tour (ví dụ: hồ Hoàn Kiếm) để đo khoảng cách phụ phí
const TOUR_HUB_COORDS = { lat: 21.028511, lng: 105.852447 };

const handleSelectCustomLocation = async (data: any) => {
  let distance = 0;
  let surcharge = 0;

  // 1. Gói Basic mặc định phụ thu thêm phí dịch vụ đón riêng tại khách sạn tự chọn
  if (packageType === 'basic') {
    surcharge += 100000; // Phí đón riêng cơ bản cho gói Basic
  }

  // 2. Tính phụ thu khoảng cách đón xa
  if (data.lat && data.lng) {
    // Gọi Goong Distance Matrix API
    const element = await goongService.getRoadDistance(TOUR_HUB_COORDS, { lat: data.lat, lng: data.lng });
    if (element && element.status === 'OK') {
      distance = element.distance.value; // mét
      // Nếu khoảng cách đón xa > 5km: tính phụ thu 20,000 VND / km vượt quá
      if (distance > 5000) {
        surcharge += Math.ceil((distance - 5000) / 1000) * 20000;
      }
    }
  }

  setCustomPickup({
    placeId: data.placeId,
    name: data.name,
    formattedAddress: data.address,
    lat: data.lat,
    lng: data.lng,
    distanceMeter: distance,
    surcharge: surcharge,
  });
};

const renderPickupLocations = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* 2 Tabs chọn hình thức */}
      <div className="grid grid-cols-2 gap-2 bg-[#F0F2F5] p-1 rounded-[12px]">
        <button
          onClick={() => setPickupType('predefined')}
          className={cn("py-2.5 text-[13px] font-semibold rounded-[9px] transition-all",
            pickupType === 'predefined' ? "bg-white text-[#0F6E56] shadow-sm" : "text-[#666]"
          )}
        >
          Điểm đón có sẵn
        </button>
        <button
          onClick={() => setPickupType('custom')}
          className={cn("py-2.5 text-[13px] font-semibold rounded-[9px] transition-all",
            pickupType === 'custom' ? "bg-white text-[#0F6E56] shadow-sm" : "text-[#666]"
          )}
        >
          Đón tại khách sạn (Goong)
        </button>
      </div>

      {pickupType === 'predefined' ? (
        // Hiển thị danh sách radio điểm đón cũ
        <div className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm">
          {pickupLocations.map((point, i) => (
             // Render các nút điểm đón có sẵn...
          ))}
        </div>
      ) : (
        // Hiển thị Ô tìm kiếm Goong Autocomplete
        <div className="flex flex-col gap-3">
          <GoongAutocomplete
            defaultValue={customPickup?.formattedAddress || ''}
            onSelect={handleSelectCustomLocation}
            onClear={() => setCustomPickup(null)}
          />

          {/* Đề xuất nhanh các điểm chính dưới dạng Clickable Chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[12px] text-[#666] mr-1">Gợi ý:</span>
            {pickupLocations.slice(0, 3).map((point) => (
              <button
                key={point.id}
                onClick={() => handleSelectCustomLocation({
                  placeId: point.id,
                  name: point.name,
                  address: point.address || point.name,
                  lat: TOUR_HUB_COORDS.lat, // Mock tọa độ trung tâm cho điểm cố định
                  lng: TOUR_HUB_COORDS.lng
                })}
                className="px-3 py-1.5 bg-[#F0F7F5] text-[#0F6E56] text-[12px] font-semibold rounded-full hover:bg-[#E0EFEA] transition-colors"
              >
                {point.name}
              </button>
            ))}
          </div>

          {/* Cảnh báo khoảng cách & phụ thu nếu có */}
          {customPickup && customPickup.surcharge > 0 && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#FFF4EC] border border-[#FFE0C2] rounded-[12px] p-3.5 flex items-start gap-2.5 text-left"
            >
              <AlertTriangle className="text-[#FF8000] flex-shrink-0 mt-0.5 animate-bounce" size={16} />
              <div>
                <p className="text-[13px] font-bold text-[#D46A00]">Phụ thu đón xe ngoại vùng</p>
                <p className="text-[12px] text-[#804000] mt-0.5 leading-relaxed">
                  Khoảng cách đón khách thực tế là <strong>{(customPickup.distanceMeter / 1000).toFixed(1)} km</strong> (vượt quá 5km từ Hub). Phụ thu đón xe: <strong>+₫{customPickup.surcharge.toLocaleString('vi-VN')}</strong>.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
```

### 4.4. [MODIFY] Tích hợp phụ phí vào Tổng tiền (`index.tsx`)

Tại component [index.tsx](file:///d:/Remote/web-travel/src/modules/ProductPage/components/booking-sheet/index.tsx), cập nhật cách tính tổng tiền ở Bottom Bar:

```typescript
const customPickup = useBookingStore.use.customPickup();
const pickupType = useBookingStore.use.pickupType();

// Cộng thêm phụ phí đón xe (surcharge) của Goong vào tổng hóa đơn
const goongSurcharge = pickupType === 'custom' && customPickup ? customPickup.surcharge : 0;

const estimatedTotal = guests.adults * effectiveAdultPrice + guests.children * effectiveChildPrice;
const runningTotal =
  guests.adults * (effectiveAdultPrice + premiumSurcharge) +
  guests.children * (effectiveChildPrice + premiumSurcharge * 0.5) +
  goongSurcharge; // Cộng phụ phí Goong
```

---

## 5. Kế hoạch xác minh & kiểm thử (Verification Plan)

### Kiểm thử tự động (Automated Tests):

- Sử dụng Jest để kiểm tra helper `goong.ts`:
  - Mock các kết quả trả về của API Goong (Autocomplete và Distance Matrix).
  - Viết unit test kiểm chứng logic tính khoảng cách và tỷ lệ phụ thu ($> 5$km tính phụ phí, $\le 5$km miễn phí).
- Viết test kiểm chứng cơ chế **Graceful Fallback**:
  - Khi mô phỏng API Autocomplete trả về lỗi mạng, kiểm tra xem nút kích hoạt chế độ "Tự nhập tay" có hiển thị và hoạt động chính xác không.

### Kiểm thử thủ công (Manual Verification):

1.  **Kiểm tra UX Autocomplete:** Mở Console mạng, gõ tìm các từ khóa khách sạn tại Hà Nội (ví dụ: _InterContinental Westlake_, _Sofitel Legend Metropole_) xem thời gian phản hồi, trạng thái loading và độ chuẩn xác của danh sách gợi ý.
2.  **Kiểm tra layout trên Mobile:** Chạy project trên giả lập thiết bị di động (Chrome DevTools). Focus vào thanh tìm kiếm, xác nhận dropdown danh sách gợi ý hiển thị rõ ràng, không bị bàn phím che khuất.
3.  **Kiểm thử phụ phí:** Chọn khách sạn cách điểm trung tâm dưới 5km (ví dụ: _Tràng Tiền Plaza_) -> kiểm tra phụ phí hiển thị $0$. Chọn một địa chỉ ở ngoại thành (ví dụ: _Cầu Giấy hoặc Mỹ Đình, cách > 6km_) -> xác nhận bảng thông tin phụ phí màu cam xuất hiện và giá tiền tổng cộng ở Bottom Bar tăng tương ứng.
