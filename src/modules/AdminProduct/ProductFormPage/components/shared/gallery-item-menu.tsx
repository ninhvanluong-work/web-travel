import { MoreVertical } from 'lucide-react';
import { useState } from 'react';

import { Icons } from '@/assets/icons';

interface GalleryItemMenuProps {
  onMoveTop: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onRemove: () => void;
}

export function GalleryItemMenu({ onMoveTop, onMoveLeft, onMoveRight, onRemove }: GalleryItemMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-1.5 right-1.5 z-20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-0.5 rounded bg-black/30 text-white hover:bg-black/50 transition-colors"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-6 w-36 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-30 text-xs">
            <button
              type="button"
              onClick={() => {
                onMoveTop();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700"
            >
              <Icons.up size={12} /> Lên đầu
            </button>
            {onMoveLeft && (
              <button
                type="button"
                onClick={() => {
                  onMoveLeft();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700"
              >
                <Icons.chevronLeft size={12} /> Sang trái
              </button>
            )}
            {onMoveRight && (
              <button
                type="button"
                onClick={() => {
                  onMoveRight();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700"
              >
                <Icons.chevronRight size={12} /> Sang phải
              </button>
            )}
            <div className="border-t border-gray-100" />
            <button
              type="button"
              onClick={() => {
                onRemove();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-500"
            >
              <Icons.trash size={12} /> Xóa ảnh
            </button>
          </div>
        </>
      )}
    </div>
  );
}
