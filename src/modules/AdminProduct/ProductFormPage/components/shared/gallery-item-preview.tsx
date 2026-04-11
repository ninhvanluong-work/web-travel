import { Loader2 } from 'lucide-react';

import { Icons } from '@/assets/icons';

interface GalleryItemPreviewProps {
  displayUrl: string | null;
  index: number;
  uploading: boolean;
  error: string | null;
  onPickFile: () => void;
  onRemove: () => void;
  onRetry: () => void;
}

export function GalleryItemPreview({
  displayUrl,
  index,
  uploading,
  error,
  onPickFile,
  onRemove,
  onRetry,
}: GalleryItemPreviewProps) {
  if (!displayUrl) {
    return (
      <button
        type="button"
        onClick={onPickFile}
        disabled={uploading}
        className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors disabled:opacity-50"
      >
        <Icons.imageIcon size={20} className="text-gray-300" />
        <span className="text-[11px]">Ảnh {index + 1}</span>
      </button>
    );
  }

  return (
    <>
      <img
        src={displayUrl}
        alt={`Ảnh ${index + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {uploading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-white" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center gap-1.5">
          <span className="text-white text-xs font-medium">Tải lỗi</span>
          <button
            type="button"
            onClick={onRetry}
            className="px-2.5 py-1 bg-white rounded text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Tải lại tấm này
          </button>
        </div>
      )}
      {!uploading && !error && (
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onPickFile}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 shadow"
          >
            <Icons.upload size={11} />
            Đổi
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 rounded-lg text-xs font-medium text-white hover:bg-red-600 shadow"
          >
            <Icons.trash size={11} />
            Xoá
          </button>
        </div>
      )}
    </>
  );
}
