import type { ReactNode } from 'react';
import React from 'react';

import type { FCC } from '@/types';

interface Props {
  children: ReactNode;
}
const MainLayout: FCC<Props> = ({ children }) => {
  React.useEffect(() => {
    const setAppHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  return (
    <div className="bg-slate-900 flex justify-center items-center min-h-screen">
      <div className="container relative h-[100dvh] h-[var(--app-height)] min-[768px]:h-[850px] bg-white shadow-2xl overflow-hidden pointer-events-auto">
        <main className="h-full overflow-y-auto scrollbar-hide">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
