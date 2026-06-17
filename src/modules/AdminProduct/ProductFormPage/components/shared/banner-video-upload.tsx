import { Loader2, Upload, Video } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import * as tus from 'tus-js-client';

import { createVideo } from '@/api/video/requests';
import { Button } from '@/components/ui/button';

function getOptimizedEmbedUrl(url: string): string {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('autoplay', 'false');
    urlObj.searchParams.set('loop', 'true');
    urlObj.searchParams.delete('muted');
    return urlObj.toString();
  } catch {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}autoplay=false&loop=true`;
  }
}

const BANNER_MAX_SIZE = 100 * 1024 * 1024;
const BANNER_ALLOWED_TYPES = ['video/mp4', 'video/quicktime'];

type BannerUploadState =
  | { status: 'idle' }
  | { status: 'preparing' }
  | { status: 'uploading'; progress: number; tusInstance: tus.Upload }
  | { status: 'processing' }
  | { status: 'error'; message: string };

export function BannerVideoUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploadState, setUploadState] = useState<BannerUploadState>({ status: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tusRef = useRef<tus.Upload | null>(null);
  const { t } = useTranslation('adminPage');

  useEffect(() => {
    return () => {
      tusRef.current?.abort();
    };
  }, []);

  async function handleFile(file: File) {
    if (!BANNER_ALLOWED_TYPES.includes(file.type)) {
      setUploadState({ status: 'error', message: t('onlyMp4MovSupported') });
      return;
    }
    if (file.size > BANNER_MAX_SIZE) {
      setUploadState({ status: 'error', message: t('fileTooLarge100MB') });
      return;
    }

    setUploadState({ status: 'preparing' });

    try {
      const credRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Product_Video_${Date.now()}` }),
      });
      if (!credRes.ok) throw new Error(`Upload init failed (${credRes.status})`);

      const { data: cred } = (await credRes.json()) as {
        data: { videoId: string; libraryId: string; expirationTime: number; signature: string };
      };
      const { videoId: bunnyVideoId, libraryId, expirationTime, signature } = cred;

      const tusInstance = new tus.Upload(file, {
        endpoint: process.env.NEXT_PUBLIC_BUNNY_TUS_ENDPOINT ?? 'https://video.bunnycdn.com/tusupload',
        retryDelays: [0, 3000, 5000, 10000],
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: String(expirationTime),
          VideoId: bunnyVideoId,
          LibraryId: libraryId,
        },
        metadata: { filetype: file.type, title: file.name },
        onProgress(uploaded, total) {
          setUploadState({ status: 'uploading', progress: Math.round((uploaded / total) * 100), tusInstance });
        },
        onSuccess: async () => {
          setUploadState({ status: 'processing' });
          try {
            await createVideo({
              name: file.name.substring(0, 50),
              guid: bunnyVideoId,
              thumbnail: '',
              description: 'Product banner video',
              type: 'normal',
            });
            onChange(`https://player.mediadelivery.net/embed/${libraryId}/${bunnyVideoId}`);
            setUploadState({ status: 'idle' });
          } catch {
            setUploadState({ status: 'error', message: t('saveFailed') });
          }
        },
        onError(err) {
          setUploadState({ status: 'error', message: err.message });
        },
      });

      tusRef.current = tusInstance;
      tusInstance.start();
      setUploadState({ status: 'uploading', progress: 0, tusInstance });
    } catch (err) {
      setUploadState({
        status: 'error',
        message: err instanceof Error ? err.message : t('genericError'),
      });
    }
  }

  const isBusy =
    uploadState.status === 'preparing' || uploadState.status === 'uploading' || uploadState.status === 'processing';

  const triggerPick = () => fileInputRef.current?.click();

  const getUploadStatusMessage = () => {
    if (uploadState.status === 'uploading') {
      return `${t('uploading')} ${uploadState.progress}%`;
    }
    if (uploadState.status === 'processing') {
      return t('processing');
    }
    return t('initializing');
  };

  const renderDropzone = () => {
    if (value && !isBusy) {
      return (
        <iframe
          src={getOptimizedEmbedUrl(value)}
          className="w-full h-full absolute inset-0 border-0"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      );
    }

    if (isBusy) {
      return (
        <div className="space-y-3 text-center p-4">
          <Loader2 className="animate-spin text-brand-400 mx-auto" size={24} />
          <p className="text-xs font-semibold text-white/80">{getUploadStatusMessage()}</p>
          {uploadState.status === 'uploading' && (
            <div className="w-36 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-brand-400 transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className="flex flex-col items-center justify-center gap-2 p-4 text-center cursor-pointer group w-full h-full"
        onClick={triggerPick}
      >
        <Video size={28} className="text-slate-600 group-hover:text-brand-400 transition-colors" />
        <p className="text-[12px] font-medium text-slate-400 group-hover:text-brand-300 transition-colors">
          {t('clickToSelectVideo')}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Preview / Dropzone */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 flex items-center justify-center">
        {renderDropzone()}
      </div>

      {/* Error */}
      {uploadState.status === 'error' && (
        <p className="text-[11px] text-red-500">
          {uploadState.message}{' '}
          <button type="button" className="underline" onClick={() => setUploadState({ status: 'idle' })}>
            {t('retry')}
          </button>
        </p>
      )}

      {/* Upload button — always visible */}
      <Button
        type="button"
        variant="secondary"
        size="md"
        disabled={isBusy}
        onClick={triggerPick}
        className="w-full gap-2 h-9 text-[13px] bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium shadow-sm"
      >
        <Upload size={14} className="text-slate-400" />
        {value ? t('uploadAnother') : t('startUpload')}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime"
        className="hidden"
        disabled={isBusy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
