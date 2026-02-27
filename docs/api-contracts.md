# API Contracts & Data Models — Web Travel

---

## HTTP Client

**File:** `src/api/axios.ts`

- Base URL: `env.API_URL` (từ environment variable)
- Auto-inject JWT: `Authorization: Bearer {accessToken}`
- Auto-refresh: 401 → gọi refresh token → retry request
- On refresh fail: logout + redirect về `/`

---

## Video API (`src/api/video/`)

> ⚠️ **Hiện tại dùng mock data** — API thật sẽ được ghép vào sau khi có backend.

### Endpoints (dự kiến)

| Method | URL       | Response   | Ghi chú                 |
| ------ | --------- | ---------- | ----------------------- |
| GET    | `/videos` | `IVideo[]` | Danh sách video du lịch |

### Data Model

```typescript
interface IVideo {
  id: string; // Unique ID
  link: string; // URL video (CDN hoặc API)
  title: string; // Tên địa điểm du lịch
  description: string; // Mô tả ngắn
  thumbnail: string; // URL ảnh thumbnail
}
```

### Mock Data (18 videos tạm thời)

Destinations hiện đang fake:

- **Miền Bắc:** Sapa, Hà Giang, Hạ Long, Ninh Bình, Mộc Châu
- **Miền Trung:** Đà Nẵng, Hội An, Huế, Nha Trang
- **Miền Nam:** Sài Gòn, Cần Thơ, Phú Quốc, Vũng Tàu, Đà Lạt, An Giang

Video sources tạm dùng:

- `https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/` (DigitalOcean Spaces)
- `https://www.w3schools.com/html/mov_bbb.mp4` (test)
- `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4` (test)

### TanStack Query Hook

```typescript
// src/api/video/queries.ts
export const useListVideo = createQuery<IVideo[]>({
  primaryKey: '/videos',
  queryFn: getListVideo,
});

// Dùng trong component:
const { data: videos, isLoading } = useListVideo();
```

---

## Auth API (`src/api/auth/`)

### Endpoints

| Method | URL                               | Request Body      | Response            | Ghi chú              |
| ------ | --------------------------------- | ----------------- | ------------------- | -------------------- |
| POST   | `/authentication/log-in`          | `ILoginParams`    | `ILoginResponse`    | Đăng nhập            |
| POST   | `/authentication/log-out`         | —                 | `boolean`           | Đăng xuất            |
| GET    | `/authentication/refresh`         | —                 | `{ accessToken }`   | Refresh JWT          |
| POST   | `/authentication/register`        | `IRegisterParams` | `IRegisterResponse` | Đăng ký              |
| GET    | `/users/me`                       | —                 | `IUser`             | Lấy profile hiện tại |
| POST   | `/authentication/forgot-password` | `IForgotPassword` | `ILoginResponse`    | Quên mật khẩu        |
| POST   | `/authentication/reset-password`  | `IResetPassword`  | `ILoginResponse`    | Đặt lại mật khẩu     |
| POST   | `/authentication/change-password` | `IChangePassword` | `ILoginResponse`    | Đổi mật khẩu         |
| PUT    | `/users/profile`                  | `IProfile`        | `ILoginResponse`    | Cập nhật profile     |
| GET    | `/user-courses/courses`           | —                 | `ICourse[]`         | Danh sách khoá học   |

### Data Models

```typescript
interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface IUser {
  /* user profile fields */
}
interface ILoginParams {
  /* email/password */
}
interface IRegisterParams {
  /* registration fields */
}
interface ICourse {
  /* course fields */
}
```

---

## Search (Client-side)

Search thực hiện **hoàn toàn phía client** — filter trên danh sách video đã fetch:

```typescript
const filteredVideos = useMemo(() => {
  if (!videoQuery.searchText) return videos;
  return videos.filter((video) => video.title.toLowerCase().includes(videoQuery.searchText.toLowerCase()));
}, [videos, videoQuery]);
```

**Search Suggestions** (static, `src/data/search.ts`):

```
Miền Bắc | Miền Trung | Miền Nam | Sapa | Hà Giang | An Giang | Vũng Tàu | Đà Lạt
```

---

## Kế hoạch ghép API thật

Khi có backend, chỉ cần cập nhật `src/api/video/requests.ts`:

```typescript
// Thay mock bằng:
export const getListVideo = async (): Promise<IVideo[]> => {
  const { data } = await request({ url: '/videos', method: 'GET' });
  return data;
};
```

Không cần thay đổi gì ở component hay query hooks.
