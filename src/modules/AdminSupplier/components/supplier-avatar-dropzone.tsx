import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useCallback, useRef, useState } from 'react';

import { uploadImage } from '@/api/upload';
import { cn } from '@/lib/utils';

interface SupplierAvatarDropzoneProps {
  value: string;
  onChange: (url: string) => void;
}

export function SupplierAvatarDropzone({ value, onChange }: SupplierAvatarDropzoneProps) {
  const { t } = useTranslation('adminPage');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      setIsUploading(true);
      try {
        const url = await uploadImage(file);
        onChange(url);
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-2xl transition-colors cursor-pointer',
        dragOver ? 'border-brand-400 bg-brand-50/50' : 'border-gray-200 dark:border-gray-700 hover:border-brand-300'
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {value?.startsWith('http') ? (
        <div className="relative h-36 rounded-2xl overflow-hidden">
          <Image src={value} alt="avatar preview" fill className="object-cover" sizes="400px" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="h-36 flex flex-col items-center justify-center gap-2 text-gray-400">
          {isUploading ? (
            <Loader2 size={24} className="animate-spin text-brand-500" />
          ) : (
            <>
              <Upload size={24} />
              <p className="text-xs">{t('dragDropPrompt')}</p>
              <p className="text-[11px] text-gray-300">{t('supportsImages')}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
