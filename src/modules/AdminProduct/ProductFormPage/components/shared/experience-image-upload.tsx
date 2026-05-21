import { ImageIcon, Loader2, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { uploadImage } from '@/api/upload';
import { Input } from '@/components/ui/input';

export function ExperienceImageUpload({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className="w-full aspect-[4/3] sm:aspect-[16/9] rounded-[14px] overflow-hidden border border-slate-200 shadow-sm bg-slate-50 flex flex-col items-center justify-center relative cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all group"
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              <ImageIcon size={20} className="text-white" />
              <span className="text-[11px] font-medium text-white">Đổi ảnh</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 group-hover:text-brand-500 transition-colors">
            {uploading ? <Loader2 size={24} className="animate-spin text-brand-500" /> : <ImageIcon size={24} />}
            <span className="text-[12px] font-medium">{uploading ? 'Đang tải...' : 'Tải ảnh lên'}</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      <div className="relative">
        <Input
          size="sm"
          placeholder="Hoặc dán URL ảnh trực tiếp..."
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="pl-3 pr-8 text-[12px] h-9 bg-slate-50/80 border-slate-200 hover:bg-white focus:bg-white focus:border-brand-400 transition-all shadow-sm w-full"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
