import Hls from 'hls.js';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { useSharedVideo } from '@/hooks/use-shared-video';

// CDN pullzone domain dùng để build link m3u8 từ videoGuid
const BUNNY_CDN_DOMAIN = 'vz-186cf1b9-231.b-cdn.net';

/**
 * Trích xuất videoGuid từ embedUrl của Bunny Stream.
 * VD: https://player.mediadelivery.net/embed/622547/19e8f6fd-... → 19e8f6fd-...
 */
function extractM3u8Url(embedUrl: string): string {
  const parts = embedUrl.split('/');
  const videoGuid = parts[parts.length - 1].split('?')[0];
  return `https://${BUNNY_CDN_DOMAIN}/${videoGuid}/playlist.m3u8`;
}

export interface BunnyPlayerHandle {
  play: () => Promise<void>;
  pause: () => void;
  unmute: () => void;
  mute: () => void;
  isPlaying: () => boolean;
  preload: () => void;
}

interface Props {
  muted?: boolean;
  embedUrl: string;
  className?: string;
  poster?: string;
  onReady?: () => void; // Gọi khi video có đủ data để phát (canplay)
}

const BunnyVideoPlayer = forwardRef<BunnyPlayerHandle, Props>(function BunnyVideoPlayer(
  { muted = true, embedUrl, className, poster, onReady },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  // videoElement: pool element được inject vào containerRef sau mount (null ở render đầu tiên)
  const videoElement = useSharedVideo(containerRef, { poster, loop: true });

  // Ref trỏ đến pool element hiện tại — luôn cập nhật mỗi render,
  // cho phép imperative methods đọc element mới nhất mà không cần recreate handle.
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  videoElRef.current = videoElement;

  const hlsRef = useRef<Hls | null>(null);

  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  // shouldPlayRef: ghi nhận intent play() kể cả khi pool element chưa sẵn sàng.
  // Khi HLS setup xong (MANIFEST_PARSED / canplay), intent này được retry tự động.
  const shouldPlayRef = useRef(false);
  const shouldPreloadRef = useRef(false);

  useImperativeHandle(ref, () => ({
    /**
     * iOS-safe play: set intent trước, sau đó thực thi nếu element sẵn sàng.
     * Nếu pool element chưa inject (videoEl vẫn null), shouldPlayRef=true sẽ
     * được HLS MANIFEST_PARSED / canplay handler retry khi element về.
     */
    play: () => {
      shouldPlayRef.current = true; // set intent trước khi check null
      const video = videoElRef.current;
      if (!video) return Promise.resolve(); // pool chưa ready — HLS sẽ retry
      hlsRef.current?.startLoad(0);
      if (!video.paused) {
        video.muted = mutedRef.current;
        return Promise.resolve();
      }
      // Luôn bắt đầu muted để iOS cho phép play() không cần gesture
      video.muted = true;
      return video
        .play()
        .then(() => {
          // Delay unmute 1 rAF: đảm bảo video trước đã kịp pause() trước khi unmute,
          // tránh 2 video cùng phát tiếng khi swipe nhanh.
          requestAnimationFrame(() => {
            if (shouldPlayRef.current) video.muted = mutedRef.current;
          });
        })
        .catch(() => {});
    },
    pause: () => {
      shouldPlayRef.current = false;
      videoElRef.current?.pause();
    },
    /**
     * unmute trong user gesture (button click):
     * - Nếu đang play: set muted=false trực tiếp
     * - Nếu đang pause: gọi play() để unlock iOS audio session (reload flow)
     */
    unmute: () => {
      const video = videoElRef.current;
      if (!video) return;
      mutedRef.current = false;
      if (!video.paused) {
        video.muted = false;
      } else {
        hlsRef.current?.startLoad(0);
        video.muted = true;
        video
          .play()
          .then(() => {
            video.muted = false;
          })
          .catch(() => {});
      }
    },
    mute: () => {
      mutedRef.current = true;
      if (videoElRef.current) videoElRef.current.muted = true;
    },
    isPlaying: () => videoElRef.current !== null && !videoElRef.current.paused,
    preload: () => {
      shouldPreloadRef.current = true;
      hlsRef.current?.startLoad(0);
    },
  }));

  const src = extractM3u8Url(embedUrl);

  useEffect(() => {
    const video = videoElement;
    if (!video) return; // pool chưa inject — effect sẽ re-run khi videoElement thay đổi

    // Reset play intent khi nhận pool element mới
    shouldPlayRef.current = false;
    shouldPreloadRef.current = false;
    video.muted = true;

    // iOS/Mac Safari: hỗ trợ HLS native → set src trực tiếp
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      const onCanPlay = () => {
        onReadyRef.current?.();
        if (shouldPlayRef.current && video.paused) {
          video.muted = true;
          video
            .play()
            .then(() => {
              requestAnimationFrame(() => {
                if (shouldPlayRef.current) video.muted = mutedRef.current;
              });
            })
            .catch(() => {});
        }
      };
      video.addEventListener('canplay', onCanPlay);
      // eslint-disable-next-line consistent-return
      return () => {
        video.removeEventListener('canplay', onCanPlay);
        // Giải phóng hardware decoder của iOS Safari.
        // Chỉ pause() không đủ — iOS vẫn giữ decoder slot cho src còn gán.
        // removeAttribute('src') + load() mới thực sự trả decoder về pool.
        // (useSharedVideo cleanup cũng làm điều này khi unmount — không sao nếu gọi 2 lần)
        video.pause();
        video.removeAttribute('src');
        video.load();
      };
    }

    // Chrome, Firefox, Edge, Android → dùng hls.js làm bridge
    if (!Hls.isSupported()) return;

    const hls = new Hls({
      autoStartLoad: false, // Chỉ load manifest khi mount, KHÔNG load fragment.
      // Fragment chỉ load khi play() gọi hls.startLoad(0).
      startLevel: 0, // Luôn bắt đầu ở chất lượng thấp nhất (240p) → load nhanh hơn
      abrEwmaDefaultEstimate: 1200000,
      maxBufferLength: 10,
      backBufferLength: 0,
    });
    hlsRef.current = hls;
    hls.loadSource(src);
    hls.attachMedia(video);

    const onCanPlay = () => {
      onReadyRef.current?.();
      if (shouldPlayRef.current && video.paused) {
        video.muted = true;
        video
          .play()
          .then(() => {
            video.muted = mutedRef.current;
          })
          .catch(() => {});
      }
    };
    video.addEventListener('canplay', onCanPlay);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (shouldPreloadRef.current || shouldPlayRef.current) {
        hls.startLoad(0);
      }
      if (shouldPlayRef.current) {
        video.muted = true;
        video
          .play()
          .then(() => {
            video.muted = mutedRef.current;
          })
          .catch(() => {}); // nếu reject → canplay sẽ retry khi fragment về
      }
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        console.error('[BunnyVideoPlayer] HLS fatal error:', data.type, data.details, src);
      }
    });

    // eslint-disable-next-line consistent-return
    return () => {
      video.removeEventListener('canplay', onCanPlay);
      // hls.destroy() chạy SAU useSharedVideo cleanup (effect registration order).
      // src đã bị clear bởi useSharedVideo — hls.js xử lý detachMedia() gracefully.
      hls.destroy();
      hlsRef.current = null;
    };
  }, [videoElement, src]);

  // Sync muted prop khi đang play (ví dụ: user toggle mute từ slide khác)
  useEffect(() => {
    const video = videoElRef.current;
    if (video && !video.paused) {
      video.muted = muted;
    }
  }, [muted]);

  // Pool element được inject vào div này bởi useSharedVideo.
  // className từ parent (absolute inset-0 h-full w-full) định vị container.
  // Pool element bên trong có style inline tương đương (position:absolute;inset:0;...).
  return <div ref={containerRef} className={className} />;
});

export default BunnyVideoPlayer;
