import { type RefObject, useEffect, useRef, useState } from 'react';

function createPoolElement(): HTMLVideoElement {
  const video = document.createElement('video');
  // CSS phải set bằng JS — pool element nằm ngoài React tree, Tailwind không áp dụng được.
  video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
  video.playsInline = true;
  video.loop = true;
  video.muted = true;
  video.preload = 'none';
  return video;
}

// Singleton pool — khởi tạo 1 lần duy nhất, sống suốt session.
// Guard SSR: document không tồn tại trên server.
const pool: HTMLVideoElement[] =
  typeof window !== 'undefined' ? [createPoolElement(), createPoolElement(), createPoolElement()] : [];

const available: HTMLVideoElement[] = [...pool];

/**
 * Unlock tất cả pool elements trong user gesture context (onClick).
 *
 * iOS Safari ghi nhận từng HTMLMediaElement instance riêng biệt.
 * Gọi play() trong gesture → Safari cấp "User Gesture Token" vĩnh viễn cho element đó,
 * cho phép play() unmuted bất kỳ lúc nào sau đó (kể cả sau async HLS load).
 *
 * ⚠️  Chỉ gọi hàm này từ onClick VideoCard (isFromGrid flow).
 *     KHÔNG gọi khi reload page — gate mechanism xử lý flow đó riêng.
 */
export function unlockVideoPool(): void {
  pool.forEach((video) => {
    // play() được Safari ghi nhận token ngay lúc gọi (synchronous gesture check),
    // không cần await resolve. pause() ngay sau để không thực sự phát tiếng.
    video.play().catch(() => {});
    video.pause();
  });
}

interface SharedVideoOptions {
  poster?: string;
  loop?: boolean;
}

/**
 * Mượn 1 video element từ shared pool, inject vào containerRef.
 * Trả về element đó (hoặc null nếu pool cạn kiệt).
 *
 * Khi component unmount: tự động reset element và trả về pool.
 * Thứ tự cleanup React (registration order): hook này chạy trước BunnyVideoPlayer's HLS effect.
 * hls.destroy() chạy sau, xử lý detachMedia() gracefully dù src đã bị clear.
 */
export function useSharedVideo(
  containerRef: RefObject<HTMLDivElement>,
  options: SharedVideoOptions = {}
): HTMLVideoElement | null {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  // Dùng ref để effect (deps=[]) vẫn đọc được options mới nhất lúc mount
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const video = available.pop() ?? null;
    if (!video) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[VideoPool] Pool exhausted — slide eviction quá chậm, kiểm tra rootMargin');
      }
      return;
    }

    video.poster = optionsRef.current.poster ?? '';
    video.loop = optionsRef.current.loop ?? true;
    video.muted = true; // luôn bắt đầu muted khi mượn

    container.appendChild(video);
    setVideoEl(video);

    // eslint-disable-next-line consistent-return
    return () => {
      // Reset về trạng thái sạch trước khi trả pool.
      // BunnyVideoPlayer's hls.destroy() chạy sau (effect #3 vs effect #1),
      // hls.js xử lý detachMedia() gracefully khi src đã clear.
      video.pause();
      video.removeAttribute('src');
      video.poster = '';
      video.load(); // giải phóng iOS hardware decoder slot
      if (container.contains(video)) {
        container.removeChild(video);
      }
      available.push(video);
      // Không gọi setVideoEl(null) — component đang unmount, không cần re-render
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount/unmount only

  return videoEl;
}
