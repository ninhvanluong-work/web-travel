---
title: 'Xử lý lỗi CORS bằng Next.js Proxy'
created: '2026-03-01'
status: 'implemented'
domain: 'infra'
---

# Spec: Xử lý lỗi CORS bằng Next.js Proxy

**Dự án:** web-travel  
**Ngày:** 2026-03-01  
**Trạng thái:** Đã triển khai

---

## 1. Bối cảnh & Vấn đề

### Mô tả lỗi

Khi người dùng thực hiện tìm kiếm video (ví dụ: `search?q=Hà nội`), trình duyệt thực hiện request trực tiếp đến backend API:

```
GET http://192.168.0.104:3366/video?page=1&pageSize=20&query=ha
```

Trình duyệt chặn request này và hiển thị lỗi:

```
Access to XMLHttpRequest at 'http://192.168.0.104:3366/video'
from origin 'http://localhost:3000' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Nguyên nhân gốc rễ

**CORS (Cross-Origin Resource Sharing)** là cơ chế bảo mật của trình duyệt. Trình duyệt từ chối mọi HTTP request đến một **origin khác** (khác domain, IP hoặc port) trừ khi server đích phản hồi với header:

```
Access-Control-Allow-Origin: http://localhost:3000
```

| Nguồn (trình duyệt) | Đích (backend)       | Kết quả                   |
| ------------------- | -------------------- | ------------------------- |
| `localhost:3000`    | `192.168.0.104:3366` | ❌ Bị chặn (khác IP)      |
| `localhost:3000`    | `localhost:3000`     | ✅ Cho phép (cùng origin) |

> **Quan trọng:** Đây là giới hạn của **trình duyệt**, không phải lỗi code. Backend nhận được request và trả về kết quả bình thường, nhưng trình duyệt không cho phép JavaScript đọc response đó.

---

## 2. Giải pháp: Next.js Reverse Proxy

### Nguyên lý

Thay vì trình duyệt gọi thẳng đến backend, **Next.js server đứng giữa** làm cầu nối (proxy) chuyển tiếp request:

```
❌ Trước (bị CORS chặn):
Browser  ──────────────────────────────→  192.168.0.104:3366
(localhost:3000)                          (bị chặn!)

✅ Sau (dùng proxy):
Browser  →  localhost:3000/api-proxy/*  →  Next.js Server
                                               │
                                               ↓ (server-to-server, không có CORS)
                                          192.168.0.104:3366
```

Server-to-server request **không bị CORS** vì đó là giao tiếp backend thông thường, không qua trình duyệt.

---

## 3. Các thay đổi đã thực hiện

### 3.1. `next.config.js` — Cấu hình rewrite rule

Thêm `rewrites()` để Next.js tự động chuyển tiếp `/api-proxy/*` đến backend:

```js
async rewrites() {
  return [
    {
      source: '/api-proxy/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
    },
  ];
},
```

**Cách hoạt động:**

- Mọi request đến `localhost:3000/api-proxy/video?...`
- Next.js server tự động forward đến `NEXT_PUBLIC_API_URL/video?...`
- Trình duyệt **chỉ thấy** `localhost:3000` → không có CORS

### 3.2. `src/api/axios.ts` — Đổi baseURL

```ts
// Trước
export const request = axios.create({
  baseURL: env.API_URL, // → http://192.168.0.104:3366 ❌
});

// Sau
export const request = axios.create({
  baseURL: '/api-proxy', // → localhost:3000/api-proxy ✅
});
```

---

## 4. Tính tương thích với các môi trường

| Môi trường  | `NEXT_PUBLIC_API_URL`           | Kết quả                |
| ----------- | ------------------------------- | ---------------------- |
| Local (LAN) | `http://192.168.0.104:3366`     | ✅ Hoạt động qua proxy |
| Production  | `https://web-travel-be.fly.dev` | ✅ Hoạt động qua proxy |

Chỉ cần thay đổi `NEXT_PUBLIC_API_URL` trong `.env.local` — **không cần sửa code**.

---

## 5. Lưu ý triển khai

> ⚠️ **Cần restart dev server** sau khi thay đổi `next.config.js`. File này chỉ được đọc khi khởi động, không hot-reload tự động.

```bash
# Dừng server (Ctrl+C), sau đó chạy lại:
pnpm dev
```

---

## 6. Các phương án khác (đã loại trừ)

| Phương án                 | Mô tả                                                | Lý do không chọn                                              |
| ------------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| Cấu hình CORS ở backend   | Thêm `Access-Control-Allow-Origin` header vào server | Không kiểm soát được backend (đặc biệt môi trường local LAN)  |
| Sử dụng browser extension | Tắt CORS check trên trình duyệt                      | Chỉ ảnh hưởng máy dev, không áp dụng được cho người dùng thật |
| JSONP                     | Kỹ thuật cũ tránh CORS                               | Chỉ hỗ trợ GET, không phù hợp với các API hiện đại            |

**Next.js Proxy được chọn** vì:

- ✅ Hoạt động trên mọi môi trường (local, staging, production)
- ✅ Không cần thay đổi backend
- ✅ Minh bạch với toàn bộ codebase client
- ✅ `NEXT_PUBLIC_API_URL` vẫn dễ dàng cấu hình per-environment
