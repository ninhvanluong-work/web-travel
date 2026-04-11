import { CheckCircle2, Film, Pause, Play, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as tus from 'tus-js-client';

import { createVideo } from '@/api/video/requests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';

import { UploadDropzone } from './upload-dropzone';
import { UploadProgress } from './upload-progress';
import { BUSY_STATUSES, type UploadFormState, type UploadState, validateVideoFile } from './upload-types';

interface Props {
  onUploaded: () => void;
}

export function VideoUploadCard({ onUploaded }: Props) {
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });
  const [form, setForm] = useState<UploadFormState>({ name: '', description: '', tag: '' });
  const [nameError, setNameError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isActive = uploadState.status === 'uploading' || uploadState.status === 'paused';
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    if (isActive) window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [uploadState.status]);

  function handleFileSelect(file: File) {
    const err = validateVideoFile(file);
    setUploadState({ status: 'selected', file, error: err ?? undefined });
  }

  async function saveToDb(bunnyVideoId: string) {
    setUploadState({ status: 'processing' });
    try {
      const dbVideo = await createVideo({
        name: form.name,
        url: bunnyVideoId,
        thumbnail: '',
        description: form.description,
        type: 'hero',
        tag: form.tag,
      });
      setUploadState({ status: 'success', videoId: dbVideo.id, videoName: form.name });
      onUploaded();
    } catch {
      setUploadState({
        status: 'error',
        phase: 'saving',
        message: 'Lưu thông tin thất bại, vui lòng thử lại.',
        canRetry: true,
        bunnyVideoId,
      });
    }
  }

  async function startUpload() {
    if (!form.name.trim()) {
      setNameError('Tên video không được để trống');
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
        throw new Error(errBody.message ?? errBody.error ?? `Lỗi khởi tạo upload (${credRes.status})`);
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
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.';
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
    setUploadState({ status: 'idle' });
  }

  function handleReset() {
    setUploadState({ status: 'idle' });
    setForm({ name: '', description: '', tag: '' });
    setNameError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const isBusy = BUSY_STATUSES.has(uploadState.status);
  const showDropzone = uploadState.status === 'idle' || uploadState.status === 'selected';
  const showProgress = ['preparing', 'uploading', 'paused', 'processing'].includes(uploadState.status);

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
          <Upload size={13} className="text-rose-500" />
        </span>
        <span className="text-sm font-semibold text-gray-700">Upload Video</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Success */}
        {uploadState.status === 'success' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={40} className="text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Upload thành công!</p>
              <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{uploadState.videoName}</p>
            </div>
            <Button variant="secondary" rounded="md" blur={false} onClick={handleReset} className="px-4 py-2 text-xs">
              Upload video khác
            </Button>
          </div>
        )}

        {uploadState.status !== 'success' && (
          <>
            {/* Form fields */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">
                Tên video <span className="text-rose-500">*</span>
              </label>
              <Input
                size="sm"
                placeholder="VD: Du lịch Hà Giang 2025"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                  if (nameError) setNameError('');
                }}
                disabled={isBusy}
              />
              {nameError && <p className="text-xs text-rose-500">{nameError}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Mô tả</label>
              <TextArea
                className="text-sm rounded-xl"
                rows={2}
                placeholder="Mô tả ngắn về video..."
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                disabled={isBusy}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Tag</label>
              <Input
                size="sm"
                placeholder="VD: miền-bắc, hà-giang"
                value={form.tag}
                onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                disabled={isBusy}
              />
            </div>

            {/* Drop zone */}
            {showDropzone && (
              <UploadDropzone
                uploadState={uploadState}
                fileInputRef={fileInputRef}
                onDrop={handleFileSelect}
                onFileChange={handleFileSelect}
              />
            )}

            {/* Progress */}
            {showProgress && <UploadProgress uploadState={uploadState} />}

            {/* Error */}
            {uploadState.status === 'error' && (
              <div className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-2.5">
                <p className="text-xs text-rose-600 font-medium">
                  {uploadState.phase === 'saving' ? 'Lỗi lưu thông tin' : 'Lỗi upload'}
                </p>
                <p className="text-xs text-rose-500 mt-0.5">{uploadState.message}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              {uploadState.status === 'idle' && (
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed"
                >
                  <Film size={14} />
                  Chọn file để bắt đầu
                </button>
              )}
              {uploadState.status === 'selected' && !uploadState.error && (
                <Button
                  variant="primary"
                  rounded="md"
                  blur={false}
                  fullWidth
                  className="py-2 text-xs"
                  onClick={() => {
                    startUpload().catch(() => null);
                  }}
                >
                  <Upload size={14} className="mr-1.5" />
                  Bắt đầu upload
                </Button>
              )}
              {uploadState.status === 'uploading' && (
                <>
                  <Button
                    variant="secondary"
                    rounded="md"
                    blur={false}
                    className="flex-1 py-2 text-xs"
                    onClick={handlePause}
                  >
                    <Pause size={14} className="mr-1.5" />
                    Tạm dừng
                  </Button>
                  <Button
                    variant="ghost"
                    rounded="md"
                    blur={false}
                    className="text-rose-500 hover:text-rose-600 px-3"
                    onClick={handleCancel}
                  >
                    <X size={14} />
                  </Button>
                </>
              )}
              {uploadState.status === 'paused' && (
                <>
                  <Button
                    variant="primary"
                    rounded="md"
                    blur={false}
                    className="flex-1 py-2 text-xs"
                    onClick={handleResume}
                  >
                    <Play size={14} className="mr-1.5" />
                    Tiếp tục
                  </Button>
                  <Button
                    variant="secondary"
                    rounded="md"
                    blur={false}
                    className="text-rose-500 hover:text-rose-600 border-rose-200 px-4 py-2 text-xs"
                    onClick={handleCancel}
                  >
                    Hủy
                  </Button>
                </>
              )}
              {uploadState.status === 'error' &&
                (uploadState.phase === 'saving' ? (
                  <Button
                    variant="primary"
                    rounded="md"
                    blur={false}
                    fullWidth
                    className="py-2 text-xs"
                    onClick={() => {
                      saveToDb(uploadState.bunnyVideoId).catch(() => null);
                    }}
                  >
                    Thử lại lưu
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    rounded="md"
                    blur={false}
                    fullWidth
                    className="py-2 text-xs"
                    onClick={() => setUploadState({ status: 'idle' })}
                  >
                    Thử lại
                  </Button>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
