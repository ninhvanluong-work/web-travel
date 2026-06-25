import { ImageIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useRef, useState } from 'react';

import { uploadImage } from '@/api/upload';

export function BannerImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { t } = useTranslation('adminPage');

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
    <>
      <div
        className="relative w-full aspect-video rounded-xl border border-dashed border-slate-300 bg-slate-50/80 overflow-hidden cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-all group shadow-sm flex items-center justify-center"
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-white text-[13px] font-medium px-4 py-2 bg-black/40 rounded-lg border border-white/20 shadow-lg">
                {t('changeImage')}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2.5 text-slate-400 group-hover:text-brand-500 transition-colors p-4 text-center">
            {uploading ? (
              <Loader2 size={28} className="animate-spin" />
            ) : (
              <ImageIcon size={28} className="text-slate-300 group-hover:text-brand-400 transition-colors" />
            )}
            <div>
              <p className="text-[13px] font-semibold text-slate-600 group-hover:text-brand-600">
                {uploading ? t('uploading') : t('clickToUploadImage')}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{t('supportsImages')}</p>
            </div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </>
  );
}
