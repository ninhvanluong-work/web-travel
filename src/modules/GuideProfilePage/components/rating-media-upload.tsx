import { ImageIcon, RotateCcw, VideoIcon, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useRef } from 'react';

import { Spinner } from '@/components/ui/spinner';

import type { MediaQueueItem } from './use-rating-media-queue';
import { useRatingMediaQueue } from './use-rating-media-queue';

export type { MediaQueueItem };

interface RatingMediaUploadProps {
  onChange: (items: MediaQueueItem[]) => void;
}

export default function RatingMediaUpload({ onChange }: RatingMediaUploadProps) {
  const { t } = useTranslation('guidePage');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { items, canAddMore, addFiles, removeItem, retryItem } = useRatingMediaQueue(onChange);

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
              {item.mediaType === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.objectUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <VideoIcon size={20} className="text-white/60" />
                </div>
              )}

              {item.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1">
                  <Spinner size="0.875rem" className="text-white" />
                  <span className="text-white text-[9px] font-medium">{item.progress}%</span>
                </div>
              )}

              {item.status === 'error' && (
                <div className="absolute inset-0 border-2 border-red-500 rounded-lg bg-black/50 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => retryItem(item.id)}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <RotateCcw size={14} className="text-white" />
                    <span className="text-white text-[9px]">Retry</span>
                  </button>
                </div>
              )}

              {item.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center"
                >
                  <X size={9} className="text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-[68px] border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-brand-400 hover:text-brand-400 transition-colors"
        >
          <div className="flex gap-2">
            <ImageIcon size={16} />
            <VideoIcon size={16} />
          </div>
          <span className="text-[11px]">{t('ratingSheet.addMedia', { count: items.length })}</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/quicktime"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length) addFiles(files);
        }}
      />
    </div>
  );
}
