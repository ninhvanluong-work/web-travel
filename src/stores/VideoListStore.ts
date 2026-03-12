import { createSelectorFunctions } from 'auto-zustand-selectors-hook';
import { create } from 'zustand';

import type { IVideo } from '@/api/video';

interface IVideoListStore {
  videos: IVideo[];
  query: string | undefined;
  rootVideo: IVideo | null;
  excludeIds: string[];
  nextCursor: number | null;
  setList: (
    videos: IVideo[],
    query?: string,
    rootVideo?: IVideo,
    excludeIds?: string[],
    nextCursor?: number | null
  ) => void;
  clear: () => void;
}

const useBaseVideoListStore = create<IVideoListStore>()((set) => ({
  videos: [],
  query: undefined,
  rootVideo: null,
  excludeIds: [],
  nextCursor: null,
  setList: (videos, query, rootVideo, excludeIds, nextCursor) =>
    set({ videos, query, rootVideo: rootVideo ?? null, excludeIds: excludeIds ?? [], nextCursor: nextCursor ?? null }),
  clear: () => set({ videos: [], query: undefined, rootVideo: null, excludeIds: [], nextCursor: null }),
}));

export const useVideoListStore = createSelectorFunctions(useBaseVideoListStore);
