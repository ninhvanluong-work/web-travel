import React, { useCallback, useState } from 'react';

import type { IVideo } from '@/api/video';
import { Icons } from '@/assets/icons';

import VideoCard from './VideoCard';

interface Props {
  videos: IVideo[];
  isLoading?: boolean;
}

const VideoGrid = ({ videos, isLoading }: Props) => {
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  const handleRequestAudio = useCallback((id: string) => {
    setActiveAudioId((prev) => (prev === id ? null : id));
  }, []);

  const handleAudioDeactivate = useCallback((id: string) => {
    setActiveAudioId((prev) => (prev === id ? null : prev));
  }, []);

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

  return (
    <div className="grid grid-cols-2 gap-[2px] w-full">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          isAudioActive={activeAudioId === video.id}
          onRequestAudio={handleRequestAudio}
          onAudioDeactivate={handleAudioDeactivate}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
