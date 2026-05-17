import { request } from '@/api/axios';

import type { UploadResponse } from './types';

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await request.post<UploadResponse>('/upload/img', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data.url;
}
