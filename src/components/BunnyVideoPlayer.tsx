import Hls from 'hls.js';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

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
  preload: () => void; // Bắt đầu download fragment mà không play — dùng để chuẩn bị slide kế
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Refs để tránh stale closure trong async callbacks
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  // Capture intent: VideoSlide đã gọi play() nhưng HLS chưa sẵn → MANIFEST_PARSED retry
  const shouldPlayRef = useRef(false);
  // Preload intent: bắt đầu download fragment sớm cho slide kế, không cần play
  const shouldPreloadRef = useRef(false);

  useImperativeHandle(ref, () => ({
    /**
     * iOS-safe play: luôn mute trước khi play(), sau đó unmute khi play() resolve.
     * Gọi hls.startLoad() trước để bắt đầu load fragment (vì autoStartLoad=false).
     */
    play: () => {
      const video = videoRef.current;
      if (!video) return Promise.resolve();
      shouldPlayRef.current = true;
      // Bắt đầu load fragment nếu chưa — nếu manifest chưa parse xong thì sẽ defer tự động
      hlsRef.current?.startLoad(0);
      // Nếu đang play rồi thì chỉ cần sync muted state
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
          // tránh 2 video cùng phát tiếng khi swipe nhanh (IO callback order không đảm bảo).
          requestAnimationFrame(() => {
            if (shouldPlayRef.current) video.muted = mutedRef.current;
          });
        })
        .catch(() => {});
    },
    pause: () => {
      shouldPlayRef.current = false;
      videoRef.current?.pause();
    },
    /**
     * unmute trong user gesture (button click):
     * - Nếu đang play: set muted=false trực tiếp
     * - Nếu đang pause: gọi play() để unlock iOS audio session
     */
    unmute: () => {
      const video = videoRef.current;
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
      if (videoRef.current) videoRef.current.muted = true;
    },
    isPlaying: () => videoRef.current !== null && !videoRef.current.paused,
    preload: () => {
      shouldPreloadRef.current = true;
      hlsRef.current?.startLoad(0); // no-op nếu manifest chưa parse → MANIFEST_PARSED sẽ xử lý
    },
  }));

  const src = extractM3u8Url(embedUrl);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    video.muted = true; // Luôn bắt đầu muted

    // iOS/Mac Safari: hỗ trợ HLS native → set src, VideoSlide sẽ gọi play() qua ref
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      // Không dùng { once: true } — cần retry khi buffering stall rồi phục hồi
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
      return () => video.removeEventListener('canplay', onCanPlay);
    }

    // Chrome, Firefox, Edge, Android → dùng hls.js làm bridge
    if (!Hls.isSupported()) return undefined;

    const hls = new Hls({
      autoStartLoad: false, // Chỉ load manifest khi mount, KHÔNG load fragment.
      // Fragment chỉ load khi play() gọi hls.startLoad(0).
      // Tránh nhiều video đồng thời download segment → tranh băng thông.
      startLevel: 0, // Luôn bắt đầu ở chất lượng thấp nhất (240p) → load nhanh hơn,
      // sau đó ABR tự nâng quality khi buffer đủ.
      abrEwmaDefaultEstimate: 1200000,
      maxBufferLength: 10,
      backBufferLength: 0,
    });
    hlsRef.current = hls;
    hls.loadSource(src);
    hls.attachMedia(video);

    // canplay fires khi video có đủ data để bắt đầu phát.
    // Đây là retry chính: play() có thể bị reject khi SourceBuffer còn trống,
    // canplay đảm bảo video sẽ phát ngay khi fragment đầu tiên sẵn sàng.
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
      // startLoad nếu cần preload (slide kế) hoặc đang chờ play
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
          .catch(() => {}); // Nếu reject → canplay sẽ retry khi fragment về
      }
    });
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        console.error('[BunnyVideoPlayer] HLS fatal error:', data.type, data.details, src);
      }
    });
    return () => {
      video.removeEventListener('canplay', onCanPlay);
      hls.destroy();
    };
  }, [src]);

  // Sync muted prop khi đang play (ví dụ: user toggle mute từ slide khác)
  useEffect(() => {
    const video = videoRef.current;
    if (video && !video.paused) {
      video.muted = muted;
    }
  }, [muted]);

  return (
    <video
      ref={videoRef}
      className={className}
      // KHÔNG đặt muted prop — React reconciliation sẽ override video.muted giữa
      // mute() và play(), khiến iOS block. Quản lý hoàn toàn imperatively.
      poster={poster}
      loop
      playsInline
      style={{ objectFit: 'cover' }}
    />
  );
});

export default BunnyVideoPlayer;
