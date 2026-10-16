# Spec: Video Copy & Save Protection

**Status:** Draft  
**Date:** 2026-10-12  
**Scope:** BunnyVideoPlayer, VideoDetailPage, any HLS video surface

---

## 1. Problem Statement

Users can currently:

- Right-click → Save video / Open in new tab
- Use DevTools → Network → download the `.m3u8` playlist and `.ts` segments directly
- Use browser "Picture-in-Picture" then screen-record
- Inspect the DOM to find the raw HLS source URL and download offline

We need to make saving/copying video content significantly harder without impacting legitimate viewing UX.

---

## 2. Threat Model

| Threat                              | Effort    | Current exposure               |
| ----------------------------------- | --------- | ------------------------------ |
| Right-click → Save                  | Low       | Open                           |
| Keyboard shortcut (Ctrl+S)          | Low       | Open                           |
| DevTools → Network → copy .m3u8 URL | Medium    | Open — URL is plain, no expiry |
| Share the .m3u8 URL directly        | Low       | Open — permanent URL           |
| DevTools → intercept HLS segments   | High      | Open                           |
| Screen recording                    | Very High | Cannot block (OS-level)        |

**Out of scope:** Screen recording and OS-level capture. These are unblockable from the browser.

---

## 3. Layers of Protection

### Layer 1 — Browser-Level (Frontend, implemented in app)

**1.1 Block context menu on video container**

Attach `onContextMenu={e => e.preventDefault()}` to the video wrapper `<div>` in `BunnyVideoPlayer`.  
Also covers long-press on mobile (Android Chrome shows a "Save video" context menu).

**1.2 Block keyboard shortcuts for saving**

In a global `useEffect` (or document-level event listener):

- Block `Ctrl+S` / `Cmd+S`
- Block `Ctrl+U` / `Cmd+U` (view source)
- Block `F12` (DevTools toggle) — optional, mobile users won't use this

```ts
window.addEventListener('keydown', (e) => {
  const isCtrl = e.ctrlKey || e.metaKey;
  if (isCtrl && ['s', 'u'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});
```

**1.3 Ensure `<video>` has no `controls` attribute**

`controls` attribute exposes a native "Download" button in some browsers (Firefox, Safari). We already use a custom player, so verify `controls` is never rendered.

**1.4 `controlsList="nodownload"` on the video element**

When/if the `<video>` element is ever exposed with `controls`, add `controlsList="nodownload"`. Belt-and-suspenders.

**1.5 CSS `pointer-events: none` on the video element**

The `<video>` element itself should not be directly clickable/right-clickable. Tap interactions go through the overlay `<div>` (already done via `z-10` tap zone in `video-slide.tsx`). Ensure the underlying `<video>` has `pointer-events: none` via CSS.

**1.6 Disable drag on video**

```ts
video.addEventListener('dragstart', (e) => e.preventDefault());
```

---

### Layer 2 — Signed / Token-Protected HLS URLs (CDN Level)

This is the most effective technical protection. Without it, even if we hide URLs from DevTools, a determined user can still get them from network traffic.

**2.1 Bunny CDN Signed URLs (Token Authentication)**

Bunny Stream supports token-based URL signing. A signed URL looks like:

```
https://vz-xxx.b-cdn.net/video-id/playlist.m3u8
  ?token=<HMAC-SHA256>&expires=<unix-timestamp>
```

- The backend generates a short-lived token (TTL: 1–4 hours)
- The frontend receives the signed URL from the API, not the raw URL
- The token is scoped to IP (optional) and expires automatically
- Even if extracted from DevTools, the URL becomes invalid after TTL

**Implementation change:**

- Backend: generate `embedUrl` as a signed URL before returning it in the API response
- Frontend: no change needed — `BunnyVideoPlayer` already uses `embedUrl` as-is via `extractM3u8Url`

**2.2 Referer-based restriction (Bunny CDN)**

Configure Bunny CDN to only serve video to requests with `Referer` matching the app's domain. Prevents sharing raw URLs that work in a downloader tool.

---

### Layer 3 — Watermark (Deterrence)

Even if a user screen-records, a visible or invisible watermark can trace the source.

**3.1 Visible watermark overlay**

Render a semi-transparent watermark (e.g. the site logo or a faint text) as a CSS overlay on top of the video. Non-blocking for normal viewing but present in any screen recording.

```tsx
<div className="absolute inset-0 pointer-events-none z-[5] flex items-end justify-end pr-3 pb-3">
  <span className="text-white/10 text-[10px] font-dinpro select-none">vietnamvillagevibes.com</span>
</div>
```

---

## 4. Implementation Plan

### Phase 1 — Frontend Quick Wins (1–2 hours)

| #   | Task                                        | File                                            |
| --- | ------------------------------------------- | ----------------------------------------------- |
| 1   | `onContextMenu` prevention on video wrapper | `BunnyVideoPlayer.tsx`                          |
| 2   | `pointer-events: none` on `<video>` element | `use-shared-video.ts` or `BunnyVideoPlayer.tsx` |
| 3   | `dragstart` prevention                      | `BunnyVideoPlayer.tsx`                          |
| 4   | Global `keydown` blocker (Ctrl+S, Ctrl+U)   | `_app.tsx` or a new `useVideoGuard` hook        |
| 5   | Watermark overlay in `VideoSlide`           | `video-slide.tsx`                               |

### Phase 2 — CDN Token Auth (requires backend work)

| #   | Task                                                         | Owner          |
| --- | ------------------------------------------------------------ | -------------- |
| 6   | Backend generates signed Bunny URLs with 2hr TTL             | Backend        |
| 7   | Configure Bunny CDN: enable token auth + referer restriction | DevOps/Backend |
| 8   | Frontend: no change (already reads `embedUrl` from API)      | —              |

---

## 5. What This Does NOT Protect Against

| Cannot block                          | Why                                               |
| ------------------------------------- | ------------------------------------------------- |
| Screen recording                      | OS-level, browser has no API to detect or prevent |
| Physical camera pointed at screen     | Physical world                                    |
| Browser extensions that intercept HLS | Extension has OS-level access                     |
| User who owns the content / is admin  | Not a threat to protect against                   |

---

## 6. Effectiveness Summary

| Measure                     | Blocks casual user | Blocks determined user |
| --------------------------- | ------------------ | ---------------------- |
| Right-click block           | Yes                | No (DevTools)          |
| Keyboard shortcut block     | Yes                | No                     |
| `controlsList="nodownload"` | Yes                | No                     |
| Signed URLs (TTL)           | Yes                | Partial (short window) |
| Referer restriction         | Yes                | Partial                |
| Watermark                   | No (doesn't block) | Deters (traceability)  |
| Screen recording block      | No                 | No (impossible)        |

**Recommendation:** Implement Phase 1 immediately for low-hanging fruit. Prioritize Phase 2 (signed URLs) for real security — it's the only measure that makes the raw URL useless after expiry.

---

## 7. Open Questions

1. Does Bunny Stream plan (current tier) support token authentication? Need to verify.
2. What is an acceptable token TTL? (1h means videos expire during a long session — need refresh logic)
3. Should the keyboard blocker be global or only active when a video is in view?
