import React, { useEffect, useRef, useState } from 'react';

import type { IVideo } from '@/api/video';

interface Props {
  videos: IVideo[];
  isLoading?: boolean;
}

const VideoGrid = ({ videos, isLoading }: Props) => {
  const [mutedVideos, setMutedVideos] = useState<Record<string, boolean>>(() => {
    // Khởi tạo tất cả videos là muted
    const initial: Record<string, boolean> = {};
    videos.forEach((video) => {
      initial[video.id] = true;
    });
    return initial;
  });

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Intersection Observer để autoplay khi video vào viewport
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    Object.keys(videoRefs.current).forEach((videoId) => {
      const videoElement = videoRefs.current[videoId];
      if (!videoElement) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Video vào viewport → play
              videoElement.play().catch(() => {
                // Ignore autoplay errors
              });
            } else {
              // Video ra khỏi viewport → pause
              videoElement.pause();
            }
          });
        },
        {
          threshold: 0.5, // Play khi 50% video visible
        }
      );

      observer.observe(videoElement);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [videos]);

  const toggleMute = (videoId: string) => {
    setMutedVideos((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };

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
              ref={(el) => {
                videoRefs.current[video.id] = el;
              }}
              src={video.link}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              muted={mutedVideos[video.id]}
              playsInline
              loop
              poster={video.thumbnail}
              preload="metadata"
            />
            {/* Play button — luôn visible */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rounded-full border-2 border-black bg-white/10 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 text-black"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            {/* Audio icon — góc dưới phải, clickable */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute(video.id);
              }}
              className="absolute bottom-2 right-2 rounded-full bg-black/60 p-1.5 hover:bg-black/80 transition-colors z-10 active:scale-95"
              aria-label={mutedVideos[video.id] ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {mutedVideos[video.id] ? (
                // Muted icon (VolumeX)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-white"
                >
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
                </svg>
              ) : (
                // Unmuted icon (Volume2)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-white"
                >
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                  <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.061z" />
                </svg>
              )}
            </button>
          </div>
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-tight">
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
