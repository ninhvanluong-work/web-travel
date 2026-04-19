import { extractM3u8Url } from '@/lib/bunny';

// iOS only: AVFoundation does not buffer segments without play().
// Shadow element not used — each <video> has its own AVPlayer buffer.
// Android/desktop: pool element handles preloading via autoStartLoad:true.

let currentUrl: string | null = null;

function preload(embedUrl: string) {
  if (!embedUrl || typeof window === 'undefined') return;

  const testEl = document.createElement('video');
  const isIos = !!testEl.canPlayType('application/vnd.apple.mpegurl');

  // Android/desktop: BunnyVideoPlayer autoStartLoad:true handles fragment loading
  // as soon as the slide activates (isNearView). No extra work needed here.
  if (!isIos) return;

  const m3u8Url = extractM3u8Url(embedUrl);
  if (currentUrl === m3u8Url) return;
  currentUrl = m3u8Url;

  // iOS: fetch() segments into NSURLCache (shared with AVFoundation's NSURLSession
  // within the same WKWebView process). When AVFoundation requests the same URLs,
  // it gets cache hits — bypasses iOS's throttling of background <video> elements.
  const base = m3u8Url.replace('/playlist.m3u8', '');
  [
    m3u8Url,
    `${base}/240p/video.m3u8`,
    `${base}/240p/video0.ts`,
    `${base}/240p/video1.ts`,
    `${base}/240p/video2.ts`,
  ].forEach((url) => {
    fetch(url, { mode: 'cors', credentials: 'omit' }).catch(() => {});
  });
}

function cancel() {
  currentUrl = null;
}

export function useVideoPreloader() {
  return { preload, cancel };
}
