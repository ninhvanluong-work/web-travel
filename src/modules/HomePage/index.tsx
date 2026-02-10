import React, { useEffect, useRef, useState } from 'react';

import type { NextPageWithLayout } from '@/types';

import SearchBox from './components/SearchBox';

const HomePage: NextPageWithLayout = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video
        .play()
        .then(() => {
          setIsMuted(false);
        })
        .catch((error) => {
          console.log('Autoplay with sound prevented:', error);
          video.muted = true;
          video.play();
          setIsMuted(true);
        });
    }
  }, []);

  const unmuteOnInteraction = () => {
    if (videoRef.current && isMuted) {
      videoRef.current.muted = false;
      videoRef.current.play();
      setIsMuted(false);
    }
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onClick={unmuteOnInteraction}
      onTouchStart={unmuteOnInteraction}
    >
      <video
        ref={videoRef}
        id="myVideo"
        className="absolute top-1/2 left-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
        src="https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4"
        autoPlay
        loop
        muted={isMuted}
        playsInline
      />

      <div className="absolute inset-0 bg-black/30" />
      <main className="relative z-10 h-full w-full pointer-events-none">
        <div className="absolute top-[85%] left-1/2 w-full max-w-3xl -translate-x-1/2 px-4 pointer-events-auto">
          <SearchBox />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
