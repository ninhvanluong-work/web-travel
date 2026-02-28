import React from 'react';

import type { IVideo } from '@/api/video';
import { Icons } from '@/assets/icons';

import VideoCard from './VideoCard';

interface Props {
  videos: IVideo[];
  isLoading?: boolean;
}

const VideoGrid = ({ videos, isLoading }: Props) => {
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

  const allIds = videos.map((v) => v.id);

  return (
    <div className="grid grid-cols-2 gap-[2px] w-full">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} allIds={allIds} />
      ))}
    </div>
  );
};

export default VideoGrid;
