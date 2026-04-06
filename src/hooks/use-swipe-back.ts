import { useRouter } from 'next/router';
import { useRef } from 'react';

interface Options {
  disabled?: boolean;
  threshold?: number; // fraction of screen width, default 0.3
  velocityMin?: number; // px/ms, default 0.3
  resistance?: number; // drag resistance factor 0-1, default 0.85
}

export function useSwipeBack({
  disabled = false,
  threshold = 0.3,
  velocityMin = 0.3,
  resistance = 0.85,
}: Options = {}) {
  const router = useRouter();
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const dragging = useRef(false);
  const rafId = useRef<number | null>(null);
  const currentDeltaX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const applyTransform = (deltaX: number) => {
    if (!containerRef.current) return;
    // Rubber band resistance: feels weighted, not 1:1
    const damped = deltaX * resistance;
    containerRef.current.style.transform = `translateX(${damped}px)`;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    startTime.current = Date.now();
    dragging.current = false;
    currentDeltaX.current = 0;

    if (containerRef.current) {
      containerRef.current.style.transition = 'none';
      containerRef.current.style.willChange = 'transform';
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (disabled) return;
    const deltaX = e.clientX - startX.current; // positive = swiping right
    const deltaY = Math.abs(e.clientY - startY.current);

    // Only handle clear horizontal right swipe
    if (deltaX <= 0) return;
    if (deltaY > deltaX) return; // vertical gesture, ignore

    dragging.current = true;
    currentDeltaX.current = deltaX;

    // Schedule RAF to avoid layout thrashing
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => applyTransform(deltaX));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    if (disabled || !dragging.current) return;
    dragging.current = false;

    const deltaX = e.clientX - startX.current;
    const elapsed = Date.now() - startTime.current;
    const velocity = deltaX / elapsed;
    const screenWidth = window.innerWidth;
    const passedThreshold = deltaX / screenWidth >= threshold;
    const fastEnough = velocity >= velocityMin;

    if (passedThreshold || fastEnough) {
      // Slide out before navigating
      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.2s ease-out';
        containerRef.current.style.transform = `translateX(${screenWidth}px)`;
      }
      setTimeout(() => router.back(), 200);
      return;
    }

    // Snap back with spring-like easing
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      containerRef.current.style.transform = 'translateX(0)';
      containerRef.current.style.willChange = 'auto';
    }
  };

  return { containerRef, onPointerDown, onPointerMove, onPointerUp };
}
