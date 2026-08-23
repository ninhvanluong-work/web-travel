import { createSelectorFunctions } from 'auto-zustand-selectors-hook';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ILoginResponse, IUser } from '@/api/auth';

export interface IAdminQueryStore {
  adminUser: IUser;
  adminAccessToken: string;
  adminRefreshToken?: string;
  setAdminStore: (data: ILoginResponse) => void;
  setAdminAccessToken: (data: string) => void;
  logoutAdmin: () => void;
}

const useBaseAdminStore = create<IAdminQueryStore>()(
  persist(
    (set) => ({
      adminAccessToken: '',
      adminRefreshToken: undefined,
      adminUser: {} as IUser,
      setAdminStore: (data) =>
        set(() => ({
          adminAccessToken: data.accessToken,
          adminRefreshToken: data.refreshToken,
          adminUser: data.user,
        })),
      setAdminAccessToken: (data) => set((state) => ({ ...state, adminAccessToken: data })),
      logoutAdmin: () =>
        set(() => ({
          adminAccessToken: '',
          adminRefreshToken: undefined,
          adminUser: {} as IUser,
        })),
    }),
    {
      name: 'admin-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useAdminStore = createSelectorFunctions(useBaseAdminStore);
