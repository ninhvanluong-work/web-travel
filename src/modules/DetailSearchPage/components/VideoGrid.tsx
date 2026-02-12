import React from 'react';

import type { IVideo } from '@/api/video';

interface Props {
  videos: IVideo[];
  isLoading?: boolean;
}

const VideoGrid = ({ videos, isLoading }: Props) => {
  if (isLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (videos.length === 0) {
    return <div className="p-10 text-center text-gray-500">No videos found.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4 w-full p-1">
      {videos.map((video) => (
        <div
          key={video.id}
          className="group relative overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg border border-gray-100"
        >
          <div className="aspect-[3/4] w-full overflow-hidden bg-gray-200 relative">
            <video
              src={video.link}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              muted
              playsInline
              poster={video.thumbnail}
              preload="none"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 text-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-3">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
              {video.title}
            </h3>
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{video.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
