import { Volume2, VolumeX } from 'lucide-react';
import React from 'react';

import type { NextPageWithLayout } from '@/types';

import SearchBox from './components/SearchBox';

const HomePage: NextPageWithLayout = () => {
  const [isMuted, setIsMuted] = React.useState(true);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <video
        src="https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4"
        className="absolute top-0 left-0 h-full w-full object-cover"
        loop
        autoPlay
        muted={isMuted}
        playsInline
      />
      <div className="absolute inset-0 bg-black/30" />
      <main className="relative z-10 flex h-full w-full flex-col items-center justify-start pt-[60vh] px-4">
        <div className="w-full max-w-3xl">
          <SearchBox />
        </div>
      </main>

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-8 right-8 z-20 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/70"
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
      >
        {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default HomePage;
