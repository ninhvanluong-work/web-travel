import type { ReactNode } from 'react';
import React from 'react';

import type { FCC } from '@/types';

interface Props {
  children: ReactNode;
}
const MainLayout: FCC<Props> = ({ children }) => {
  return (
    <div className="bg-slate-900 flex justify-center items-center min-h-screen">
      <div className="container relative h-[100vh] supports-[height:100dvh]:h-[100dvh] min-[768px]:h-[850px] bg-white shadow-2xl overflow-hidden pointer-events-auto">
        <main className="h-full overflow-hidden scrollbar-hide">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
