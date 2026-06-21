import { useQueryClient } from '@tanstack/react-query';
import { Upload, Video } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import * as tus from 'tus-js-client';

import { useTourGuideMoments, useTourGuideMomentsInfinite } from '@/api/tour-guide/queries';
import { createTourGuideMoment, updateTourGuideMoment } from '@/api/tour-guide/requests';
import type { ITourGuideMoment } from '@/api/tour-guide/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { TextArea } from '@/components/ui/textarea';
import { useAlertStore } from '@/stores/use-alert-store';

import { ProgressCircle } from './moments-upload-progress-circle';

type UploadPhase = 'idle' | 'selected' | 'preparing' | 'uploading' | 'done' | 'saving' | 'error';

interface AddMomentSheetProps {
  open: boolean;
  onClose: () => void;
  guideId: string;
  editMoment?: ITourGuideMoment;
}

function extractGuidFromEmbedUrl(embedUrl: string): string | null {
  try {
    const parts = embedUrl.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.split('?')[0];
  } catch {
    return null;
  }
}

export function AddMomentSheet({ open, onClose, guideId, editMoment }: AddMomentSheetProps) {
  const { t } = useTranslation('guidePage');
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tusRef = useRef<tus.Upload | null>(null);
  const bunnyVideoIdRef = useRef<string | null>(null);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [errorPhase, setErrorPhase] = useState<'upload' | 'saving' | null>(null);

  useEffect(() => {
    if (open && editMoment) {
      setName(editMoment.name || editMoment.title);
      setCaption(editMoment.description || '');
      setFile(null);
      setPhase('done');
      setProgress(0);
      setErrorPhase(null);
      const guid = extractGuidFromEmbedUrl(editMoment.embedUrl);
      bunnyVideoIdRef.current = guid;
    } else if (open && !editMoment) {
      setName('');
      setCaption('');
      setFile(null);
      setPhase('idle');
      setProgress(0);
      setErrorPhase(null);
      bunnyVideoIdRef.current = null;
    }
  }, [open, editMoment]);

  const reset = () => {
    tusRef.current = null;
    bunnyVideoIdRef.current = null;
    setName('');
    setNameError('');
    setCaption('');
    setFile(null);
    setPhase('idle');
    setProgress(0);
    setErrorPhase(null);
  };

  const handleClose = () => {
    tusRef.current?.abort();
    reset();
    onClose();
  };

  async function doSave(savedName: string, savedCaption: string, videoId: string) {
    setPhase('saving');
    setErrorPhase(null);
    try {
      if (editMoment) {
        await updateTourGuideMoment(guideId, editMoment.id, {
          name: savedName,
          guid: videoId,
          thumbnail: '',
          description: savedCaption || undefined,
          tourGuideId: guideId,
        });
        await queryClient.invalidateQueries({ queryKey: useTourGuideMomentsInfinite.getKey() });
        await queryClient.invalidateQueries({ queryKey: useTourGuideMoments.getKey() });
        useAlertStore.getState().addAlert({ type: 'success', title: t('manageMomentsSheet.editSuccess') });
      } else {
        await createTourGuideMoment(guideId, {
          name: savedName,
          guid: videoId,
          thumbnail: '',
          description: savedCaption || undefined,
          tourGuideId: guideId,
        });
        await queryClient.invalidateQueries({ queryKey: useTourGuideMomentsInfinite.getKey() });
        await queryClient.invalidateQueries({ queryKey: useTourGuideMoments.getKey() });
        useAlertStore.getState().addAlert({ type: 'success', title: t('manageMomentsSheet.addMoment') });
      }
      handleClose();
    } catch {
      setPhase('error');
      setErrorPhase('saving');
      useAlertStore.getState().addAlert({
        type: 'error',
        title: editMoment ? t('manageMomentsSheet.editFailed') : t('manageMomentsSheet.saveFailed'),
      });
    }
  }

  async function startTusUpload(selectedFile: File) {
    setPhase('preparing');
    setErrorPhase(null);
    try {
      const credRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: selectedFile.name }),
      });
      if (!credRes.ok) throw new Error(`Upload init failed (${credRes.status})`);
      const { data: cred } = (await credRes.json()) as {
        data: { videoId: string; libraryId: string; expirationTime: number; signature: string };
      };
      const { videoId, libraryId, expirationTime, signature } = cred;
      bunnyVideoIdRef.current = videoId;

      const tusInstance = new tus.Upload(selectedFile, {
        endpoint: process.env.NEXT_PUBLIC_BUNNY_TUS_ENDPOINT ?? 'https://video.bunnycdn.com/tusupload',
        retryDelays: [0, 3000, 5000, 10000],
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: String(expirationTime),
          VideoId: videoId,
          LibraryId: libraryId,
        },
        metadata: { filetype: selectedFile.type, title: selectedFile.name },
        onProgress(uploaded, total) {
          setProgress(Math.round((uploaded / total) * 100));
          setPhase('uploading');
        },
        onSuccess() {
          setProgress(100);
          if (bunnyVideoIdRef.current) {
            doSave(name.trim(), caption, bunnyVideoIdRef.current);
          } else {
            setPhase('error');
            setErrorPhase('upload');
          }
        },
        onError(err) {
          setPhase('error');
          setErrorPhase('upload');
          useAlertStore.getState().addAlert({ type: 'error', title: t('manageMomentsSheet.uploadFailed') });
          console.error('TUS error:', err);
        },
      });

      tusRef.current = tusInstance;
      tusInstance.start();
      setPhase('uploading');
    } catch (err) {
      setPhase('error');
      setErrorPhase('upload');
      useAlertStore.getState().addAlert({ type: 'error', title: t('manageMomentsSheet.uploadFailed') });
      console.error('TUS init error:', err);
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = '';
    if (!selected) return;

    if (selected.size > 500 * 1024 * 1024) {
      useAlertStore.getState().addAlert({ type: 'error', title: t('manageMomentsSheet.fileTooLarge') });
      return;
    }
    if (!['video/mp4', 'video/webm'].includes(selected.type)) {
      useAlertStore.getState().addAlert({ type: 'error', title: t('manageMomentsSheet.invalidFormat') });
      return;
    }

    setFile(selected);
    setPhase('selected');
    setProgress(0);
    setErrorPhase(null);
    bunnyVideoIdRef.current = null;
  };

  const handleSave = () => {
    if (isBusy) return;

    if (!name.trim()) {
      setNameError(t('manageMomentsSheet.nameRequired'));
      return;
    }
    setNameError('');

    if (phase === 'selected' && file) {
      startTusUpload(file);
    } else if (phase === 'done') {
      if (bunnyVideoIdRef.current) {
        doSave(name.trim(), caption, bunnyVideoIdRef.current);
      } else {
        setPhase('error');
        setErrorPhase('upload');
      }
    } else if (phase === 'error') {
      if (errorPhase === 'saving' && bunnyVideoIdRef.current) {
        doSave(name.trim(), caption, bunnyVideoIdRef.current);
      } else if (file) {
        startTusUpload(file);
      }
    }
  };

  const isBusy = phase === 'preparing' || phase === 'uploading' || phase === 'saving';
  const isSaveDisabled = phase === 'idle' || isBusy;

  const renderUploadContent = () => {
    if (isBusy) {
      return (
        <div className="absolute inset-0 bg-neutral-black/70 flex flex-col items-center justify-center gap-2">
          {phase === 'preparing' && (
            <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          )}
          {phase === 'uploading' && <ProgressCircle progress={progress} />}
          {phase === 'saving' && <Spinner size="2rem" className="text-white" />}
          <p className="text-[12px] text-white font-medium">
            {phase === 'preparing' && t('manageMomentsSheet.preparing')}
            {phase === 'uploading' && t('manageMomentsSheet.uploading', { progress })}
            {phase === 'saving' && 'Saving...'}
          </p>
          {file && (
            <p className="absolute bottom-2 left-3 right-3 text-[11px] text-white/60 truncate text-center">
              {file.name}
            </p>
          )}
        </div>
      );
    }

    if ((phase === 'selected' || phase === 'done' || phase === 'error') && file) {
      return (
        <div className="flex flex-col items-center justify-center gap-1.5 px-4 text-center">
          <Video size={22} className={phase === 'error' ? 'text-rose-500' : 'text-brand-500'} />
          <p className="text-[12px] text-slate-700 font-medium truncate w-full">{file.name}</p>
          <p className="text-[11px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
          <p className="text-[11px] text-slate-400/80">
            {phase === 'error'
              ? t('manageMomentsSheet.uploadFailed')
              : t('manageMomentsSheet.uploadVideo').split('(')[0].trim()}
          </p>
        </div>
      );
    }

    if (phase === 'done' && !file && editMoment) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center bg-brand-500/[0.03]">
          {editMoment.thumbnail ? (
            <Image
              src={editMoment.thumbnail}
              alt={editMoment.title}
              fill
              className="object-cover opacity-60"
              sizes="45vw"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-800" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 text-white">
            <Video size={24} className="text-white" />
            <p className="text-[12px] font-semibold truncate w-full">{editMoment.name || editMoment.title}</p>
            <p className="text-[11px] text-white/80">
              {t('manageMomentsSheet.uploadVideo').split('(')[0].trim()} (Thay đổi)
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <Upload size={24} className="text-slate-400" />
        <p className="text-[12px] text-slate-400 text-center px-4">{t('manageMomentsSheet.uploadVideo')}</p>
      </>
    );
  };

  const saveButtonContent = () => {
    if (phase === 'preparing' || phase === 'uploading') {
      return (
        <span className="flex items-center justify-center gap-1.5">
          <Spinner size="0.875rem" className="text-white" />
          {phase === 'preparing' ? t('manageMomentsSheet.preparing') : t('manageMomentsSheet.uploading', { progress })}
        </span>
      );
    }
    if (phase === 'saving') {
      return (
        <span className="flex items-center justify-center gap-1.5">
          <Spinner size="0.875rem" className="text-white" />
          Saving...
        </span>
      );
    }
    if (phase === 'error') {
      return errorPhase === 'saving' ? t('manageMomentsSheet.retrySave') : t('manageMomentsSheet.retry');
    }
    return t('manageMomentsSheet.save');
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl p-0 flex flex-col max-h-[80vh] bg-[#F8FAFC] border-t border-slate-200/80 shadow-2xl"
        style={{
          left: 'max(0px, calc(50% - 215px))',
          right: 'max(0px, calc(50% - 215px))',
        }}
      >
        <div className="relative h-6 flex items-center justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-200" />
        </div>

        <div className="sticky top-0 z-10 px-6 pb-4 border-b border-slate-100 bg-white/85 backdrop-blur-md shrink-0">
          <SheetTitle className="text-[15px] font-semibold text-neutral-black">
            {editMoment ? t('manageMomentsSheet.editMomentTitle') : t('manageMomentsSheet.addMomentTitle')}
          </SheetTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
          {/* Video upload area */}
          <div
            onClick={() => {
              if (isBusy) return;
              if (phase !== 'idle') {
                tusRef.current?.abort();
                bunnyVideoIdRef.current = null;
                setProgress(0);
              }
              fileInputRef.current?.click();
            }}
            className={`relative w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 overflow-hidden transition-colors ${
              isBusy
                ? 'cursor-default border-slate-200 bg-slate-900'
                : 'cursor-pointer hover:border-brand-400 bg-slate-50 border-slate-200'
            } ${phase === 'selected' || phase === 'done' ? 'border-brand-400 bg-brand-50/10' : ''} ${
              phase === 'error' ? 'border-rose-300 bg-rose-50/10' : ''
            }`}
          >
            {renderUploadContent()}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Name — required */}
          <div className="space-y-1.5">
            <label className="admin-form-label">
              {t('manageMomentsSheet.nameLabel')}
              <span className="text-rose-500">*</span>
            </label>
            <Input
              size="sm"
              fullWidth
              maxLength={100}
              value={name}
              disabled={isBusy}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError('');
              }}
              placeholder={t('manageMomentsSheet.namePlaceholder')}
              className="bg-slate-50/30 border-slate-200 rounded-xl"
            />
            {nameError && <p className="text-xs text-rose-500">{nameError}</p>}
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <label className="admin-form-label">{t('manageMomentsSheet.captionLabel')}</label>
            <TextArea
              fullWidth
              maxLength={150}
              rows={2}
              value={caption}
              disabled={isBusy}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t('manageMomentsSheet.captionPlaceholder')}
              className="resize-none rounded-xl border-slate-200 bg-slate-50/30 min-h-0 py-2.5 px-3.5 text-[13px]"
            />
            <p className="text-[11px] text-slate-400 text-right">{caption.length}/150</p>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 px-6 py-4 border-t border-slate-100 bg-white/90 backdrop-blur-md flex gap-3 shrink-0">
          <Button
            variant="outline"
            rounded="md"
            blur={false}
            fullWidth
            size="icon"
            disabled={phase === 'saving'}
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold border-slate-200 text-slate-700"
          >
            {t('manageMomentsSheet.cancel')}
          </Button>
          <Button
            variant="dark"
            rounded="md"
            blur={false}
            fullWidth
            size="icon"
            disabled={isSaveDisabled}
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold"
          >
            {saveButtonContent()}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
