import type { UploadState } from './upload-types';
import { formatBytes } from './upload-types';

interface Props {
  uploadState: UploadState;
}

export function UploadProgress({ uploadState }: Props) {
  if (uploadState.status === 'preparing') {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        Đang khởi tạo...
      </div>
    );
  }

  if (uploadState.status === 'processing') {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Đang lưu thông tin...
      </div>
    );
  }

  if (uploadState.status === 'uploading' || uploadState.status === 'paused') {
    const isPaused = uploadState.status === 'paused';
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{isPaused ? 'Đã tạm dừng' : `${uploadState.progress}%`}</span>
          {uploadState.status === 'uploading' && uploadState.bytesTotal > 0 && (
            <span>
              {formatBytes(uploadState.bytesUploaded)} / {formatBytes(uploadState.bytesTotal)}
            </span>
          )}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all ${isPaused ? 'bg-amber-400' : 'bg-indigo-500'}`}
            style={{ width: `${uploadState.progress}%` }}
          />
        </div>
      </div>
    );
  }

  return null;
}
