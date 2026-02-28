import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';

import { useListVideo } from '@/api/video';
import type { NextPageWithLayout } from '@/types';

import SearchInput from './components/SearchInput';
import VideoGrid from './components/VideoGrid';

interface VideoQuery {
  searchText: string;
}

const DetailSearchPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { q } = router.query;
  const { data: videos, isLoading } = useListVideo();
  const [videoQuery, setVideoQuery] = useState<VideoQuery>({} as VideoQuery);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    if (q && typeof q === 'string') {
      setVideoQuery((prev) => ({ ...prev, searchText: q }));
    }
  }, [q]);

  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    if (!videoQuery.searchText) return videos;
    const lowerText = videoQuery.searchText.toLowerCase();
    return videos.filter((video) => video.title.toLowerCase().includes(lowerText));
  }, [videos, videoQuery]);

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide bg-white">
      <div className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md px-[10px] pt-[10px] pb-[10px] border-b border-neutral-100/80">
        <SearchInput
          onSearch={(searchText) => setVideoQuery({ ...videoQuery, searchText })}
          defaultValue={videoQuery.searchText}
        />
      </div>

      <VideoGrid videos={filteredVideos} isLoading={isLoading} />

      <div className="h-6" />
    </div>
  );
};

export default DetailSearchPage;
