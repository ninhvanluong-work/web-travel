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
        className="absolute top-0 left-0 h-full w-full object-cover"
        src="https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4"
        autoPlay
        loop
        muted={isMuted}
        playsInline
      />

      <div className="absolute inset-0 bg-black/30" />
      <main className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 pt-20 md:justify-start md:pt-[60vh]">
        <div className="w-full max-w-3xl">
          <SearchBox />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
