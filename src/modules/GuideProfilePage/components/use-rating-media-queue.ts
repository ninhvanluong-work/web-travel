import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as tus from 'tus-js-client';

import { uploadImage } from '@/api/upload';
import { createVideo } from '@/api/video/requests';
import { env } from '@/lib/const';
import { useAlertStore } from '@/stores/use-alert-store';
import { API_ROUTE } from '@/types';

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;

export interface MediaQueueItem {
  id: string;
  mediaType: 'image' | 'video';
  status: 'uploading' | 'error' | 'done';
  progress: number;
  url: string | null;
  objectUrl: string;
  error: string | null;
}

export interface InternalMediaItem extends MediaQueueItem {
  file: File;
  tusInstance?: tus.Upload;
}

function toPublic(list: InternalMediaItem[]): MediaQueueItem[] {
  return list.map(({ file: _f, tusInstance: _t, ...rest }) => rest);
}

export function useRatingMediaQueue(onChange: (items: MediaQueueItem[]) => void) {
  const { t } = useTranslation('guidePage');
  const [items, setItems] = useState<InternalMediaItem[]>([]);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        item.tusInstance?.abort();
        URL.revokeObjectURL(item.objectUrl);
      });
    };
  }, []);

  useEffect(() => {
    onChange(toPublic(items));
  }, [items, onChange]);

  const updateItem = useCallback((id: string, patch: Partial<InternalMediaItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  async function doUploadImage(item: InternalMediaItem) {
    try {
      const url = await uploadImage(item.file);
      updateItem(item.id, { status: 'done', progress: 100, url });
    } catch {
      updateItem(item.id, { status: 'error', error: t('ratingSheet.uploadFailed') });
    }
  }

  async function doUploadVideo(item: InternalMediaItem) {
    try {
      const credRes = await fetch(`${env.API_URL}${API_ROUTE.UPLOAD_VIDEO}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.file.name.substring(0, 50) }),
      });
      if (!credRes.ok) throw new Error(`Init failed (${credRes.status})`);

      const { data: cred } = (await credRes.json()) as {
        data: { videoId: string; libraryId: string; expirationTime: number; signature: string };
      };
      const { videoId: bunnyVideoId, libraryId, expirationTime, signature } = cred;

      const tusInstance = new tus.Upload(item.file, {
        endpoint: process.env.NEXT_PUBLIC_BUNNY_TUS_ENDPOINT ?? 'https://video.bunnycdn.com/tusupload',
        retryDelays: [0, 3000, 5000, 10000],
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: String(expirationTime),
          VideoId: bunnyVideoId,
          LibraryId: libraryId,
        },
        metadata: { filetype: item.file.type, title: item.file.name },
        onProgress(uploaded, total) {
          updateItem(item.id, { progress: Math.round((uploaded / total) * 100) });
        },
        onSuccess: async () => {
          try {
            await createVideo({
              name: item.file.name.substring(0, 50),
              guid: bunnyVideoId,
              thumbnail: '',
              description: 'Review video',
              type: 'normal',
            });
            const url = `https://player.mediadelivery.net/embed/${libraryId}/${bunnyVideoId}`;
            updateItem(item.id, { status: 'done', progress: 100, url });
          } catch {
            updateItem(item.id, { status: 'error', error: t('ratingSheet.saveVideoFailed') });
          }
        },
        onError(err) {
          updateItem(item.id, { status: 'error', error: err.message });
        },
      });

      updateItem(item.id, { tusInstance });
      tusInstance.start();
    } catch (err) {
      updateItem(item.id, {
        status: 'error',
        error: err instanceof Error ? err.message : t('ratingSheet.uploadFailed'),
      });
    }
  }

  function addFiles(files: File[]) {
    const canAdd = MAX_FILES - items.length;
    if (canAdd <= 0) return;

    const toAdd: InternalMediaItem[] = [];
    files.slice(0, canAdd).forEach((file) => {
      if (file.size > MAX_SIZE) {
        useAlertStore.getState().addAlert({ type: 'warning', title: t('ratingSheet.fileTooLarge') });
        return;
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      toAdd.push({
        id,
        file,
        mediaType,
        status: 'uploading',
        progress: 0,
        url: null,
        objectUrl: URL.createObjectURL(file),
        error: null,
      });
    });

    if (!toAdd.length) return;
    setItems((prev) => [...prev, ...toAdd]);

    toAdd.forEach((item) => {
      if (item.mediaType === 'image') {
        void doUploadImage(item);
      } else {
        void doUploadVideo(item);
      }
    });
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const item = prev.find((it) => it.id === id);
      if (item) {
        item.tusInstance?.abort();
        URL.revokeObjectURL(item.objectUrl);
      }
      return prev.filter((it) => it.id !== id);
    });
  }

  function retryItem(id: string) {
    setItems((prev) => {
      const item = prev.find((it) => it.id === id);
      if (!item) return prev;
      const updated: InternalMediaItem = { ...item, status: 'uploading', progress: 0, error: null };
      if (item.mediaType === 'image') void doUploadImage(updated);
      else void doUploadVideo(updated);
      return prev.map((it) => (it.id === id ? updated : it));
    });
  }

  return {
    items,
    canAddMore: items.length < MAX_FILES,
    addFiles,
    removeItem,
    retryItem,
  };
}
