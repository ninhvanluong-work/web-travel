# Spec: Đồng Bộ & Tối Ưu Hóa Các Trường Dữ Liệu Product Admin — So Sánh Client vs Admin Form

**Trạng thái:** Draft for Review  
**Ngày:** 2026-05-21  
**Scope:** Admin Product Management — `AdminProduct/ProductFormPage` & Client `ProductPage`  
**Liên quan:** `ProductFormPage/index.tsx`, `useProductForm.ts`, `product.ts` (validation), `requests.ts` (API), `ProductPage/index.tsx` (Client), `ProductPage/adapter.ts` (Client Adapter), `use-product-draft.ts` (Auto-save)

---

## 1. Bối cảnh & Mục tiêu

Trang chi tiết sản phẩm phía Client (`ProductPage`) hiển thị rất nhiều thông tin phong phú của một Tour du lịch để thu hút khách hàng. Tuy nhiên, hệ thống quản trị phía Admin (`AdminProduct/ProductFormPage`) hiện đang gặp tình trạng lệch pha dữ liệu nghiêm trọng:

- **Thiếu trường dữ liệu thiết yếu:** Một số thông tin Client hiển thị rất trang trọng (như Hướng dẫn viên - Tour Guide, Mô tả ngắn - Short Description) nhưng Admin hoàn toàn không có trường để nhập hay gán.
- **Lỗi logic lưu trữ (Bỏ quên mapping):** Một số thông tin Admin có giao diện nhập liệu rất chi tiết (như Lịch trình - Itineraries) nhưng khi lưu lại không được gửi lên API, hoặc khi tải dữ liệu cũ lại không hiển thị lên form.
- **Giao diện thừa / Không hoạt động / File rác / Cần tối giản:**
  - Một số tính năng được vẽ ra hoành tráng ở Admin (như Gói giá - Options) nhưng Backend API không lưu và Client cũng chỉ hiển thị một giá bán duy nhất (`minPrice`).
  - Các file components rác (`RelationCard.tsx`, `pricing-section.tsx`) được viết ra nhưng hoàn toàn không được import sử dụng trên giao diện.
  - Người dùng mong muốn **tối giản hóa tối đa trang nhập liệu**: ẩn mô tả chi tiết tour (description), ẩn thời lượng (duration) & đơn vị tính (durationType), và chuyển sang sử dụng mô tả ngắn (shortDescription) dạng Textarea gọn nhẹ hơn.
- **Bổ sung Section Tag sản phẩm thông minh:** Khách hàng muốn quản lý nhãn sản phẩm (Tags) một cách trực quan thông qua một Section riêng biệt nằm ở giữa mục Video và Mô tả tổng quan. Hệ thống tag này hỗ trợ tìm kiếm gợi ý từ dữ liệu tĩnh mock trước và cho phép **tạo nhanh tag mới** ngay tại chỗ nếu chưa có trong danh sách gợi ý.

**Mục tiêu:** So sánh đối chiếu toàn diện giữa Client và Admin, từ đó lên kế hoạch tối ưu: **bổ sung những gì thiếu, sửa chữa những gì lỗi, kiên quyết loại bỏ những gì dư thừa/dead-code/cồng kềnh** để trang quản trị Admin đạt trạng thái đầy đủ, hoạt động chính xác 100% và gọn gàng nhất.

---

## 2. Bảng Đối Chiếu Toàn Diện: Client vs Admin Form

Dưới đây là bảng phân tích chi tiết từng section hiển thị trên Client và khả năng quản lý tương ứng ở Admin Form hiện tại sau khi đã tinh chỉnh tối giản:

| STT     | Section hiển thị ở Client            | API Field liên quan                 | Trạng thái ở Admin Form hiện tại                                                                                                           | Đánh giá & Hướng xử lý                                                                                                                                                                                                                                                                                                                                             |
| :------ | :----------------------------------- | :---------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**   | **Hero Banner (Ảnh/Video)**          | `banner`, `thumbnail`               | Có tab Banner hỗ trợ nhập link banner. (Sắp tới sẽ tích hợp upload video Bunny CDN & Kéo thả).                                             | **Hoạt động tốt** (Sẽ tối ưu theo Spec Bunny Video).                                                                                                                                                                                                                                                                                                               |
| **2**   | **Tag sản phẩm (Tags)**              | `tags`                              | Chưa có section riêng, nằm rải rác.                                                                                                        | ✨ **Cải tiến thông minh:** Bổ sung **Section Tag sản phẩm** độc lập vào giữa Video và Tổng quan. Hỗ trợ multi-select, gợi ý tìm kiếm, và tạo tag động nếu chưa tồn tại.                                                                                                                                                                                           |
| **3**   | **Header (Tên tour)**                | `name`                              | Có các trường nhập liệu tương ứng trong form.                                                                                              | **Đồng bộ tốt**.                                                                                                                                                                                                                                                                                                                                                   |
| **4**   | **Header (Mô tả ngắn)**              | `shortDescription`                  | 🚫 **Chưa có trên UI:** Zod Schema đã có sẵn trường này nhưng UI chưa hiển thị.                                                            | ⚠️ **Thiếu hụt:** Client hiển thị mô tả ngắn ngay dưới tên sản phẩm để thu hút khách hàng.<br>**👉 Giải pháp:** Thêm trường `shortDescription` (dạng Textarea, max 500 ký tự) thay thế cho Rich Text Editor `description` ở dưới cùng.                                                                                                                             |
| **5**   | **Mô tả chi tiết tour**              | `description`                       | Có Rich Text Editor của TinyMCE dưới cùng.                                                                                                 | ❌ **Cồng kềnh & Dư thừa:** Khách hàng không muốn nhập mô tả dài rườm rà, muốn tối giản hóa giao diện.<br>**👉 Giải pháp:** Ẩn hoàn toàn Rich Text Editor của `description` khỏi giao diện Admin Form.                                                                                                                                                             |
| **6**   | **Thời lượng & Đơn vị tính**         | `duration`, `durationType`          | Có 2 trường nhập Thời lượng và đơn vị tính (Ngày/Đêm/Giờ).                                                                                 | ❌ **Rườm rà:** Khách hàng muốn ẩn hai trường này khỏi giao diện Admin để tinh gọn trang quản trị.<br>**👉 Giải pháp:** Ẩn khỏi giao diện form. Schema giữ giá trị mặc định (`duration: 1`, `durationType: 'day'`) gửi ngầm lên API.                                                                                                                               |
| **7**   | **Chính sách hủy (Cancellation)**    | Không có                            | Có 2 trường `isFreeCancellation` và `cancellationDeadlineHours` trong Zod Schema nhưng không hoạt động.                                    | ❌ **Thừa & Lỗi:** Client luôn hiển thị cứng _"Free cancellation up to 24h before"_. Admin có trường nhưng không lưu được lên API.<br>**👉 Giải pháp:** Xóa bỏ 2 trường này khỏi Admin Form/Schema để tránh nhầm lẫn.                                                                                                                                              |
| **8**   | **Thông tin nhanh (Quick Facts)**    | `elements` (mảng đối tượng ID/Name) | Có Object `elements` trong form nhưng hoạt động chưa tối ưu với API.                                                                       | ✨ **Cải tiến lớn:** Chuyển vị trí ngay dưới Mô tả sản phẩm. Giới hạn 9 elements (`difficulty`, `language`, `departure`, `groupSize`, `duration`, `pickup`, `dropOff`, `day`, `night`). Hỗ trợ tìm kiếm select & thêm mới động, time picker chọn giờ, và chỉ cho phép số ở các trường định lượng. Đồng bộ truyền mảng IDs (`elementIds` / `elementsId`) xuống API. |
| **9**   | **Trải nghiệm nổi bật (Highlights)** | `experience`                        | Có trường `experiences` (imageUrl, title, content) trong form và map chuẩn sang API.                                                       | **Đồng bộ tốt**.                                                                                                                                                                                                                                                                                                                                                   |
| **9.5** | **Hình ảnh sản phẩm**                | `images`                            | Có `ImagesSection` để nhập nhiều hình ảnh.                                                                                                 | ⚠️ **Tạm ẩn:** Tạm thời comment out/ẩn khỏi UI Admin vì Client chưa cần hiển thị trường này. Giữ nguyên schema và request mapper.                                                                                                                                                                                                                                  |
| **10**  | **USP (Điểm độc đáo in nghiêng)**    | `highlight`                         | Có trường `highlight` (Điểm nhấn nổi bật) ở tab Thông tin chung nhưng chưa tối ưu.                                                         | ✨ **Cải tiến:** Chuyển sang sử dụng `TextArea` và đưa trực tiếp vào **Section Mô tả sản phẩm** (đặt cạnh Mô tả ngắn `shortDescription` theo bố cục 2 cột rất đẹp).                                                                                                                                                                                                |
| **11**  | **Nhà cung cấp (Operator)**          | `supplier`                          | Có dropdown chọn Nhà cung cấp (`supplierId`) trong BasicInfoSection.                                                                       | **Đồng bộ tốt**.                                                                                                                                                                                                                                                                                                                                                   |
| **12**  | **Hướng dẫn viên (Tour Guide)**      | `tourGuides`                        | 🚫 **HOÀN TOÀN KHÔNG CÓ** trường hay dropdown nào để chọn Tour Guide cho sản phẩm!                                                         | ⚠️ **Thiếu hụt lớn:** Client hiển thị thông tin Guide rất đẹp nhưng Admin không thể gán Guide cho Tour.<br>**👉 Giải pháp:** Bổ sung dropdown chọn Tour Guide trực tiếp vào `BasicInfoSection.tsx` (Tổng quan) bên cạnh trường chọn Nhà cung cấp.                                                                                                                  |
| **13**  | **Lịch trình (Itinerary)**           | `itineraries`                       | Có `TimeItinerarySection` để nhập chi tiết theo ngày, nhưng **không hiển thị dữ liệu cũ khi Edit và không lưu được khi Save!**             | 🛑 **Lỗi nghiêm trọng (Bug):** <br>1. Khi load trang Edit: Không gán dữ liệu từ API vào state `itineraries`. <br>2. Khi Submit: Hàm `toApiPayload` trong `requests.ts` bỏ quên không gửi `itineraries` lên API.<br>**👉 Giải pháp:** Sửa đổi `useProductForm.ts` và `requests.ts` để đồng bộ và lưu trữ lịch trình chính xác.                                      |
| **14**  | **Included / Not Included**          | `include`, `exclude`                | Có trường nhập dạng chuỗi ngăn cách bằng dấu phẩy.                                                                                         | **Đồng bộ tốt**.                                                                                                                                                                                                                                                                                                                                                   |
| **15**  | **Lưu ý trước khi đặt**              | `readBefore`                        | Có `ReadBeforeSection` trong form và map chuẩn sang API.                                                                                   | **Đồng bộ tốt**.                                                                                                                                                                                                                                                                                                                                                   |
| **16**  | **Gói giá (Pricing/Options)**        | `minPrice`                          | Có tab "Gói giá & Tình trạng" (`OptionsSection`) cực kỳ phức tạp để nhập nhiều gói giá, nhưng API không lưu và Client cũng không hiển thị. | ❌ **Dư thừa lớn:** Client chỉ dùng duy nhất trường `minPrice` (Giá nhỏ nhất) ở tab Thông tin chung để hiển thị giá bán. Tab Gói giá hoàn toàn không có tác dụng thực tế.<br>**👉 Giải pháp:** Tạm ẩn/Comment out tab "Gói giá & Tình trạng" (`OptionsSection`) khỏi giao diện Admin Form (không xóa file code).                                                   |

---

## 3. Đặc Tả Chi Tiết Các Thay Đổi & Giải Pháp Kỹ Thuật

### 3.1. [XÓA BỎ DƯ THỪA & COMMENT OUT] Tạm ẩn tab Gói giá (`OptionsSection`), các trường Cancellation không hoạt động, các file components rác và các trường rườm rà trên UI

Để tối giản hóa trang Admin theo yêu cầu của khách hàng, chúng ta sẽ thực hiện:

1.  **Tạm ẩn/Comment out Tab "Gói giá & Tình trạng"**:
    - Không xóa bỏ file `src/modules/AdminProduct/ProductFormPage/components/sections/options-section.tsx` và `options-grid-table.tsx`.
    - Trong file `src/modules/AdminProduct/ProductFormPage/index.tsx`, comment out import `OptionsSection` và phần render `<SectionCard id="section-pricing" ...>`.
    - Trong `NAV_SECTIONS` của `index.tsx`, comment out dòng `{ id: 'section-pricing', label: 'Gói giá', ... }`.
2.  **Xóa bỏ hoàn toàn các file components rác (Dead code)**:
    - [DELETE] `src/modules/AdminProduct/ProductFormPage/components/sidebar/RelationCard.tsx`
    - [DELETE] `src/modules/AdminProduct/ProductFormPage/components/sections/pricing-section.tsx`
      (Các file này được viết nháp từ trước nhưng hoàn toàn không được sử dụng ở bất kỳ đâu trong codebase).
3.  **Ẩn các trường cồng kềnh/rườm rà khỏi giao diện Form (`BasicInfoSection.tsx`)**:
    - **Ẩn/Xóa bỏ Rich Text Editor của `description`** (Mô tả chi tiết tour) ở dưới cùng.
    - **Ẩn/Xóa bỏ trường `duration`** (Thời lượng) và **`durationType`** (Đơn vị tính).
4.  **Dọn dẹp & Giữ giá trị mặc định trong Zod Schema & API Payload (`src/lib/validations/product.ts` & `requests.ts`)**:
    - Giữ lại `optionSchema` và `OptionFormValues` trong code để tránh lỗi compile nếu có tham chiếu, nhưng không render trên UI.
    - Trong `productSchema`, loại bỏ các trường `isFreeCancellation` và `cancellationDeadlineHours`.
    - Để tránh lỗi API Backend (do Backend yêu cầu bắt buộc `duration` và `durationType`), chúng ta sẽ **giữ nguyên** cấu hình validation của hai trường này trong Zod Schema, nhưng thiết lập **giá trị mặc định an toàn** là `duration: 1` và `durationType: 'day'`:
      ```typescript
      duration: z.coerce.number().int().min(1).default(1),
      durationType: z.string().default('day'),
      ```
      Như vậy, khi form gửi đi, React Hook Form sẽ tự động điền các giá trị mặc định này mà không cần người dùng nhập liệu trên UI.
5.  **Dọn dẹp `useProductForm.ts`**:
    - Loại bỏ state `options` và `setOptions`.
    - Xóa bỏ logic phục hồi bản nháp thủ công liên quan đến `options`.
6.  **Tạm ẩn/Comment out Section Hình ảnh sản phẩm (`ImagesSection`)**:
    - Vì phía Client hiện tại chưa cần đến trường hình ảnh sản phẩm này, chúng ta sẽ tạm ẩn nó khỏi giao diện quản trị Admin để làm gọn form hơn nữa.
    - **Trong `ProductFormPage/index.tsx`**:
      - Comment out phần tử `section-images` trong mảng `NAV_SECTIONS` để ẩn link ở sidebar.
      - Comment out card hiển thị `<SectionCard id="section-images" ...>` trong danh sách content.
    - **Giữ nguyên Schema & Types**: Chúng ta không xóa trường `images` hay `itineraryImage` trong schema hoặc requests để đảm bảo không phát sinh bất kỳ lỗi Typescript hay phá vỡ tính tương thích ngược với API.

---

### 3.2. [BỔ SUNG THIẾU HỤT & DI CHUYỂN] Tích hợp Hướng dẫn viên (Tour Guide), Mô tả ngắn (Short Description) dạng Textarea và Điểm độc đáo (highlight) dạng Textarea

1.  **Cập nhật Zod Schema (`src/lib/validations/product.ts`)**:
    - Thêm trường `tourGuideId` vào `productSchema`:
      ```typescript
      tourGuideId: z.string().uuid('Hướng dẫn viên không hợp lệ').optional().nullable(),
      ```
    - Trường `highlight` và `shortDescription` đã có sẵn trong schema, sẵn sàng sử dụng.
2.  **Định nghĩa Danh sách Hướng dẫn viên Mock (`src/api/product/lookup.ts`)**:
    - Mock danh sách 3 Tour Guide tiêu biểu có đầy đủ thông tin:
      ```typescript
      export const MOCK_TOUR_GUIDES = [
        { id: '4e9d73d6-4eb1-4d37-8828-090c29f4a081', name: 'Nguyễn Văn Hướng Dẫn' },
        { id: '7a2c4e5f-1db2-4a37-b9c1-ef0289fd1023', name: 'Trần Thị Trải Nghiệm' },
        { id: '9d8e7c6b-5a4f-3e2d-1c0b-ef9876543210', name: 'Lê Anh Khám Phá' },
      ];
      ```
3.  **Cập nhật API Payload & Mapping (`src/api/product/requests.ts` & `use-product-form.ts`)**:
    - Trong `toApiPayload`:
      - gửi thêm `tourGuideId: values.tourGuideId || undefined`.
      - gửi thêm `shortDescription: values.shortDescription || undefined`.
      - gửi thêm `highlight: values.highlight || undefined`.
      - gửi `description: undefined` (vì đã ẩn khỏi form).
    - Trong `use-product-form.ts` (khi load dữ liệu cũ):
      ```typescript
      tourGuideId: productData.tourGuides?.[0]?.id ?? null,
      shortDescription: productData.shortDescription ?? null,
      highlight: productData.highlight ?? '',
      ```
4.  **Tích hợp UI Dropdown chọn Tour Guide vào `BasicInfoSection.tsx`**:
    - Chúng ta sẽ thay đổi bố cục hàng chứa dropdown trong `BasicInfoSection.tsx` để tích hợp trường chọn Tour Guide một cách cân đối:
      - **Hàng 2 hiện tại:** `supplierId` (Nhà cung cấp) và `slug` (Đường dẫn).
      - **Thiết kế mới:** Chúng ta sẽ đưa `slug` (Đường dẫn) lên hàng 1 (đặt cạnh `name` - Tên tour rất hợp lý vì slug tự động sinh từ tên). Hàng 2 sẽ dành riêng cho 3 dropdowns quan trọng liên quan đến thực thể: **Danh mục (Điểm đến) | Nhà cung cấp | Hướng dẫn viên** (Chia làm 3 cột bằng grid `grid-cols-3` hoặc flex `flex-1`).
      - Mã nguồn FormField chọn Hướng dẫn viên:
        ```tsx
        <FormField
          control={control}
          name="tourGuideId"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[13px] text-slate-500 font-medium">Hướng dẫn viên</FormLabel>
              <Select onValueChange={(v) => field.onChange(v || null)} value={field.value ?? undefined}>
                <FormControl>
                  <SelectTrigger
                    inputSize="sm"
                    className="w-full bg-slate-50/50 border-slate-200 shadow-none hover:bg-slate-50 transition-colors"
                  >
                    <SelectValue placeholder="Chọn hướng dẫn viên" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Không chọn</SelectItem>
                  {MOCK_TOUR_GUIDES.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        ```
5.  **Tích hợp UI Mô tả ngắn (`shortDescription`) và Điểm độc đáo (`highlight`) dạng Textarea song song**:

    - Chúng ta sẽ thay thế hoàn toàn Rich Text Editor của `description` bằng một bố cục grid 2 cột (`grid-cols-1 md:grid-cols-2`) chứa hai trường Textarea rất cân xứng và đẹp mắt ở cuối section Mô tả sản phẩm (`BasicInfoSection.tsx` / `section-overview`):
      - **Cột 1 (Mô tả ngắn - `shortDescription`):** Giới hạn tối đa 500 ký tự, placeholder `"Short description of the tour..."`.
      - **Cột 2 (What makes this product different - `highlight`):** Cho phép nhập các điểm nổi bật độc đáo (ví dụ: `"Visit cave, swimming..."`), placeholder `"Điểm độc đáo làm nên sự khác biệt (Hiển thị dạng chữ in nghiêng)..."`, sử dụng style `italic` để tăng tính trực quan.
    - Mã nguồn FormFields:

      ```tsx
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
        <FormField
          control={control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[13px] text-slate-500 font-medium">Mô tả ngắn</FormLabel>
              <FormControl>
                <TextArea
                  placeholder="Short description of the tour..."
                  className="min-h-[120px] resize-none bg-slate-50/20 border-slate-200 focus:bg-white transition-colors rounded-xl shadow-theme-xs"
                  maxLength={500}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="highlight"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[13px] text-slate-500 font-medium">
                What makes this product different?
              </FormLabel>
              <FormControl>
                <TextArea
                  placeholder="Điểm độc đáo làm nên sự khác biệt (Hiển thị dạng chữ in nghiêng)..."
                  className="min-h-[120px] resize-none bg-slate-50/20 border-slate-200 focus:bg-white transition-colors rounded-xl shadow-theme-xs italic font-medium text-slate-700"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      ```

---

### 3.3. [TÍNH NĂNG MỚI] Bổ sung Section Tag Sản Phẩm Thông Minh (Product Tags Section)

Để quản trị nhãn sản phẩm linh hoạt và chuyên nghiệp, chúng ta sẽ xây dựng một Section Tag Sản phẩm độc lập đặt ở giữa **Video sản phẩm** và **Mô tả sản phẩm**.

1.  **Vị trí Bố cục & Navigation (`ProductFormPage/index.tsx`)**:
    - Thêm `section-tags` vào `NAV_SECTIONS` ở giữa Video và Tổng quan:
      ```typescript
      const NAV_SECTIONS = [
        { id: 'section-banner', label: 'Video Sản phẩm', icon: Tv },
        { id: 'section-tags', label: 'Tag sản phẩm', icon: Tag }, // Sử dụng icon Tag từ lucide-react
        { id: 'section-overview', label: 'Mô tả sản phẩm', icon: FileText },
        ...
      ];
      ```
    - Render SectionCard Tag sản phẩm trong danh sách Content chính:
      ```tsx
      <SectionCard id="section-tags" label="Tag sản phẩm">
        <TagsSection />
      </SectionCard>
      ```
2.  **Định nghĩa Danh sách Tag Mock (`src/api/product/lookup.ts` hoặc trực tiếp trong component)**:
    - Do API Backend chưa hỗ trợ lookup tags, chúng ta định nghĩa mảng tĩnh `MOCK_TAGS` để phục vụ danh sách gợi ý (list tag trả về `{ id, name }`):
      ```typescript
      export const MOCK_TAGS = [
        { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Hehe' },
        { id: 'a1b2c3d4-1111-2222-3333-444455556666', name: 'Mountain' },
        { id: 'b2c3d4e5-2222-3333-4444-555566667777', name: 'Best Seller' },
        { id: 'c3d4e5f6-3333-4444-5555-666677778888', name: 'Free Cancellation' },
        { id: 'd4e5f6a7-4444-5555-6666-777788889999', name: 'Popular' },
        { id: 'e5f6a7b8-5555-6666-7777-888899990000', name: 'Family Friendly' },
        { id: 'f6a7b8c9-6666-7777-8888-999900001111', name: 'Adventure' },
      ];
      ```
3.  **Tối ưu Validation & API Payload Mapping (`src/lib/validations/product.ts` & `requests.ts`)**:
    - **Zod Schema:** Form vẫn quản lý mảng tags chứa đầy đủ thông tin `{ id, name }` để render UI mượt mà, đồng thời phục hồi nháp hoàn hảo.
      ```typescript
      tags: z.array(z.object({ id: z.string(), name: z.string() }))
        .optional()
        .default([]);
      ```
    - **API Payload (`toApiPayload`):** Chuyển đổi mảng tags thành mảng chứa danh sách các ID (`tagsId` và `tagIds`) để truyền xuống Backend:
      ```typescript
      tagsId: values.tags?.length ? values.tags.map((t) => t.id) : undefined,
      tagIds: values.tags?.length ? values.tags.map((t) => t.id) : undefined,
      ```
    - **Hàm load dữ liệu cũ (`use-product-form.ts`):**
      ```typescript
      tags: (productData.tags ?? []).map((t) => ({ id: t.id, name: t.name })),
      ```
4.  **Kiến trúc Component Tag thông minh (`TagsSection.tsx`)**:
    - **Hiển thị Badge:** Render danh sách tag đã chọn dạng Badge nổi bật có nút `x` để xóa nhanh.
    - **Hộp gợi ý Auto-complete thông minh:**
      - Khi gõ từ khóa -> Lọc danh sách `MOCK_TAGS` chưa được chọn để gợi ý.
      - **Tạo Tag động (Create Tag Button):** Nếu từ khóa người dùng nhập không trùng khớp hoàn toàn với bất kỳ tag nào có sẵn trong Mock, dropdown gợi ý sẽ hiển thị nút: **`+ Tạo tag mới: "[Từ khóa]"`** (Create tag). Khi bấm nút hoặc nhấn `Enter`, hệ thống tự động sinh một UUID ngẫu nhiên bằng `crypto.randomUUID()`, thêm tag `{ id: uuid, name: từ_khóa }` vào mảng `tags` của React Hook Form và xóa từ khóa đang gõ để sẵn sàng cho lần chọn tiếp theo.
    - **Tags được chọn nhiều trong sản phẩm (Popular Tags):**
      - Hiển thị một danh sách các tag phổ biến thường được chọn (ví dụ: `Mountain`, `Best Seller`, `Free Cancellation`, `Popular`, `Family Friendly`) dưới dạng các Outline Badge nằm trực quan ngay dưới input tìm kiếm.
      - Người dùng có thể click trực tiếp vào các badge này để bật/tắt (toggle) chọn tag đó nhanh chóng mà không cần phải gõ tìm kiếm. Badge đang chọn sẽ được highlight bằng màu tím Brand nổi bật.

---

### 3.4. [SỬA LỖI LOGIC] Đưa Lịch trình (Itineraries) trực tiếp vào React Hook Form & Tối ưu Auto-save

Thay vì sử dụng React State ngoài (`useState`) độc lập trong `useProductForm.ts`, giải pháp kiến trúc xuất sắc nhất chính là **đưa hẳn mảng `itineraries` vào trong Zod Schema của `productSchema`** và sử dụng **`useFieldArray`** của React Hook Form.

#### Lợi ích vượt trội:

- **Tự động hóa 100% việc lưu/phục hồi bản nháp (Draft Auto-save)**: Cả lịch trình sẽ tự động được lưu và phục hồi thông qua hàm `form.getValues()` và `form.reset(...)` mà không cần viết thêm dòng code đồng bộ thủ công hay lưu giữ state ngoài nào!
- **Không cần map thủ công khi Submit**: Dữ liệu lịch trình nằm sẵn trong mảng form và tự động được gửi đi trong `onSubmit`.
- **Typescript an toàn tuyệt đối** và code cực kỳ ngắn gọn, sạch sẽ.

#### Các bước triển khai:

1.  **Cập nhật Zod Schema (`src/lib/validations/product.ts`)**:
    - Đưa `itineraries` trực tiếp vào `productSchema`:
      ```typescript
      itineraries: z.array(itinerarySchema).optional().default([]),
      ```
2.  **Cấu trúc lại `useProductForm.ts`**:
    - **Xóa bỏ hoàn toàn** state `const [itineraries, setItineraries] = useState(...)`.
    - Trong `DEFAULT_VALUES`, gán `itineraries: []`.
    - Khi load dữ liệu cũ trong `useEffect`, chỉ cần reset form như bình thường, React Hook Form sẽ tự động map mảng `itineraries` từ API:
      ```typescript
      form.reset({
        ...
        itineraries: (productData.itineraries ?? []).map((it) => ({
          id: it.id,
          name: it.name,
          featuredName: it.featuredName ?? '',
          order: it.order,
          description: it.description ?? '',
        })),
      });
      ```
3.  **Đơn giản hóa hook Auto-save `src/hooks/use-product-draft.ts`**:
    - Loại bỏ các tham số `itineraries` và `options` khỏi hàm `useProductDraft` (chỉ nhận `productId` và `form`).
    - Xóa bỏ `itineraries` và `options` khỏi interface `DraftData`.
    - Trong hàm `restoreDraft()`, thay vì trả về object chứa itineraries/options để trang ngoài gán vào state, chỉ cần gọi `form.reset(draft.formValues)` và trả về `true`/`false`.
4.  **Cập nhật `ProductFormPage/index.tsx`**:
    - Xóa bỏ state `itineraries`, `options`, `setItineraries`, `setOptions`.
    - Gọi component `<TimeItinerarySection />` không cần truyền các props state ngoài nữa (React Hook Form sẽ tự xử lý nội bộ).
    - Cập nhật `handleRestoreDraft` cực kỳ ngắn gọn:
      ```typescript
      function handleRestoreDraft() {
        draft.restoreDraft();
        setShowDraftBanner(false);
      }
      ```
5.  **Cấu trúc lại `TimeItinerarySection.tsx`**:
    - Thay đổi component nhận `control` của react-hook-form và sử dụng `useFieldArray`:
      ```typescript
      const { fields, append, remove, move } = useFieldArray({
        control,
        name: 'itineraries',
      });
      ```
    - Xử lý dragover & reorder cực kỳ mượt mà thông qua hàm `move(from, to)` tích hợp sẵn của `useFieldArray`:
      ```typescript
      const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        const from = dragIndex.current;
        if (from === null || from === index) return;
        move(from, index);
        dragIndex.current = index;
        setOpenIndex(index);
      };
      ```
6.  **Cập nhật API Mapping (`src/api/product/requests.ts`)**:

    - Cập nhật `toApiPayload` để gán mảng `itineraries` từ values của form, phân biệt giữa trường hợp Tạo mới (Create - bỏ ID) và Cập nhật (Update - truyền ID):
      ```typescript
      function toApiPayload(values: ProductFormValues, isUpdate = false) {
        return {
          ...
          itineraries: values.itineraries?.length
            ? values.itineraries.map((it) => ({
                id: isUpdate && it.id ? it.id : undefined, // Tạo mới bỏ id, cập nhật giữ id
                name: it.name,
                featuredName: it.featuredName || undefined,
                order: Number(it.order),
                description: it.description || '',
              }))
            : undefined,
        };
      }
      ```
    - Cập nhật hàm `createProduct` và `updateProduct` để truyền tham số `isUpdate` tương ứng:

      ```typescript
      export async function createProduct(values: ProductFormValues): Promise<ApiProductDetail> {
        const { data } = await request.post<{ data: ApiProductDetail }>('/product', toApiPayload(values, false));
        return data.data;
      }

      export async function updateProduct(id: string, values: ProductFormValues): Promise<ApiProductDetail> {
        const { data } = await request.patch<{ data: ApiProductDetail }>(`/product/${id}`, toApiPayload(values, true));
        return data.data;
      }
      ```

### 3.5. [CẢI TIẾN LỚN] Cấu Trúc Lại Section Thông Tin Nhanh (Elements / Quick Facts) Thành Builder Động (Dynamic Facts Builder)

Để hiển thị thông tin thực tế đồng bộ 100% với Client (nơi hiển thị Fact Sheet gồm Thời lượng chi tiết, Điểm đi, Đón/Trả khách, Quy mô nhóm, Ngôn ngữ, Độ khó), chúng ta sẽ thiết kế lại toàn bộ Section **Thông tin nhanh** thành một **Dynamic Facts Builder** sử dụng `useFieldArray` của React Hook Form và di chuyển vị trí của nó trên Form.

Người dùng sẽ chọn từ 9 loại thông tin (select ra) và điền/chọn giá trị tương ứng thay vì hiển thị cả 9 trường cố định.

#### 1. Thay đổi Vị trí Bố cục & Navigation

- **Vị trí mới:** Đặt ngay bên dưới section **Mô tả sản phẩm** (`section-overview`).
- **Thứ tự trong `NAV_SECTIONS` & Content:**
  1. Video Sản phẩm (`section-banner`)
  2. Tag sản phẩm (`section-tags`)
  3. Mô tả sản phẩm (`section-overview`)
  4. **Thông tin nhanh** (`section-quick-facts`) _<-- Vị trí mới chuyển lên đây_
  5. Trải nghiệm (`section-experiences`)
     ...
- **Navigation cập nhật:**
  ```typescript
  const NAV_SECTIONS = [
    { id: 'section-banner', label: 'Video Sản phẩm', icon: Tv },
    { id: 'section-tags', label: 'Tag sản phẩm', icon: Tag },
    { id: 'section-overview', label: 'Mô tả sản phẩm', icon: FileText },
    { id: 'section-quick-facts', label: 'Thông tin nhanh', icon: MapPin }, // Chuyển lên vị trí thứ 4
    { id: 'section-experiences', label: 'Trải nghiệm', icon: Sparkles },
    ...
  ];
  ```

#### 2. Cấu Trúc Form Schema & Ánh Xạ API

- **Zod Schema (`src/lib/validations/product.ts`):**
  Chúng ta đổi `elements` từ một fixed object sang một mảng động chứa các cặp key-value:
  ```typescript
  elements: z.array(
    z.object({
      key: z.string().min(1, 'Vui lòng chọn loại thông tin'),
      name: z.string().min(1, 'Vui lòng nhập hoặc chọn giá trị'),
    })
  )
    .optional()
    .default([]);
  ```
- **API Payload (`toApiPayload` trong `requests.ts`):**
  Vì form đã lưu trữ trực tiếp danh sách `{ key, name }`, chúng ta chỉ cần truyền thẳng mảng này xuống API! Đây là một sự tối giản hóa tuyệt vời, không cần mapping ID phức tạp vì Backend sẽ nhận diện và lưu trữ trực tiếp:
  ```typescript
  // Trong toApiPayload:
  elements: values.elements?.length ? values.elements : undefined,
  ```
- **Load Dữ Liệu Cũ (`use-product-form.ts`):**
  Khi load chi tiết tour từ API, chúng ta chỉ cần map mảng `elements` từ API trực tiếp sang mảng form:
  ```typescript
  elements: (productData.elements ?? []).map((el) => ({
    key: el.key,
    name: el.name,
  }));
  ```

#### 3. Thiết Kế Giao Diện & Trải Nghiệm Người Dùng (Dynamic Facts Builder UI/UX)

Giao diện bao gồm một danh sách các hàng thông tin. Người dùng có thể nhấn nút **`+ Thêm thông tin`** ở dưới cùng để thêm một dòng mới.
Mỗi dòng bao gồm:

1.  **Dropdown chọn Loại thông tin (Key Select):**
    - Dropdown hỗ trợ chọn 1 trong 9 loại:
      - `difficulty` (Độ khó)
      - `language` (Ngôn ngữ)
      - `departure` (Điểm khởi hành)
      - `groupSize` (Quy mô nhóm)
      - `duration` (Thời lượng)
      - `pickup` (Giờ đón khách)
      - `dropOff` (Giờ trả khách)
      - `day` (Số ngày)
      - `night` (Số đêm)
    - **Premium UX (Lọc loại đã chọn):** Những loại thông tin đã được chọn ở các hàng khác sẽ bị ẩn hoặc disabled trong dropdown (để tránh người dùng chọn trùng lặp một loại thông tin nhiều lần).
2.  **Ô nhập/chọn giá trị tương ứng (Dynamic Value Input):**
    Giao diện ô nhập giá trị sẽ thay đổi linh hoạt theo loại thông tin được chọn:
    - _Chưa chọn loại:_ Hiển thị Input rỗng và bị disabled.
    - _Giờ đón/trả khách (`pickup`, `dropOff`):_ Hiển thị Time select picker gồm dropdown chọn **Giờ** (00 - 23) và **Phút** (00 - 59), tự động đồng bộ thành dạng chuỗi `'HH:MM'`.
    - _Quy mô nhóm/Số ngày/Số đêm (`groupSize`, `day`, `night`):_ Hiển thị Input text được xử lý lọc sạch các ký tự không phải số (`e.target.value.replace(/\D/g, '')`), chỉ cho phép nhập số nguyên dương.
    - _Độ khó/Ngôn ngữ/Điểm khởi hành/Thời lượng (`difficulty`, `language`, `departure`, `duration`):_ Hiển thị Autocomplete Combobox cho phép tìm kiếm từ danh sách gợi ý tĩnh `MOCK_ELEMENTS` (lọc theo key tương ứng). Nếu không tìm thấy, sẽ có nút **`+ Thêm mới: "[Từ khóa]"`** để người dùng thêm nhanh giá trị tuỳ ý.
3.  **Nút xóa dòng (Trash icon):**
    - Bấm vào để xoá dòng thông tin đó ngay lập tức thông qua hàm `remove(index)` của `useFieldArray`.

### 3.6. [TỐI ƯU UX] Tinh Chỉnh Section Trải Nghiệm Nổi Bật (What you'll experience)

Để đồng nhất hoàn toàn với giao diện Client và cung cấp trải nghiệm quản trị Premium (WOW UX), chúng ta sẽ thực hiện tinh chỉnh Section **Trải nghiệm nổi bật** (`section-experiences`) với các tính năng:

1. **Giới hạn số lượng (Tối đa 10 Trải nghiệm):**
   - Phía Client chỉ hiển thị tối đa 10 trải nghiệm (`highlights.slice(0, 10)`). Do đó, Admin Form sẽ hiển thị chỉ số số lượng ở tiêu đề (ví dụ: **`Trải nghiệm nổi bật (3/10)`**).
   - Khi số lượng đạt 10, nút **`+ Thêm trải nghiệm mới`** sẽ được ẩn hoặc vô hiệu hóa để ngăn người dùng thêm quá giới hạn hiển thị của Client.
2. **Hỗ trợ Kéo thả Sắp xếp Thứ tự (Drag & Drop Reordering):**
   - Sử dụng hàm `move(from, to)` từ `useFieldArray` của React Hook Form.
   - Thêm icon tay nắm kéo (`GripVertical`) ở góc bên trái của mỗi thẻ trải nghiệm. Người dùng có thể kéo thả để thay đổi vị trí xuất hiện của trải nghiệm trên Client một cách mượt mà và trực quan.
3. **Hoàn thiện thiết kế & Tải ảnh Premium:**

- Giao diện tải ảnh được áp dụng hiệu ứng chuyển đổi mượt mà (fade transition), bo góc mềm mại (`rounded-[14px]` đồng bộ với Client).
- Ô dán URL ảnh trực tiếp được cải thiện độ cân đối, hỗ trợ xoá URL nhanh bằng nút `x`.

### 3.7. [TÁI CẤU TRÚC] Tối Ưu Hóa Section Lưu Ý Trước Khi Đặt (Read Before You Book)

Để mang lại trải nghiệm nhập liệu tinh giản và hiệu quả nhất cho quản trị viên, chúng ta sẽ tái cấu trúc mục **Lưu ý trước khi đặt** (`ReadBeforeSection` / `section-read-before`):

1.  **Cố định danh sách các Category (Fix cứng key & title):**
    Không cho phép người dùng tùy ý Thêm/Xóa các dòng lưu ý động nữa. Thay vào đó, form hiển thị cố định đúng 6 danh mục chuẩn theo thiết kế:
    - `passport`: Hộ chiếu/Giấy tờ
    - `bring`: Cần mang theo
    - `not_recommended`: Không khuyến khích cho
    - `wear`: Trang phục
    - `cultural`: Văn hóa/Ứng xử
    - `other`: Lưu ý khác
2.  **Đơn giản hóa giao diện nhập liệu:**
    Quản trị viên chỉ cần điền **Mô tả (Description)** trực tiếp vào Textarea của từng danh mục tương ứng. Bỏ hoàn toàn dropdown chọn loại và nút xóa dòng.
3.  **Xử lý API Payload Mapping:**
    - **Khi tải dữ liệu cũ (Edit mode):** Map dữ liệu `readBefore` nhận từ API vào 6 danh mục cố định trên Form.
    - **Khi lưu (Submit):** Chỉ gửi những danh mục có mô tả (`description`) không rỗng lên API. Những mục để trống sẽ được tự động bỏ qua để tránh rác dữ liệu.

---

## 4. Kế Hoạch Kiểm Thử & Xác Minh (Verification Plan)

Sau khi triển khai các cải tiến trên, chúng ta sẽ thực hiện kiểm thử theo các kịch bản sau:

- [ ] **Kiểm thử Đồng bộ Lịch trình:**
  - Tạo mới Tour du lịch, nhập chi tiết Lịch trình Day 1, Day 2. Ấn Lưu.
  - Mở lại trang Chỉnh sửa của Tour vừa tạo -> Xác nhận Lịch trình Day 1, Day 2 hiển thị đầy đủ trên giao diện.
  - Kiểm tra phía Client: Xác nhận Lịch trình hiển thị chính xác theo accordion.
- [ ] **Kiểm thử Hướng dẫn viên & Mô tả ngắn:**
  - Chỉnh sửa Tour, chọn Hướng dẫn viên "Nguyễn Văn Hướng Dẫn" và nhập "Short description of the tour..." vào Textarea mô tả ngắn. Ấn Lưu.
  - Tải lại trang Admin -> Xác nhận Hướng dẫn viên và Mô tả ngắn vừa chọn/nhập vẫn được lưu giữ, không bị mất dữ liệu.
  - Kiểm tra phía Client: Xác nhận block Hướng dẫn viên hiển thị đúng và Mô tả ngắn hiển thị ngay dưới tên sản phẩm.
- [ ] **Kiểm thử Tag Sản phẩm Thông minh:**
  - Mở mục **Tag sản phẩm**, gõ tìm kiếm "Best" ->Dropdown hiển thị "Best Seller". Click chọn.
  - Gõ thử tag lạ "Premium Nature" -> Dropdown không có gợi ý, xuất hiện nút **+ Tạo tag mới: "Premium Nature"** (Create tag). Click vào nút -> Xác nhận tag mới với Badge "Premium Nature" được chọn thành công.
  - Lưu sản phẩm -> Kiểm tra API Payload được gửi đi có chứa đúng mảng các `tagIds` của cả hai tag trên.
- [ ] **Kiểm thử Auto-save & Khôi phục Nháp:**
  - Nhập liệu thông tin tour bất kỳ cùng lịch trình, mô tả ngắn và tags. Đợi 5 giây để lưu nháp tự động.
  - Tải lại trang -> Xác nhận xuất hiện Banner khôi phục bản nháp.
  - Ấn "Khôi phục" -> Xác nhận toàn bộ thông tin cơ bản, mô tả ngắn, danh sách tags và lịch trình được khôi phục chính xác 100%.
- [ ] **Kiểm thử Tinh giản Giao diện:**
  - Xác nhận Rich Text Editor của mô tả chi tiết, trường thời lượng, đơn vị tính và tab "Gói giá & Tình trạng" dư thừa không còn xuất hiện trên giao diện Admin, thanh cuộn cuộn mượt mà không bị khựng.
  - Kiểm tra `pnpm check-types` đạt trạng thái sạch sẽ 100% không có lỗi Typescript.
