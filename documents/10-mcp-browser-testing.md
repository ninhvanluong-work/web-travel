# 10 · Dùng MCP trình duyệt để chụp màn hình & test

Hướng dẫn cho người dùng (dev, QA, PO) nhờ Claude mở trình duyệt thật, thao tác, chụp màn hình và kiểm tra giao diện. Không cần viết code test.

## 1. Có những MCP nào
| MCP (`.mcp.json`) | Chạy bằng | Dùng khi | Ghi chú |
| --- | --- | --- | --- |
| **`playwright`** (khuyên dùng) | `npx -y @playwright/mcp@latest` | Mở trang, bấm, gõ, chụp màn hình, đọc console/network, đổi kích thước màn hình | Ổn định nhất trong dự án |
| `puppeteer` | `@modelcontextprotocol/server-puppeteer` | Dự phòng khi playwright lỗi | Ít tính năng hơn |
| `chrome-devtools` | `chrome-devtools-mcp@latest` | Phân tích hiệu năng, network sâu | Hay lỗi kết nối (timeout) |
| `_postgres` | — | Đối chiếu dữ liệu sau khi thao tác (chỉ đọc) | Xem 07 |

## 2. Chuẩn bị (1 lần mỗi phiên)
1. **Bật dev server**: `pnpm dev` (cổng 3000). Claude test trên `http://localhost:3000`.
2. **Kiểm tra MCP đã kết nối**: gõ `/mcp` trong Claude Code → `playwright` phải "connected". Vừa sửa `.mcp.json` thì phải mở phiên mới hoặc reconnect.
3. **Tài khoản test** theo role: `documents/test-accounts.local.md` (file local, đã gitignore, không commit). Khi test **trang admin**: đăng nhập admin ở trình duyệt của Claude **sẽ đá phiên admin trên trình duyệt của bạn** (BE chỉ giữ 1 phiên).
4. Nếu test chữ tiếng Việt mới thêm vào file `public/locales/*`: **restart dev server** trước, nếu không sẽ thấy key thô (vd `admin.guide.moments.title`).

## 3. Mẫu câu yêu cầu Claude
Mẫu chi tiết theo từng khu vực:
- Trang khách & hướng dẫn viên → [11-client-guide.md §5](./11-client-guide.md)
- Trang admin → [12-admin-guide.md §4](./12-admin-guide.md)

Mẫu chung:
| Mục đích | Câu lệnh |
| --- | --- |
| Chụp 1 màn hình | "Dùng MCP playwright mở `http://localhost:3000/<đường dẫn>`, chụp màn hình và cho tôi xem." |
| So sánh trước/sau | "Chụp trang `<x>` bây giờ. Sau khi tôi sửa xong, chụp lại cùng vị trí và so sánh." |
| Đối chiếu dữ liệu | "Sau thao tác `<x>` trên giao diện, kiểm tra DB (chỉ đọc) xem dữ liệu đã đổi đúng chưa." |

Mẹo: nói rõ **tài khoản** (xem `documents/test-accounts.local.md`), **dữ liệu test** (bản ghi `ZZ…`), và **có được bấm nút ghi thật (lưu/xoá/huỷ) hay không**.

## 4. Kết quả lưu ở đâu
- Ảnh và snapshot: thư mục **`.playwright-mcp/`** ở gốc repo (hoặc đường dẫn bạn chỉ định). Claude có thể đọc ảnh và mô tả lại.
- Thư mục này **không được commit** (chứa ảnh trang admin/dữ liệu thật) → xoá khi xong: "xoá `.playwright-mcp`".

## 5. Giới hạn & an toàn
| Vấn đề | Cách xử lý |
| --- | --- |
| API/DB là **dữ liệu thật** | Chỉ thao tác ghi (lưu, xoá, huỷ, thanh toán) khi bạn cho phép rõ; dùng bản ghi `ZZ…` |
| Playwright **chặn `file://`** (vd mở `documents/slides/onboarding.html`) | Nhờ Claude chạy tạm một server tĩnh (`node` http) rồi mở `http://localhost:<port>`, tắt khi xong |
| Dev server chưa chạy → `ERR_CONNECTION_REFUSED` | Bật `pnpm dev`. Claude **không được** tự chạy `pnpm dev` khi bạn đang chạy (lệnh xoá `.next`); nếu cần chạy riêng thì `npx next dev -p 3001` |
| Bị đá ra trang login giữa chừng | Do có nơi khác đăng nhập cùng tài khoản (curl/Swagger/MCP API) → đăng nhập lại |
| Chữ hiện font Arial | Font đã tự host; nếu còn lỗi xem terminal dev |
| Video/ảnh Bunny tải chậm | Mạng tới CDN chậm, không phải lỗi code; chờ lâu hơn hoặc chụp lại |
| Thanh toán PayPal/VNPay | Không thanh toán thật; chỉ test tới bước mở cổng thanh toán |
| MCP không kết nối (`CONNECT_TIMEOUT`) | `/mcp` → reconnect; vẫn lỗi thì mở phiên mới |

## 6. Checklist test 1 màn hình (gợi ý cho Claude)
1. Mở trang ở 430×932 (client) hoặc 1366×768 (admin).
2. Chụp trạng thái **đang tải**, **có dữ liệu**, **trống** (tìm từ khoá không có), **lỗi**.
3. Bấm các nút chính theo flow trong [11-client-guide.md](./11-client-guide.md) / [12-admin-guide.md](./12-admin-guide.md), xác nhận đến đúng màn hình.
4. Đọc console: không có lỗi mới (cảnh báo `defaultProps`, `fetchPriority` là có sẵn, bỏ qua).
5. Báo cáo: đã kiểm tra gì, chưa kiểm tra gì, ảnh minh hoạ.
