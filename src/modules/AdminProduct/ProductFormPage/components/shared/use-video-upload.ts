import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import * as tus from 'tus-js-client';

import { createVideo } from '@/api/video/requests';
import type { ApiAdminVideoItem } from '@/api/video/types';
import {
  BUSY_STATUSES,
  type UploadFormState,
  type UploadState,
  validateVideoFile,
} from '@/modules/AdminVideo/VideoPage/components/upload-types';

interface UseVideoUploadOptions {
  onSuccess: (video: ApiAdminVideoItem) => void;
  onCancel: () => void;
}

export function useVideoUpload({ onSuccess, onCancel }: UseVideoUploadOptions) {
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });
  const [form, setForm] = useState<UploadFormState>({ name: '', description: '', tag: '' });
  const [nameError, setNameError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation('adminPage');

  const isBusy = BUSY_STATUSES.has(uploadState.status);
  const showDropzone = uploadState.status === 'idle' || uploadState.status === 'selected';
  const showProgress = ['preparing', 'uploading', 'paused', 'processing'].includes(uploadState.status);

  useEffect(() => {
    const isActive = uploadState.status === 'uploading' || uploadState.status === 'paused';
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    if (isActive) window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [uploadState.status]);

  function reset() {
    setUploadState({ status: 'idle' });
    setForm({ name: '', description: '', tag: '' });
    setNameError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFileSelect(file: File) {
    const err = validateVideoFile(file, t);
    setUploadState({ status: 'selected', file, error: err ?? undefined });
  }

  async function saveToDb(bunnyVideoId: string) {
    setUploadState({ status: 'processing' });
    try {
      const dbVideo = await createVideo({
        name: form.name,
        guid: bunnyVideoId,
        thumbnail: '',
        description: form.description,
        type: 'hero',
        tag: form.tag,
      });
      onSuccess(dbVideo);
    } catch {
      setUploadState({
        status: 'error',
        phase: 'saving',
        message: t('saveFailed'),
        canRetry: true,
        bunnyVideoId,
      });
    }
  }

  async function startUpload() {
    if (!form.name.trim()) {
      setNameError(t('nameRequired'));
      return;
    }
    setNameError('');
    if (uploadState.status !== 'selected' || uploadState.error) return;

    const selectedFile = uploadState.file;
    setUploadState({ status: 'preparing' });

    try {
      const credRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.name }),
      });
      if (!credRes.ok) {
        const errBody = (await credRes.json().catch(() => ({}))) as { message?: string; error?: string };
        throw new Error(errBody.message ?? errBody.error ?? `${t('initFailed')} (${credRes.status})`);
      }
      const { data: credData } = (await credRes.json()) as {
        data: { videoId: string; libraryId: string; expirationTime: number; signature: string };
      };
      const { videoId: bunnyVideoId, libraryId, expirationTime, signature } = credData;

      const tusInstance = new tus.Upload(selectedFile, {
        endpoint: process.env.NEXT_PUBLIC_BUNNY_TUS_ENDPOINT ?? 'https://video.bunnycdn.com/tusupload',
        retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: String(expirationTime),
          VideoId: bunnyVideoId,
          LibraryId: libraryId,
        },
        metadata: { filetype: selectedFile.type, title: form.name },
        onProgress(bytesUploaded, bytesTotal) {
          const progress = Math.round((bytesUploaded / bytesTotal) * 100);
          setUploadState((prev) => ({
            status: 'uploading',
            progress,
            bytesUploaded,
            bytesTotal,
            tusInstance: (prev as { tusInstance?: tus.Upload }).tusInstance ?? tusInstance,
          }));
        },
        onSuccess() {
          saveToDb(bunnyVideoId).catch(() => null);
        },
        onError(error) {
          setUploadState({ status: 'error', phase: 'upload', message: error.message, canRetry: true });
        },
      });

      const prev = await tusInstance.findPreviousUploads();
      if (prev.length) tusInstance.resumeFromPreviousUpload(prev[0]);
      tusInstance.start();
      setUploadState({
        status: 'uploading',
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: selectedFile.size,
        tusInstance,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : t('genericError');
      setUploadState({ status: 'error', phase: 'upload', message, canRetry: true });
    }
  }

  function handlePause() {
    if (uploadState.status !== 'uploading') return;
    uploadState.tusInstance.abort();
    setUploadState({ status: 'paused', progress: uploadState.progress, tusInstance: uploadState.tusInstance });
  }

  function handleResume() {
    if (uploadState.status !== 'paused') return;
    uploadState.tusInstance.start();
    setUploadState({
      status: 'uploading',
      progress: uploadState.progress,
      bytesUploaded: 0,
      bytesTotal: 0,
      tusInstance: uploadState.tusInstance,
    });
  }

  function handleCancel() {
    if (uploadState.status === 'uploading' || uploadState.status === 'paused') {
      uploadState.tusInstance.abort();
    }
    reset();
    onCancel();
  }

  return {
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
  };
}
