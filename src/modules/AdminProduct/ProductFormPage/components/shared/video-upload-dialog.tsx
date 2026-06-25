import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Upload, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import type { ApiAdminVideoItem } from '@/api/video/types';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { UploadDropzone } from '@/modules/AdminVideo/VideoPage/components/upload-dropzone';
import { UploadProgress } from '@/modules/AdminVideo/VideoPage/components/upload-progress';

import { UploadDialogActions } from './upload-dialog-actions';
import { useVideoUpload } from './use-video-upload';

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: (video: ApiAdminVideoItem) => void;
}

export function VideoUploadDialog({ open, onOpenChange, onUploadSuccess }: VideoUploadDialogProps) {
  const { t } = useTranslation('adminPage');
  const {
    uploadState,
    setUploadState,
    form,
    setForm,
    nameError,
    setNameError,
    fileInputRef,
    isBusy,
    showDropzone,
    showProgress,
    reset,
    handleFileSelect,
    handlePause,
    handleResume,
    handleCancel,
    startUpload,
    saveToDb,
  } = useVideoUpload({
    onSuccess: (video) => {
      onUploadSuccess(video);
      onOpenChange(false);
    },
    onCancel: () => onOpenChange(false),
  });

  function handleOpenChange(value: boolean) {
    if (!value && isBusy) return;
    if (!value) reset();
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 w-full max-w-[440px] translate-x-[-50%] translate-y-[-50%]',
            'bg-white rounded-2xl shadow-xl ring-1 ring-black/8 overflow-hidden',
            'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]'
          )}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                <Upload size={13} className="text-rose-500" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{t('videoUploadNewTitle')}</p>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{t('videoUploadLimitDesc')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isBusy}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-3">
            {/* Tên video — full width vì quan trọng nhất */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">
                {t('videoNameLabel')} <span className="text-rose-500">*</span>
              </label>
              <Input
                size="sm"
                placeholder={t('videoNamePlaceholder')}
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                  if (nameError) setNameError('');
                }}
                disabled={isBusy}
              />
              {nameError && <p className="text-xs text-rose-500">{t('nameRequired')}</p>}
            </div>

            {/* Mô tả + Tag — cùng hàng, tiết kiệm chiều cao */}
            <div className="grid grid-cols-[1fr_160px] gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">{t('descriptionLabel')}</label>
                <TextArea
                  className="text-sm rounded-xl resize-none"
                  rows={2}
                  placeholder={t('descriptionPlaceholder')}
                  value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  disabled={isBusy}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">{t('tagsLabel')}</label>
                <Input
                  size="sm"
                  placeholder={t('tagsPlaceholder')}
                  value={form.tag}
                  onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                  disabled={isBusy}
                />
              </div>
            </div>

            {showDropzone && (
              <UploadDropzone
                uploadState={uploadState}
                fileInputRef={fileInputRef}
                onDrop={handleFileSelect}
                onFileChange={handleFileSelect}
              />
            )}

            {showProgress && <UploadProgress uploadState={uploadState} />}

            {uploadState.status === 'error' && (
              <div className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-2.5">
                <p className="text-xs text-rose-600 font-medium">
                  {uploadState.phase === 'saving' ? t('errorSavingInfo') : t('errorUploading')}
                </p>
                <p className="text-xs text-rose-500 mt-0.5">{uploadState.message}</p>
              </div>
            )}
          </div>

          {/* Footer / Actions — tách biệt rõ khỏi body */}
          <div className="px-5 pb-5 pt-1">
            <UploadDialogActions
              uploadState={uploadState}
              onClose={() => handleOpenChange(false)}
              onStart={() => {
                startUpload().catch(() => null);
              }}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
              onRetrySave={(id) => {
                saveToDb(id).catch(() => null);
              }}
              onRetryUpload={() => setUploadState({ status: 'idle' })}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
