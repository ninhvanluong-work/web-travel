import Hls from 'hls.js';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { useSharedVideo } from '@/hooks/use-shared-video';
import { extractM3u8Url } from '@/lib/bunny';
import { logger } from '@/lib/logger';

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

  const src = extractM3u8Url(embedUrl);
  const srcRef = useRef(src);
  srcRef.current = src;

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
        .catch((err) => {
          logger.warn('play() rejected on swipe', { src, reason: (err as Error).message });
        });
    },
    pause: () => {
      // No-op if never officially played — prevents re-render from killing a
      // preload-initiated play() before the user swipes to this slide.
      if (!shouldPlayRef.current) return;
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
          .catch((err) => {
            logger.warn('play() rejected on unmute', { src, reason: (err as Error).message });
          });
      }
    },
    mute: () => {
      mutedRef.current = true;
      if (videoElRef.current) videoElRef.current.muted = true;
    },
    isPlaying: () => videoElRef.current !== null && !videoElRef.current.paused,
    preload: () => {
      shouldPreloadRef.current = true;
      const video = videoElRef.current;
      if (video && video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = srcRef.current;
          video.load();
        }
        // iOS won't buffer segments without play(). Muted off-screen play forces
        // AVFoundation to fill its buffer before user swipes. shouldPlayRef is NOT
        // set here — when the real play() is called on swipe, video is already
        // playing so it just updates muted state (near-instant).
        video.muted = true;
        video.play().catch((err) => {
          logger.debug('preload play() rejected (expected on iOS backgrounding)', { reason: (err as Error).message });
        });
        return;
      }
      hlsRef.current?.startLoad(0);
    },
  }));

  useEffect(() => {
    const video = videoElement;
    if (!video) return; // pool chưa inject — effect sẽ re-run khi videoElement thay đổi

    // KHÔNG reset shouldPlayRef ở đây — play() có thể đã được gọi từ VideoSlide
    // trước khi pool element arrive (do React effect ordering).
    // shouldPlayRef.current = false nằm trong useRef(false) là đủ — fresh mỗi lần component mount.
    video.muted = true;

    // iOS/Mac Safari: hỗ trợ HLS native → set src trực tiếp
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      // preload() may have been called before pool element arrived (setState delay).
      // shouldPreloadRef=true means we need a silent play to force AVFoundation buffering.
      if (shouldPreloadRef.current && !shouldPlayRef.current) {
        video.muted = true;
        video.play().catch((err) => {
          logger.debug('preload play() rejected on pool arrive', { reason: (err as Error).message });
        });
      }
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
            .catch((err) => {
              logger.warn('play() rejected on canplay (iOS)', { src, reason: (err as Error).message });
            });
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
      autoStartLoad: true, // Start loading fragments immediately on mount.
      // Adjacent slides activate early (rootMargin:'150%'), so fragments are in
      // buffer before the user swipes — eliminates cold-start delay on every swipe.
      startLevel: 0,
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
          .catch((err) => {
            logger.warn('play() rejected on canplay (Android)', { src, reason: (err as Error).message });
          });
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
          .catch((err) => {
            logger.debug('play() rejected on MANIFEST_PARSED — canplay will retry', { reason: (err as Error).message });
          });
      }
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        logger.fatal('HLS fatal error', { type: data.type, details: data.details, src });
      } else {
        logger.debug('HLS non-fatal error', { type: data.type, details: data.details });
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
