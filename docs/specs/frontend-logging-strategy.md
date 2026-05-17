# Technical Spec: Frontend Logging & Error Tracking Strategy

This document standardizes log management, error handling, and reporting for the `web-travel` project.

## 1. Log Levels

| Level     | Definition                                                                                | Action                                                       |
| :-------- | :---------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **FATAL** | Critical error that crashes the UI or makes the app unusable.                             | Send to **Sentry** + trigger **Sentry email alert**.         |
| **ERROR** | Logic/API error that breaks a feature (e.g. video list fails to load).                    | Send to **Sentry** dashboard.                                |
| **WARN**  | Non-blocking issue with potential impact (e.g. `play()` rejected by iOS autoplay policy). | Send to **Sentry** (low priority).                           |
| **INFO**  | Key user milestones (e.g. video opened, user swiped, user unmuted).                       | Used as **Sentry Breadcrumbs** to reconstruct error context. |
| **DEBUG** | Technical detail for developers (HLS fragment load, pool assign/release, API payload).    | Shown only in **vConsole** when `?debug=true` is in the URL. |

---

## 2. Implementation

### 2.1. Logger Utility — `src/lib/logger.ts`

A centralized `logger` module. All code uses this instead of `console.log`/`console.error`.

```typescript
// Usage examples
logger.fatal('UI crashed on VideoDetailPage', error);
logger.error('Video list API failed', { status: 500, url });
logger.warn('iOS play() rejected — autoplay policy', { embedUrl });
logger.info('User swiped to next video', { slug, index });
logger.debug('HLS fragment loaded', { url, duration });
```

**Behavior by environment:**

| Environment                | DEBUG         | INFO/WARN/ERROR/FATAL |
| -------------------------- | ------------- | --------------------- |
| Local dev                  | `console.log` | `console.log`         |
| Production (`?debug=true`) | vConsole      | Sentry                |
| Production (normal)        | silent        | Sentry                |

### 2.2. Mobile Debugging — vConsole

- **Trigger:** Add `?debug=true` to any URL (e.g. `https://app.com/video/slug?debug=true`).
- **Load:** Lazy-loaded — zero bundle cost in normal production usage.
- **Use case:** Share the URL with testers on device to see console output without a laptop.

### 2.3. Sentry Integration

- **SDK:** `@sentry/nextjs` — official Next.js plugin.
- **Captures automatically:** Unhandled Promise rejections, Runtime errors.
- **Source maps:** Uploaded automatically via Vercel build integration — stack traces show exact source lines.
- **Alerting:** Sentry email alert configured for **FATAL** level only.
- **Environments:** `development` vs `production` configured via `SENTRY_ENVIRONMENT`.

### 2.4. Video Error Tracking (First-class)

HLS and iOS playback errors are the most critical errors in this app and must be tracked explicitly:

| Error                                       | Level | Where it fires                                    |
| ------------------------------------------- | ----- | ------------------------------------------------- |
| HLS fatal error (`data.fatal = true`)       | FATAL | `BunnyVideoPlayer` — `Hls.Events.ERROR` handler   |
| `play()` rejected (not from user gesture)   | WARN  | `BunnyVideoPlayer` — `.catch()` on `video.play()` |
| Video pool exhausted (no element available) | ERROR | `use-shared-video`                                |
| Video list API failure                      | ERROR | React Query `onError`                             |

---

## 3. Reporting Flow

```
FATAL/ERROR/WARN/INFO  →  Sentry Dashboard  →  (FATAL only) email alert to dev
DEBUG                  →  vConsole on device (only when ?debug=true)
```

No Telegram. No backend relay needed — Sentry handles alerting directly.

---

## 4. Privacy & Performance

- **Masking:** Strip `accessToken` and `refreshToken` from Sentry payloads via `beforeSend` hook.
- **Batching:** Handled automatically by Sentry SDK.
- **Bundle cost:** vConsole is lazy-loaded — only fetched when `?debug=true` is present.
- **Scale:** Sentry free tier (5k errors/month) — sufficient for internal dev stage.

---

## 5. Bật / Tắt Sentry

Sentry được kiểm soát qua `enabled` flag trong `sentry.client.config.ts`:

```ts
enabled: process.env.NODE_ENV === 'production',
```

| Môi trường                              | Trạng thái                        |
| --------------------------------------- | --------------------------------- |
| `pnpm dev` (local)                      | **Tắt** — không gửi gì lên Sentry |
| `pnpm build && pnpm start` (production) | **Bật** tự động                   |

**Nếu cần tắt tạm trên production** (ví dụ đang test, không muốn tốn quota), đổi sang:

```ts
enabled: process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true',
```

Rồi set trong `.env.local`:

```
NEXT_PUBLIC_SENTRY_ENABLED=false   # tắt
NEXT_PUBLIC_SENTRY_ENABLED=true    # bật
```

**Quota free tier:** 5,000 errors/tháng. Đủ dùng cho giai đoạn nội bộ và production bình thường.

---

## 6. Out of Scope (Current Stage)

- Session replay (LogRocket) — revisit when app goes public
- Slack/Discord alerts — Sentry email is sufficient for internal team
- Custom batching — Sentry SDK handles this

---

_Last updated: 2026-04-19_
