import type * as tus from 'tus-js-client';

export const ALLOWED_VIDEO_TYPES = ['video/mp4'];
export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

export interface UploadFormState {
  name: string;
  description: string;
  tag: string;
}

export type UploadState =
  | { status: 'idle' }
  | { status: 'selected'; file: File; error?: string }
  | { status: 'preparing' }
  | { status: 'uploading'; progress: number; bytesUploaded: number; bytesTotal: number; tusInstance: tus.Upload }
  | { status: 'paused'; progress: number; tusInstance: tus.Upload }
  | { status: 'processing' }
  | { status: 'success'; videoId: string; videoName: string }
  | { status: 'error'; phase: 'upload'; message: string; canRetry: true }
  | { status: 'error'; phase: 'saving'; message: string; canRetry: true; bunnyVideoId: string };

export const BUSY_STATUSES = new Set(['preparing', 'uploading', 'paused', 'processing']);

export function validateVideoFile(file: File, t: (key: string) => string): string | null {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) return t('invalidFileType');
  if (file.size > MAX_VIDEO_SIZE_BYTES) return t('fileTooLarge');
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
