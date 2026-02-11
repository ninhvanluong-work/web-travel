import React from 'react';

import { cn } from '@/lib/utils';

interface VirtualKeyboardProps {
  isVisible: boolean;
  onKeyPress: (key: string) => void;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ isVisible, onKeyPress }) => {
  if (!isVisible) return null;

  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
    ['123', 'space', 'return'],
  ];

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 bg-[#D1D5DB] pt-2 pb-8 px-1 flex flex-col gap-2 z-[60] transition-transform duration-300 animate__animated animate__slideInUp',
        // Only show on desktop (>=768px)
        'hidden min-[768px]:flex'
      )}
    >
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5 justify-center w-full px-1">
          {row.map((key) => {
            let widthClass = 'flex-1';
            if (key === 'space') widthClass = 'flex-[4]';
            if (['shift', 'backspace', 'return', '123'].includes(key)) widthClass = 'flex-[1.5]';

            return (
              <button
                key={key}
                className={cn(
                  'h-11 rounded-[5px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.3)] text-black text-[1.2rem] font-normal active:bg-gray-300 transition-colors flex items-center justify-center select-none',
                  widthClass,
                  ['shift', 'backspace', 'return', '123'].includes(key) ? 'bg-[#B3B6BE] text-sm font-medium' : ''
                )}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onKeyPress(key);
                }}
              >
                {key === 'shift'
                  ? '⇧'
                  : key === 'backspace'
                  ? '⌫'
                  : key === 'return'
                  ? 'Go'
                  : key === 'space'
                  ? ''
                  : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default VirtualKeyboard;
