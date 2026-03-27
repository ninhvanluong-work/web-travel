import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { IVideo, IVideoPage } from '@/api/video';
import { Icons } from '@/assets/icons';
import { useInView } from '@/hooks/useInview';
import { useVideoListStore } from '@/stores';

import VideoCard from './VideoCard';

const PREFETCH_OFFSET = 3;

interface Props {
  videos: IVideo[];
  pages?: IVideoPage[];
  query?: string;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingMore?: boolean;
  hasScrolled?: boolean;
  onFetchMore?: () => void;
}

const VideoGrid = ({
  videos,
  pages,
  query,
  isLoading,
  hasNextPage,
  isFetchingMore,
  hasScrolled,
  onFetchMore,
}: Props) => {
  const router = useRouter();
  const setList = useVideoListStore.use.setList();
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);

  const isSentinelInView = useInView(sentinelEl, { threshold: 0.1 });
  const onFetchMoreRef = useRef(onFetchMore);
  onFetchMoreRef.current = onFetchMore;
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isSentinelInView) {
      fetchedRef.current = false;
      return;
    }
    if (hasScrolled && hasNextPage && !isFetchingMore && !fetchedRef.current) {
      fetchedRef.current = true;
      onFetchMoreRef.current?.();
    }
  }, [isSentinelInView, hasNextPage, isFetchingMore, hasScrolled]);

  const handleRequestAudio = useCallback((id: string) => {
    setActiveAudioId((prev) => (prev === id ? null : id));
  }, []);

  const handleAudioDeactivate = useCallback((id: string) => {
    setActiveAudioId((prev) => (prev === id ? null : prev));
  }, []);

  const handleVideoClick = useCallback(
    (id: string) => {
      const video = videos.find((v) => v.id === id);
      if (!video) return;
      const clickedIndex = videos.findIndex((v) => v.id === id);
      const excludeIds = videos.slice(0, clickedIndex).map((v) => v.id);
      const videosFromClicked = videos.slice(clickedIndex);

      let nextCursor: number | null = null;
      if (pages) {
        let count = 0;
        const foundPage = pages.find((page) => {
          count += page.items.length;
          return clickedIndex < count;
        });
        nextCursor = foundPage?.nextCursor ?? null;
      }

      setList(videosFromClicked, query, video, excludeIds, nextCursor);
      router.push(`/video/${video.slug}?autoplay=true`);
    },
    [router, videos, pages, query, setList]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-[2px] w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] w-full bg-neutral-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <Icons.videoOff className="w-10 h-10 text-neutral-300" />
        <p className="text-neutral-400 text-sm font-dinpro">Không tìm thấy video</p>
      </div>
    );
  }

  const sentinelIndex = videos.length - PREFETCH_OFFSET;

  return (
    <>
      <div className="grid grid-cols-2 gap-[2px] w-full">
        {videos.map((video, index) => (
          <div key={video.id} ref={index === sentinelIndex ? setSentinelEl : undefined}>
            <VideoCard
              video={video}
              index={index}
              isAudioActive={activeAudioId === video.id}
              isDimmed={activeAudioId !== null && activeAudioId !== video.id}
              onRequestAudio={handleRequestAudio}
              onAudioDeactivate={handleAudioDeactivate}
              onVideoClick={handleVideoClick}
            />
          </div>
        ))}
      </div>

      {isFetchingMore && (
        <div className="grid grid-cols-2 gap-[2px] w-full">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] w-full bg-neutral-100 animate-pulse" />
          ))}
        </div>
      )}

      {!hasNextPage && !isLoading && videos.length > 0 && (
        <p className="text-center text-gray-400 text-sm py-6 font-dinpro">No more videos found</p>
      )}
    </>
  );
};

export default VideoGrid;
