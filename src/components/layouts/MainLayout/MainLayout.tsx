import type { ReactNode } from 'react';
import React from 'react';

import type { FCC } from '@/types';

interface Props {
  children: ReactNode;
}
const MainLayout: FCC<Props> = ({ children }) => {
  return (
    <div className="bg-slate-900 flex justify-center items-center min-h-screen">
      <div className="relative w-full max-w-[430px] h-[100dvh] min-[768px]:h-[850px] bg-white min-[768px]:rounded-[3rem] min-[768px]:border-[12px] min-[768px]:border-black shadow-2xl overflow-hidden pointer-events-auto">
        <main className="h-full overflow-y-auto scrollbar-hide">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
