import { createSelectorFunctions } from 'auto-zustand-selectors-hook';
import { create } from 'zustand';

import type { IVideo } from '@/api/video';

interface IVideoListStore {
  videos: IVideo[];
  query: string | undefined;
  setList: (videos: IVideo[], query?: string) => void;
  clear: () => void;
}

const useBaseVideoListStore = create<IVideoListStore>()((set) => ({
  videos: [],
  query: undefined,
  setList: (videos, query) => set({ videos, query }),
  clear: () => set({ videos: [], query: undefined }),
}));

export const useVideoListStore = createSelectorFunctions(useBaseVideoListStore);
