import type { ReactNode } from 'react';
import React from 'react';

import type { FCC } from '@/types';

interface Props {
  children: ReactNode;
}
const MainLayout: FCC<Props> = ({ children }) => {
  return (
    <div className="bg-slate-900 flex justify-center items-center min-h-screen">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[100dvh] overflow-hidden bg-white shadow-2xl">
        <main className="h-full overflow-hidden scrollbar-hide">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
