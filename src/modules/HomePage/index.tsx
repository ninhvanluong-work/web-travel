import React from 'react';

import type { NextPageWithLayout } from '@/types';

import SearchBox from './components/SearchBox';

const HomePage: NextPageWithLayout = () => {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <video
        src="https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4"
        className="absolute top-0 left-0 h-full w-full object-cover"
        loop
        autoPlay
        muted
        playsInline
      />

      {/* Workaround for autoplay sound: Hidden iframe */}
      <iframe
        src="https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4"
        allow="autoplay"
        className="invisible absolute pointer-events-none"
        width="0"
        height="0"
        title="background-audio"
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
