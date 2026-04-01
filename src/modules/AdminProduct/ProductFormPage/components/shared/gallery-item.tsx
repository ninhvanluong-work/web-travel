import { ImageIcon, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';

interface GalleryItemProps {
  img: { url: string };
  index: number;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export function GalleryItem({ img, index, onChange, onRemove }: GalleryItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div className="relative h-32 bg-gray-50">
        {img.url ? (
          <>
            <img
              src={img.url}
              alt={`Ảnh ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 shadow"
              >
                <Upload size={11} />
                Đổi
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 rounded-lg text-xs font-medium text-white hover:bg-red-600 shadow"
              >
                <Trash2 size={11} />
                Xoá
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors"
          >
            <ImageIcon size={20} className="text-gray-300" />
            <span className="text-[11px]">Ảnh {index + 1}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 px-2 py-2 border-t border-gray-100 bg-white">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
        >
          <Upload size={11} />
          Tải lên
        </button>
        <input
          type="text"
          value={img.url}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Dán URL..."
          className="flex-1 min-w-0 text-[11px] py-1.5 px-2 rounded-lg border border-gray-200 text-gray-600 focus:outline-none focus:border-blue-400 bg-transparent"
        />
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
