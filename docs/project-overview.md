# Web Travel - Tổng quan dự án

> **Ứng dụng khám phá video du lịch Việt Nam** — Người dùng tìm kiếm và xem các video điểm đến du lịch theo định dạng mobile-first với autoplay thông minh.

---

## Thông tin cơ bản

| Thuộc tính          | Giá trị                          |
| ------------------- | -------------------------------- |
| **Tên dự án**       | Web Travel                       |
| **Phiên bản**       | 0.2.0                            |
| **Loại**            | Monolith Web Application         |
| **Ngôn ngữ**        | TypeScript 5.1.6                 |
| **Framework**       | Next.js 13.5 (Pages Router)      |
| **Package Manager** | pnpm 9.1.0                       |
| **Styling**         | TailwindCSS 3.4 + Radix UI       |
| **Kiến trúc**       | Component-based + Module Pattern |

---

## Mục đích

Web Travel là ứng dụng web dạng mobile-first cho phép người dùng:

1. **Xem video nền** tại trang chủ — background video toàn màn hình về địa điểm du lịch Việt Nam
2. **Tìm kiếm** điểm đến với gợi ý search (Miền Bắc, Sapa, Hà Giang, Đà Lạt, v.v.)
3. **Duyệt video** theo grid — kết quả search hiển thị dạng lưới với autoplay IntersectionObserver
4. **Điều khiển âm thanh** — mute/unmute từng video trong grid và video nền trang chủ

---

## Tech Stack tóm tắt

| Tầng               | Công nghệ                            |
| ------------------ | ------------------------------------ |
| **UI Framework**   | React 18 + Next.js 13 (Pages Router) |
| **Ngôn ngữ**       | TypeScript                           |
| **Styling**        | TailwindCSS 3.4 + animate.css        |
| **UI Components**  | Radix UI + shadcn/ui pattern         |
| **State (client)** | Zustand 4.4 + auto-selectors         |
| **State (server)** | TanStack Query 4 + react-query-kit   |
| **HTTP Client**    | Axios 1.5 (với JWT interceptor)      |
| **Form**           | React Hook Form + Zod                |
| **Animation**      | Framer Motion + animate.css          |
| **CDN**            | DigitalOcean Spaces (SGP1)           |
| **Fonts**          | Custom (DINPro, DIN Pro Cond)        |

---

## Cấu trúc repository

```
web-travel/                    # Monolith Next.js app
├── src/
│   ├── api/                   # API client layer
│   ├── assets/                # SVG icons, fonts
│   ├── components/            # Shared UI components
│   ├── config/                # Site configuration
│   ├── data/                  # Static data (search suggestions)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities, Provider, constants
│   ├── modules/               # Feature modules (HomePage, DetailSearchPage)
│   ├── pages/                 # Next.js pages (routes)
│   ├── stores/                # Zustand stores
│   ├── styles/                # Global CSS
│   └── types/                 # TypeScript type definitions
├── docs/                      # Project documentation (this folder)
├── public/                    # Static assets
└── _bmad/                     # BMAD methodology files
```

---

## Trang hiện có

| Route     | Module             | Mô tả                                     |
| --------- | ------------------ | ----------------------------------------- |
| `/`       | `HomePage`         | Trang chủ — background video + search box |
| `/search` | `DetailSearchPage` | Kết quả tìm kiếm — video grid             |
| `/button` | `button-page`      | Trang demo button components              |
| `/404`    | —                  | Trang 404                                 |

---

## Getting Started

```bash
# Cài dependencies
pnpm install

# Chạy development server
pnpm dev

# Build production
pnpm build

# Start production server (port 8080)
pnpm start

# Kiểm tra types
pnpm check-types

# Lint
pnpm lint
```

---

## Tài liệu liên quan

- [Kiến trúc hệ thống](./architecture.md)
- [Phân tích cây thư mục](./source-tree-analysis.md)
- [API & Data Models](./api-contracts.md)
- [Thư viện UI Components](./component-inventory.md)
- [Hướng dẫn phát triển](./development-guide.md)
