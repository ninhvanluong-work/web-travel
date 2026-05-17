import { useEffect, useRef, useState } from 'react';

/**
 * Tracks which section ID is currently "active" based on scroll position.
 * Works with a custom scroll container (e.g. <main class="overflow-y-auto">),
 * not the window. Uses getBoundingClientRect relative to the viewport.
 *
 * @param ids     Ordered list of section element IDs (top to bottom in DOM)
 * @param offset  Pixel offset from viewport top to consider a section "active"
 *                (should match sticky header height + small buffer)
 */
export function useScrollSpy(ids: string[], offset = 80) {
  const [activeId, setActiveId] = useState(ids[0]);
  const idsRef = useRef(ids);
  idsRef.current = ids;

  useEffect(() => {
    // The scroll container is <main> in AdminLayout (overflow-y-auto), not window.
    const scrollEl: Element | Window = document.querySelector('main') ?? window;

    const onScroll = () => {
      const { current } = idsRef;
      // Walk sections top→bottom; last one whose top is at or above offset wins.
      let found = current[0];
      current.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) {
          found = id;
        }
      });
      setActiveId(found);
    };

    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    // Run once on mount so the initial active section is correct.
    onScroll();
    return () => scrollEl.removeEventListener('scroll', onScroll);
  }, [offset]); // stable: ids accessed via ref

  return activeId;
}
