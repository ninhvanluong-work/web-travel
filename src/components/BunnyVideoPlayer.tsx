import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

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

export interface BunnyPlayerHandle {
  play: () => void;
  pause: () => void;
}

interface Props {
  muted?: boolean;
  autoPlay?: boolean;
  embedUrl: string;
  className?: string;
}

const BunnyVideoPlayer = forwardRef<BunnyPlayerHandle, Props>(function BunnyVideoPlayer(
  { muted = true, autoPlay = true, embedUrl, className },
  ref
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<PlayerJS | null>(null);
  const readyRef = useRef(false);
  const pendingPlayRef = useRef<boolean | null>(null);
  const [ready, setReady] = useState(false);

  // Freeze src on mount — never recompute to avoid iframe reload
  const srcRef = useRef(
    `${embedUrl}?${new URLSearchParams({
      autoplay: String(autoPlay),
      muted: String(muted),
      preload: 'true',
      responsive: 'true',
      loop: 'true',
      playsinline: 'true',
    })}`
  );

  // Init player khi script đã load
  const initPlayer = useCallback(() => {
    if (!iframeRef.current || !window.playerjs) return;
    const p = new window.playerjs.Player(iframeRef.current);
    playerRef.current = p;

    p.on('ready', () => {
      readyRef.current = true;
      setReady(true);
      if (pendingPlayRef.current === true) {
        pendingPlayRef.current = null;
        p.play();
      } else if (pendingPlayRef.current === false) {
        pendingPlayRef.current = null;
        p.pause();
      }
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

  useImperativeHandle(ref, () => ({
    play: () => {
      if (readyRef.current && playerRef.current) {
        playerRef.current.play();
      } else {
        pendingPlayRef.current = true;
      }
    },
    pause: () => {
      if (readyRef.current && playerRef.current) {
        pendingPlayRef.current = null;
        playerRef.current.pause();
      } else {
        pendingPlayRef.current = false;
      }
    },
  }));

  return (
    <iframe
      ref={iframeRef}
      src={srcRef.current}
      onLoad={handleIframeLoad}
      loading="lazy"
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      className={className}
      style={{ border: 'none' }}
    />
  );
});

export default BunnyVideoPlayer;
