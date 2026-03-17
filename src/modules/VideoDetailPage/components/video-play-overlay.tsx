import React from 'react';

import { Icons } from '@/assets/icons';

interface VideoPlayOverlayProps {
  visible: boolean;
  onPlay: () => void;
}

function VideoPlayOverlay({ visible, onPlay }: VideoPlayOverlayProps) {
  return (
    <div
      className={`absolute inset-0 z-10 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <button
        onClick={onPlay}
        aria-label="Phát video"
        className="flex items-center justify-center w-[60px] h-[60px] text-white drop-shadow-lg animate-pulse"
      >
        <Icons.playSolid className="w-full h-full" />
      </button>
    </div>
  );
}

export default VideoPlayOverlay;
