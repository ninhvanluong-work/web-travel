import { GripVertical, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { uploadImage } from '@/api/upload';
import { Icons } from '@/assets/icons';

import { GalleryItemMenu } from './gallery-item-menu';
import { GalleryItemPreview } from './gallery-item-preview';

interface GalleryItemProps {
  img: { url: string };
  index: number;
  isThumbnail?: boolean;
  isDragOver?: boolean;
  onChange: (url: string) => void;
  onRemove: () => void;
  onMoveTop: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

export function GalleryItem({
  img,
  index,
  isThumbnail = false,
  isDragOver = false,
  onChange,
  onRemove,
  onMoveTop,
  onMoveLeft,
  onMoveRight,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: GalleryItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = localPreview ?? img.url ?? null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setError(null);
    setUploading(true);

    try {
      const url = await uploadImage(file);
      onChange(url);
      setLocalPreview(null);
      URL.revokeObjectURL(preview);
    } catch {
      setError('Tải thất bại');
    } finally {
      setUploading(false);
    }
  };

  const getBorderColor = () => {
    if (isThumbnail) return 'border-amber-400 ring-2 ring-amber-400/40';
    if (isDragOver) return 'border-blue-400 ring-2 ring-blue-400/30';
    return 'border-gray-200';
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden bg-white transition-all ${getBorderColor()}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div className="relative h-32 bg-gray-50">
        <div className="absolute top-1.5 left-1.5 z-10 cursor-grab active:cursor-grabbing p-0.5 rounded bg-black/30 text-white">
          <GripVertical size={12} />
        </div>
        {isThumbnail && (
          <div className="absolute top-1.5 left-8 z-10 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-400 text-white leading-tight whitespace-nowrap">
            Đại diện
          </div>
        )}
        <GalleryItemMenu onMoveTop={onMoveTop} onMoveLeft={onMoveLeft} onMoveRight={onMoveRight} onRemove={onRemove} />
        <GalleryItemPreview
          displayUrl={displayUrl}
          index={index}
          uploading={uploading}
          error={error}
          onPickFile={() => fileInputRef.current?.click()}
          onRemove={onRemove}
          onRetry={() => {
            setError(null);
            fileInputRef.current?.click();
          }}
        />
      </div>

      <div className="flex items-center gap-1.5 px-2 py-2 border-t border-gray-100 bg-white">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={11} className="animate-spin" /> : <Icons.upload size={11} />}
          {uploading ? 'Đang tải...' : 'Tải lên'}
        </button>
        <input
          type="text"
          value={img.url}
          onChange={(e) => onChange(e.target.value)}
          placeholder={error ? 'Tải thất bại' : 'CDN URL...'}
          readOnly={uploading}
          className="flex-1 min-w-0 text-[11px] py-1.5 px-2 rounded-lg border border-gray-200 text-gray-600 focus:outline-none focus:border-blue-400 bg-transparent disabled:opacity-50"
          style={error ? { borderColor: '#f87171' } : undefined}
        />
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
        >
          <Icons.trash size={13} />
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
