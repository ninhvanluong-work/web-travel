import type { ReactNode } from 'react';
import React, { useState } from 'react';

import type { FCC } from '@/types';

interface Props {
  children: ReactNode;
}

const MainLayout: FCC<Props> = ({ children }) => {
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  return (
    <div className="bg-slate-900 flex justify-center items-center min-h-dvh">
      <div className="container relative h-dvh min-[768px]:h-[850px] bg-white shadow-2xl overflow-hidden pointer-events-auto">
        <main
          className={`h-full scrollbar-hide ${isKeyboardMode ? 'overflow-auto' : 'overflow-hidden'}`}
          onFocusCapture={() => setIsKeyboardMode(true)}
          onBlurCapture={() => setIsKeyboardMode(false)}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
