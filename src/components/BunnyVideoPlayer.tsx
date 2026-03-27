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
}

interface Props {
  muted?: boolean;
  embedUrl: string;
  className?: string;
}

const BunnyVideoPlayer = forwardRef<BunnyPlayerHandle, Props>(function BunnyVideoPlayer(
  { muted = true, embedUrl, className },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Refs để tránh stale closure trong async callbacks
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  // Capture intent: VideoSlide đã gọi play() nhưng HLS chưa sẵn → MANIFEST_PARSED retry
  const shouldPlayRef = useRef(false);

  useImperativeHandle(ref, () => ({
    /**
     * iOS-safe play: luôn mute trước khi play(), sau đó unmute khi play() resolve.
     * Không dùng React prop để set muted vì React reconciliation có thể override
     * video.muted giữa mute() và play(), khiến iOS block.
     */
    play: () => {
      const video = videoRef.current;
      if (!video) return Promise.resolve();
      shouldPlayRef.current = true;
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
          video.muted = mutedRef.current;
        })
        .catch(() => {});
    },
    pause: () => {
      shouldPlayRef.current = false;
      videoRef.current?.pause();
    },
    /**
     * unmute trong user gesture (button click):
     * - Nếu đang play: set muted=false trực tiếp (iOS cho phép sau khi play() đã chạy)
     * - Nếu đang pause: cần gọi play() để unlock iOS audio session
     */
    unmute: () => {
      const video = videoRef.current;
      if (!video) return;
      mutedRef.current = false;
      if (!video.paused) {
        video.muted = false;
      } else {
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
  }));

  const src = extractM3u8Url(embedUrl);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    video.muted = true; // Luôn bắt đầu muted

    // iOS/Mac Safari: hỗ trợ HLS native → set src, VideoSlide sẽ gọi play() qua ref
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return undefined;
    }

    // Chrome, Firefox, Edge, Android → dùng hls.js làm bridge
    if (!Hls.isSupported()) return undefined;

    const hls = new Hls({
      startLevel: -1, // để ABR tự chọn level
      abrEwmaDefaultEstimate: 1200000, // estimate 1.2Mbps → ABR chọn 240p để start
      maxBufferLength: 8, // chỉ cần 8s buffer để bắt đầu phát
      backBufferLength: 0, // không buffer ngược
      startFragPrefetch: true, // bắt đầu tải fragment sớm hơn
    });
    hlsRef.current = hls;
    hls.loadSource(src);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      // VideoSlide đã gọi play() trước khi HLS sẵn → retry bây giờ
      if (shouldPlayRef.current && video.paused) {
        video.muted = true;
        video
          .play()
          .then(() => {
            video.muted = mutedRef.current;
          })
          .catch(() => {});
      }
    });
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        console.error('[BunnyVideoPlayer] HLS fatal error:', data.type, data.details, src);
      }
    });
    return () => {
      hls.destroy();
    };
  }, [src]);

  // Sync muted prop khi đang play (ví dụ: user toggle mute từ slide khác)
  // Chỉ apply khi đang play để tránh can thiệp vào chuỗi mute→play→unmute
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
      // QUAN TRỌNG: KHÔNG đặt muted prop ở đây.
      // React reconciliation sẽ ghi đè video.muted = false (khi prop=false)
      // ngay giữa lúc ta gọi mute() và play(), làm iOS block play().
      // Thay vào đó, muted được quản lý hoàn toàn imperatively qua mutedRef + effects.
      loop
      playsInline
      style={{ objectFit: 'cover' }}
    />
  );
});

export default BunnyVideoPlayer;
