# web-travel

Ứng dụng xem video du lịch và đặt tour, giao diện mobile-first (khung điện thoại tối đa 430×932px), xây bằng Next.js 13 (Pages Router) + TypeScript.

## Yêu cầu

| Công cụ | Phiên bản                                  |
| ------- | ------------------------------------------ |
| Node.js | **20 LTS** (khuyến nghị 20.11.x), tối thiểu 18 |
| pnpm    | **9.1.0** (khai báo trong `packageManager`)  |

> Không dùng Node 16: `@sentry/nextjs` yêu cầu Node >= 18. Môi trường dev hiện tại chạy Node 20.11.1.
>
> Dự án chỉ dùng **pnpm**. Không chạy `npm install` hay `yarn` — sẽ tạo lockfile khác và lệch phiên bản thư viện so với `pnpm-lock.yaml`.

### Cài Node.js

Dùng trình quản lý phiên bản để dễ chuyển đổi:

```bash
# Windows: nvm-windows (https://github.com/coreybutler/nvm-windows)
nvm install 20.11.1
nvm use 20.11.1

# macOS / Linux: nvm (https://github.com/nvm-sh/nvm)
nvm install 20
nvm use 20

node -v   # v20.x.x
```

### Cài pnpm

Cách khuyến nghị là bật Corepack (có sẵn trong Node), nó sẽ tự dùng đúng `pnpm@9.1.0` theo `package.json`:

```bash
corepack enable
corepack prepare pnpm@9.1.0 --activate
pnpm -v   # 9.1.0
```

Hoặc cài trực tiếp:

```bash
npm install -g pnpm@9.1.0
```

## Chạy dự án

### 1. Cài dependencies

```bash
pnpm install
```

Lệnh này tự chạy `postinstall` (copy TinyMCE vào `public/`) và `prepare` (cài git hooks husky).

### 2. Cấu hình biến môi trường

Sao chép file mẫu rồi điền giá trị (hỏi team để lấy key):

```bash
cp .env.example .env.local
```

| Biến                             | Mô tả                                 |
| -------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_APP_URL`            | URL của app, local là `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL`            | Base URL của backend API (**bắt buộc**) |
| `NEXT_PUBLIC_BUNNY_TUS_ENDPOINT` | Endpoint upload video Bunny (TUS)     |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` | Sentry (có thể bỏ trống khi dev) |
| `NEXT_PUBLIC_GOONG_API_KEY`, `NEXT_PUBLIC_GOONG_MAPTILES_KEY` | Goong Maps |
| `NEXT_PUBLIC_GOOGLE_MAPS_JS_KEY`, `GOOGLE_MAPS_SERVER_API_KEY` | Google Maps |

### 3. Chạy dev server

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000). Lệnh `dev` xoá `.next/` và `out/` trước khi chạy.

### 4. Build và chạy production

```bash
pnpm build
pnpm start   # chạy ở port 8080
```

Mở [http://localhost:8080](http://localhost:8080).

## Các lệnh khác

```bash
pnpm lint          # Kiểm tra ESLint
pnpm lint:fix      # Tự sửa lỗi ESLint
pnpm check-types   # Kiểm tra TypeScript (tsc --noEmit)
pnpm format:write  # Format code bằng Prettier
pnpm format:check  # Kiểm tra format
pnpm analyze       # Build kèm phân tích bundle
pnpm clean         # Xoá .next/ và out/
```

Trên Windows, sau khi sửa code có thể chạy `lint-changed.bat` để tự format + fix ESLint cho các file đã thay đổi.

## Xử lý sự cố

- **`pnpm: command not found`** → chạy lại `corepack enable` hoặc cài pnpm global.
- **Lỗi engine / cú pháp khi cài hoặc chạy** → kiểm tra `node -v`, phải là 18 trở lên (khuyến nghị 20).
- **Gọi API lỗi / trang trống** → kiểm tra `NEXT_PUBLIC_API_URL` trong `.env.local`, rồi chạy lại `pnpm dev` (biến `NEXT_PUBLIC_*` chỉ được nạp khi khởi động).
- **Lỗi lạ sau khi đổi branch** → xoá cache và cài lại: `pnpm clean`, xoá `node_modules`, rồi `pnpm install`.
