import { useCallback, useEffect, useRef, useState } from 'react';

// Khai báo type cho Player.js
interface PlayerJS {
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  supports: (type: 'method' | 'event', name: string) => boolean;
  play: () => void;
  pause: () => void;
  getPaused: (cb: (v: boolean) => void) => void;
  mute: () => void;
  unmute: () => void;
  getMuted: (cb: (v: boolean) => void) => void;
  setVolume: (v: number) => void;
  getVolume: (cb: (v: number) => void) => void;
  getDuration: (cb: (v: number) => void) => void;
  getCurrentTime: (cb: (v: number) => void) => void;
  setCurrentTime: (v: number) => void;
}

declare global {
  interface Window {
    playerjs: { Player: new (el: HTMLIFrameElement) => PlayerJS };
  }
}

interface Props {
  autoplay?: boolean;
  muted?: boolean;
  embedUrl: string;
  className?: string;
}

export default function BunnyVideoPlayer({ muted = true, embedUrl, className }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<PlayerJS | null>(null);
  const [ready, setReady] = useState(false);

  // Freeze src on mount — never recompute to avoid iframe reload
  const srcRef = useRef(
    `${embedUrl}?${new URLSearchParams({
      autoplay: 'true',
      muted: String(muted),
      preload: 'true',
      responsive: 'true',
      loop: 'true',
    })}`
  );

  // Init player khi script đã load
  const initPlayer = useCallback(() => {
    if (!iframeRef.current || !window.playerjs) return;
    const p = new window.playerjs.Player(iframeRef.current);
    playerRef.current = p;

    p.on('ready', () => {
      setReady(true);
    });
  }, []);

  // Load player.js từ Bunny CDN
  useEffect(() => {
    if (window.playerjs) {
      initPlayer();
      return () => {};
    }
    const s = document.createElement('script');
    s.src = 'https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js';
    s.onload = () => initPlayer();
    document.head.appendChild(s);
    return () => {
      s.remove();
    };
  }, [initPlayer]);

  // Retry init khi iframe load xong
  const handleIframeLoad = () => {
    if (window.playerjs && !playerRef.current) initPlayer();
  };

  // Sync muted prop → playerjs API (không reload iframe)
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    if (muted) playerRef.current.mute();
    else playerRef.current.unmute();
  }, [muted, ready]);

  return (
    <iframe
      ref={iframeRef}
      src={srcRef.current}
      onLoad={handleIframeLoad}
      loading="lazy"
      allow="accelerometer; gyroscope; autoplay;"
      allowFullScreen
      className={className}
      style={{ border: 'none' }}
    />
  );
}
