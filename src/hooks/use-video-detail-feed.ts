import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { IVideo } from '@/api/video';
import { useInfiniteListVideo, useVideoBySlug } from '@/api/video';
import { useVideoListStore } from '@/stores';

const PREFETCH_OFFSET = 2;
const BUNNY_CDN = 'https://vz-186cf1b9-231.b-cdn.net';

function prefetchHls(embedUrl: string) {
  const guid = embedUrl.split('/').pop()?.split('?')[0];
  if (!guid) return;
  const base = `${BUNNY_CDN}/${guid}`;

  // Gửi tất cả request song song (HTTP/2 multiplexing trên cùng 1 TCP connection).
  // Fetch 3 segment đầu (~6-9 giây video ở 240p) để HLS.js lấy từ cache ngay,
  // thay vì download tuần tự → video play gần như không cần chờ.
  [
    `${base}/playlist.m3u8`,
    `${base}/240p/video.m3u8`,
    `${base}/240p/video0.ts`,
    `${base}/240p/video1.ts`,
    `${base}/240p/video2.ts`,
  ].forEach((url) => fetch(url).catch(() => {}));
}

export const useVideoDetailFeed = (currentSlug: string) => {
  const router = useRouter();

  const storeVideos = useVideoListStore.use.videos();
  const storeQuery = useVideoListStore.use.query();
  const storeRootVideo = useVideoListStore.use.rootVideo();
  const storeExcludeIds = useVideoListStore.use.excludeIds();

  const hasStoreList = storeVideos.length > 0;

  // rootSlug: the URL slug at page load — locked in once router is ready.
  // currentSlug updates on every scroll (router.replace), so we must NOT pass it
  // to the API hooks or they will re-fire on every swipe.
  const [rootSlug, setRootSlug] = useState(currentSlug);
  useEffect(() => {
    if (currentSlug && !rootSlug) setRootSlug(currentSlug);
  }, [currentSlug, rootSlug]);

  const { data: slugVideo } = useVideoBySlug({
    variables: { slug: rootSlug },
    enabled: !!rootSlug && !hasStoreList,
  });

  // Capture store video IDs once on mount to use as excludeIds when fetching more
  const initialStoreExcludeIdsRef = useRef<string[]>(
    hasStoreList ? [...storeExcludeIds, ...storeVideos.map((v) => v.id)] : []
  );

  // Case 1 & 2: navigate từ SearchPage — không auto-fetch, chỉ fetch khi user scroll đến cuối
  const {
    data: storeInfiniteData,
    fetchNextPage: storeFetchNextPage,
    hasNextPage: storeHasNextPage,
    isFetchingNextPage: storeIsFetchingNextPage,
  } = useInfiniteListVideo({
    variables: {
      query: storeQuery,
      rootId: storeRootVideo?.id,
      excludeIds: initialStoreExcludeIdsRef.current,
      distanceScore: 0,
    },
    enabled: false,
  });

  // Case 3: reload / direct access
  const {
    data: reloadInfiniteData,
    fetchNextPage: reloadFetchNextPage,
    hasNextPage: reloadHasNextPage,
    isFetchingNextPage: reloadIsFetchingNextPage,
  } = useInfiniteListVideo({
    variables: { rootId: slugVideo?.id },
    enabled: !hasStoreList && !!slugVideo,
  });

  const allReloadVideos = useMemo(() => reloadInfiniteData?.pages.flatMap((p) => p.items) ?? [], [reloadInfiniteData]);

  const fallbackVideos = useMemo<IVideo[]>(() => {
    if (!slugVideo) return allReloadVideos;
    const rest = allReloadVideos.filter((v) => v.slug !== slugVideo.slug);
    return [slugVideo, ...rest];
  }, [slugVideo, allReloadVideos]);

  const videos = useMemo(() => {
    if (hasStoreList) {
      return [...storeVideos, ...(storeInfiniteData?.pages.flatMap((p) => p.items) ?? [])];
    }
    return fallbackVideos;
  }, [hasStoreList, storeVideos, storeInfiniteData, fallbackVideos]);

  const initialIndex = useMemo(() => {
    if (!currentSlug || videos.length === 0) return 0;
    const idx = videos.findIndex((v) => v.slug === currentSlug);
    return idx >= 0 ? idx : 0;
  }, [currentSlug, videos]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const indexInitialized = useRef(false);
  useEffect(() => {
    if (indexInitialized.current || videos.length === 0) return;
    setCurrentIndex(initialIndex);
    indexInitialized.current = true;
  }, [initialIndex, videos.length]);

  // Infinite scroll trigger
  useEffect(() => {
    const atEnd = currentIndex >= videos.length - PREFETCH_OFFSET;
    if (!atEnd) return;
    if (hasStoreList) {
      const canFetch = storeInfiniteData === undefined || storeHasNextPage;
      if (canFetch && !storeIsFetchingNextPage) storeFetchNextPage();
    } else if (reloadHasNextPage && !reloadIsFetchingNextPage) {
      reloadFetchNextPage();
    }
  }, [
    currentIndex,
    videos.length,
    hasStoreList,
    storeInfiniteData,
    storeHasNextPage,
    storeIsFetchingNextPage,
    storeFetchNextPage,
    reloadHasNextPage,
    reloadIsFetchingNextPage,
    reloadFetchNextPage,
  ]);

  // Scroll to initial video
  const initialScrolled = useRef(false);
  useEffect(() => {
    if (initialScrolled.current || !currentSlug || videos.length === 0) return;
    initialScrolled.current = true;
    if (initialIndex === 0) return;
    const el = document.getElementById(`video-slide-${currentSlug}`);
    el?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
  }, [currentSlug, videos, initialIndex]);

  // URL sync via router.replace (deferred to RAF to avoid snap jitter)
  const visibleSlugRef = useRef(currentSlug);
  useEffect(() => {
    if (currentSlug && !visibleSlugRef.current) visibleSlugRef.current = currentSlug;
  }, [currentSlug]);

  // videosRef keeps handleVideoVisible stable — no re-render of all slides when list grows
  const videosRef = useRef(videos);
  videosRef.current = videos;

  const rafRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const handleVideoVisible = useCallback(
    (videoSlug: string) => {
      if (videoSlug === visibleSlugRef.current) return;
      visibleSlugRef.current = videoSlug;
      const newIndex = videosRef.current.findIndex((v) => v.slug === videoSlug);
      if (newIndex >= 0) setCurrentIndex(newIndex);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        router.replace(`/video/${videoSlug}`, undefined, { shallow: true });
      });
    },
    [router]
  );

  const handleVideoTestVisible = useCallback(
    (videoSlug: string) => {
      if (videoSlug === visibleSlugRef.current) return;
      visibleSlugRef.current = videoSlug;
      const newIndex = videosRef.current.findIndex((v) => v.slug === videoSlug);
      if (newIndex >= 0) {
        setCurrentIndex(newIndex);
        // Prefetch HLS của 2 video kế tiếp để sẵn sàng trong browser cache
        [newIndex + 1, newIndex + 2].forEach((i) => {
          const next = videosRef.current[i];
          if (next?.embedUrl) prefetchHls(next.embedUrl);
        });
      }
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        router.replace(`/video/${videoSlug}`, undefined, { shallow: true });
      });
    },
    [router]
  );

  const isReloadInitializing = !hasStoreList && !!slugVideo && !reloadInfiniteData;

  return {
    videos,
    currentIndex,
    initialIndex,
    handleVideoVisible,
    handleVideoTestVisible,
    isReloadInitializing,
    hasStoreList,
  };
};
